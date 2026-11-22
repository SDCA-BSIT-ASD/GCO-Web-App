import { createEvent } from "h3";
import { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSessionUser,
  mockEmployeeFindOne,
  mockStudentResponseFindOne,
  mockStudentFindById,
} = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockEmployeeFindOne: vi.fn(),
  mockStudentResponseFindOne: vi.fn(),
  mockStudentFindById: vi.fn(),
}));

vi.mock("../../../utils/auth", () => ({
  getSessionUser: mockGetSessionUser,
}));

vi.mock("../../../models/Employee", () => ({
  EmployeeModel: {
    findOne: mockEmployeeFindOne,
  },
}));

vi.mock("../../../models/StudentResponse", () => ({
  StudentResponseModel: {
    findOne: mockStudentResponseFindOne,
  },
}));

vi.mock("../../../models/Student", () => ({
  StudentModel: {
    findById: mockStudentFindById,
  },
}));

import handler from "./[id].get";

function makeEvent(id?: string) {
  const req = new IncomingMessage(null as any);
  const res = new ServerResponse(req);
  const event = createEvent(req, res);
  event.context.params = id ? { id } : {};
  return event;
}

describe("GET /api/assessments/phq9/:id", () => {
  const validSubmissionId = "6710a1b2c3d4e5f60718293a";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetSessionUser.mockReturnValue(null);
    const event = makeEvent(validSubmissionId);

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(401);
    expect(result).toEqual({
      success: false,
      message: "Authentication required.",
    });
  });

  it("returns 403 when authenticated user is not a counselor", async () => {
    mockGetSessionUser.mockReturnValue({
      emailAddress: "faculty@school.edu.ph",
    });
    mockEmployeeFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ type: "Faculty" }),
    });
    const event = makeEvent(validSubmissionId);

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(403);
    expect(result).toEqual({
      success: false,
      message: "Only counselors can view PHQ-9 entry details.",
    });
  });

  it("returns 404 when submission ID is malformed", async () => {
    mockGetSessionUser.mockReturnValue({
      emailAddress: "counselor@school.edu.ph",
    });
    mockEmployeeFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ type: "Counselor" }),
    });
    const event = makeEvent("not-a-valid-object-id");

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(404);
    expect(result).toEqual({
      success: false,
      message: "PHQ-9 submission not found.",
    });
  });

  it("returns 404 when no PHQ-9 submission matches the ID", async () => {
    mockGetSessionUser.mockReturnValue({
      emailAddress: "counselor@school.edu.ph",
    });
    mockEmployeeFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ type: "Counselor" }),
    });
    mockStudentResponseFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    const event = makeEvent(validSubmissionId);

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(404);
    expect(result).toEqual({
      success: false,
      message: "PHQ-9 submission not found.",
    });
  });
});
