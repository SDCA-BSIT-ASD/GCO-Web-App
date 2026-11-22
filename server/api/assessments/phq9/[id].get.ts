import { defineEventHandler, setResponseStatus } from "h3";

import { EmployeeModel } from "../../../models/Employee";
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

  // 2. Check counselor role (403 Forbidden)
  const employee = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
  }).lean();

  if (
    !employee ||
    String(employee.type || "")
      .trim()
      .toLowerCase() !== "counselor"
  ) {
    setResponseStatus(event, 403);
    return {
      success: false,
      message: "Only counselors can view PHQ-9 entry details.",
    };
  }

  setResponseStatus(event, 501);
  return {
    success: false,
    message: "Not implemented yet.",
  };
});
