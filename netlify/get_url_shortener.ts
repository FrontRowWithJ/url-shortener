import { type Handler } from "@netlify/functions";
import getMethodHandler from "../src/handlers";

export const handler: Handler = async (evt) =>
  getMethodHandler(evt.httpMethod, "PUT")(evt);
