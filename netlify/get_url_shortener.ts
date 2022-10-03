import { type Handler } from "@netlify/functions";
import { handleMethodNotAllowed, handlers } from "../src/methodHandlers";
import { methods } from "../src/types";

export const handler: Handler = async (evt) => {
  const httpMethod = evt.httpMethod as methods;
  const methodHandler = handlers[httpMethod];
  if (methodHandler === undefined || httpMethod === "PUT")
    return handleMethodNotAllowed(evt);
  return methodHandler(evt);
};
