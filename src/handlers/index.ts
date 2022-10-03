import { CORS_HEADERS } from "../constants";
import { methods, MethodHandler } from "../types";
import handleGET from "./GET";
import handleOPTIONS from "./OPTIONS";
import handlePUT from "./PUT";

type Handler = { [key in methods]: MethodHandler | undefined };
const methodHandlers: Handler = {
  PUT: handlePUT,
  OPTIONS: handleOPTIONS,
  GET: handleGET,
};

const handleMethodNotAllowed: MethodHandler = async ({ httpMethod }) => {
  return {
    statusCode: 405,
    body: `The method "${httpMethod}" is not allowed.`,
    headers: CORS_HEADERS,
  };
};

const getMethodHandler = (method: string, unpermittedMethod: methods) =>
  (method !== unpermittedMethod && methodHandlers[method as methods]) ||
  handleMethodNotAllowed;

export default getMethodHandler;
