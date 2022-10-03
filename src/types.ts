import { type Handler } from "@netlify/functions";
import { type Response } from "@netlify/functions/dist/function/response";

export type methods = "PUT" | "OPTIONS" | "GET";
export type MethodHandler = (evt: Parameters<Handler>[0]) => Promise<Response>;
export type URLShortenerDocument = { [hash: string]: string };
