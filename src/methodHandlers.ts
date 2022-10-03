import { MongoClient } from "mongodb";
import {
  DB_NAME,
  COLLECTION_NAME,
  URL_SHORTENER_QUERY,
  CORS_HEADERS,
  PREFLIGHT_HEADERS,
} from "./constants";
import { MethodHandler, methods, URLShortenerDocument } from "./types";
import { sha256 } from "crypto-hash";

const handlePUT: MethodHandler = async ({ body: timetableBase64 }) => {
  const client = await new MongoClient(process.env.MONGODB_URI!);
  const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
  const timetableHash = (await sha256(timetableBase64!))
    .split("")
    .filter((_, i) => i % 4 === 0)
    .join("");
  await collection.updateOne(URL_SHORTENER_QUERY, {
    $set: { [timetableHash]: timetableBase64 },
  });
  await client.close();
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: timetableHash,
    isBase64Encoded: false,
  };
};

const handleGET: MethodHandler = async ({ body: timetableHash }) => {
  const client = await new MongoClient(process.env.MONGODB_URI!);
  const database = client.db(DB_NAME);
  const collection = database.collection<URLShortenerDocument>(COLLECTION_NAME);
  const timetableBase64s = await collection.distinct(timetableHash!, {
    [timetableHash!]: { $exists: true },
  });
  if (timetableBase64s.length === 0) {
    return {
      statusCode: 400,
      body: "URL Not Present",
      headers: CORS_HEADERS,
      isBase64Encoded: false,
    };
  }
  return {
    statusCode: 200,
    body: timetableBase64s[0],
    headers: CORS_HEADERS,
    isBase64Encoded: false,
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
    isBase64Encoded: false,
  };
};

export const handlers: { [key in methods]: MethodHandler | undefined } = {
  PUT: handlePUT,
  OPTIONS: handleOPTIONS,
  GET: handleGET,
};
