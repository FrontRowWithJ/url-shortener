import { PREFLIGHT_HEADERS } from "../constants";
import { MethodHandler } from "../types";

const handleOPTIONS: MethodHandler = async () => {
  return { statusCode: 200, headers: PREFLIGHT_HEADERS };
};

export default handleOPTIONS;
