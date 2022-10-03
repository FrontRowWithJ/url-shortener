import { MongoClient } from "mongodb";
import {
  DB_NAME,
  COLLECTION_NAME,
  URL_SHORTENER_QUERY,
  CORS_HEADERS,
  PREFLIGHT_HEADERS,
  HASH_LENGTH,
} from "./constants";
import { MethodHandler, methods, URLShortenerDocument } from "./types";

const murmur_32_scramble = (k: number) => {
  k *= 0xcc9e2d51;
  k = (k << 15) | (k >> 17);
  return (k *= 0x1b873593);
};

const hash = (timetable: string) => {
  const arr = new TextEncoder().encode(timetable);
  const remainder = new Uint8Array(arr.length % 4);
  const byteArr = new Uint8Array([...arr, ...remainder]);
  const key = new Uint32Array(byteArr.buffer);
  let h = 0x0f0f0f0f;
  for (let i = key.length - 1; i > -1; i--) {
    h ^= murmur_32_scramble(key[i]);
    h = (h << 13) | (h >> 19);
    h = h * 5 + 0xe6546b64;
  }
  h ^= murmur_32_scramble(0);
  /* Finalize. */
  h ^= key.length * 4;
  h ^= h >> 16;
  h *= 0x85ebca6b;
  h ^= h >> 13;
  h *= 0xc2b2ae35;
  h ^= h >> 16;
  return h.toString(16).padStart(HASH_LENGTH, "0");
};

const handlePUT: MethodHandler = async ({ body: timetableBase64 }) => {
  const client = await new MongoClient(process.env.MONGODB_URI!);
  const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
  if (!timetableBase64) {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: "Hash not present",
    };
  }
  const timetableHash = hash(timetableBase64);
  await collection.updateOne(URL_SHORTENER_QUERY, {
    $set: { [timetableHash]: timetableBase64 },
  });
  await client.close();
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: timetableHash,
  };
};

const handleGET: MethodHandler = async ({ queryStringParameters }) => {
  if (!queryStringParameters)
    return {
      statusCode: 400,
      body: "Where's the hash?",
      headers: CORS_HEADERS,
    };
  const { hash: timetableHash } = queryStringParameters;
  if (!timetableHash) {
    return {
      statusCode: 400,
      body: "No seriously, where's the hash?",
      headers: CORS_HEADERS,
    };
  }
  const client = await new MongoClient(process.env.MONGODB_URI!);
  const database = client.db(DB_NAME);
  const collection = database.collection<URLShortenerDocument>(COLLECTION_NAME);
  const timetableBase64s = await collection.distinct(
    timetableHash,
    URL_SHORTENER_QUERY
  );
  if (timetableBase64s.length === 0) {
    return {
      statusCode: 400,
      body: "URL Not Present",
      headers: CORS_HEADERS,
    };
  }
  return {
    statusCode: 200,
    body: timetableBase64s[0],
    headers: CORS_HEADERS,
  };
};

const handleOPTIONS: MethodHandler = async () => {
  return { statusCode: 200, headers: PREFLIGHT_HEADERS };
};

export const handleMethodNotAllowed: MethodHandler = async ({ httpMethod }) => {
  return {
    statusCode: 405,
    body: `The method "${httpMethod}" is not allowed.`,
    headers: CORS_HEADERS,
  };
};

export const handlers: { [key in methods]: MethodHandler | undefined } = {
  PUT: handlePUT,
  OPTIONS: handleOPTIONS,
  GET: handleGET,
};
