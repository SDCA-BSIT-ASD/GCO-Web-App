import mongoose from "mongoose";
import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";

import { EmployeeModel } from "../../../models/Employee";
import { StudentModel } from "../../../models/Student";
import { StudentResponseModel } from "../../../models/StudentResponse";
import { getSessionUser } from "../../../utils/auth";
import { formatPhq9EntryDetail } from "../../../utils/phq9";

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

  const employeeRole =
    employee && "type" in employee && typeof employee.type === "string"
      ? employee.type.trim().toLowerCase()
      : "";

  if (employeeRole !== "counselor") {
    setResponseStatus(event, 403);
    return {
      success: false,
      message: "Only counselors can view PHQ-9 entry details.",
    };
  }

  // 3. Validate submission ID format and fetch PHQ-9 submission (404 Not Found)
  const id = getRouterParam(event, "id");

  if (!id || !mongoose.isValidObjectId(id)) {
    setResponseStatus(event, 404);
    return {
      success: false,
      message: "PHQ-9 submission not found.",
    };
  }

  const submission = await StudentResponseModel.findOne({
    _id: id,
    assessmentType: { $regex: /^phq-?9$/i },
  }).lean();

  if (!submission) {
    setResponseStatus(event, 404);
    return {
      success: false,
      message: "PHQ-9 submission not found.",
    };
  }

  // 4. Fetch submitting student profile and return formatted response (200 OK)
  const student = await StudentModel.findById(submission.studentId).lean();

  setResponseStatus(event, 200);
  return {
    success: true,
    data: formatPhq9EntryDetail({
      submission,
      student,
    }),
  };
});
