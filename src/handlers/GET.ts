import { MongoClient } from "mongodb";
import {
  CORS_HEADERS,
  DB_NAME,
  COLLECTION_NAME,
  URL_SHORTENER_QUERY,
} from "../constants";
import { MethodHandler, URLShortenerDocument } from "../types";

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

export default handleGET;
