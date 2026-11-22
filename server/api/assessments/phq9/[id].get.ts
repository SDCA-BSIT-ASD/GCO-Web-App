import { defineEventHandler, setResponseStatus } from "h3";

import { getSessionUser } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  // 1. Check authentication (401 Unauthorized)
  const sessionUser = getSessionUser(event);

  if (!sessionUser?.emailAddress) {
    setResponseStatus(event, 401);
    return {
      success: false,
      message: "Authentication required.",
    };
  }

  setResponseStatus(event, 501);
  return {
    success: false,
    message: "Not implemented yet.",
  };
});
