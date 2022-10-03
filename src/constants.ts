export const PREFLIGHT_HEADERS = {
  "Access-Control-Allow-Origin": "https://frontrowwithj.github.io",
  "Access-Control-Allow-Methods": "PUT, GET",
} as const;

export const CORS_HEADERS = {
  "Content-Type": "text/plain",
  "Access-Control-Allow-Origin": "https://frontrowwithj.github.io",
} as const;

export const COLLECTION_NAME = "short_url_collection";
export const DB_NAME = "short_url_db";
const SHORTENER_ID = "633a34f94f1b9aaf579f3df2";
export const URL_SHORTENER_QUERY = { _id: SHORTENER_ID } as const;
