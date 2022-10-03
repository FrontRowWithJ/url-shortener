import { type Handler } from "@netlify/functions";
import { type methods } from "../src/types";
import { handlers, handleMethodNotAllowed } from "../src/methodHandlers";

export const handler: Handler = async (evt) => {
  const httpMethod = evt.httpMethod as methods;
  const methodHandler = handlers[httpMethod];
  if (methodHandler === undefined || httpMethod === "GET")
    return handleMethodNotAllowed(evt);
  return methodHandler(evt);
};