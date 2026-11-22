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
  const validStudentId = "6710a1b2c3d4e5f60718293b";

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

  it("returns 200 with full PHQ-9 details and flagDetails when Question 9 is non-zero", async () => {
    mockGetSessionUser.mockReturnValue({
      emailAddress: "counselor@school.edu.ph",
    });
    mockEmployeeFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ type: "Counselor" }),
    });
    mockStudentResponseFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: validSubmissionId,
        studentId: validStudentId,
        assessmentType: "PHQ-9",
        submittedAt: new Date("2026-10-16T08:30:00.000Z"),
        answers: [0, 2, 2, 2, 1, 2, 2, 1, 2],
      }),
    });
    mockStudentFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        firstName: "Juan",
        lastName: "Dela Cruz",
        studentNumber: "2024-00123",
        programName: "BSIT",
        yearLevel: 3,
      }),
    });
    const event = makeEvent(validSubmissionId);

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: validSubmissionId,
      submittedAt: "2026-10-16T08:30:00.000Z",
      student: {
        name: "Juan Dela Cruz",
        studentNumber: "2024-00123",
        program: "BSIT",
        yearLevel: 3,
      },
      totalScore: 14,
      severityLabel: "Moderate Depression",
      isFlagged: true,
      flagDetails: {
        questionNumber: 9,
        value: 2,
        label: "More than half the days",
      },
    });
    expect(result.data.responses).toHaveLength(9);
    expect(
      result.data.responses.map(
        (r: { questionNumber: number }) => r.questionNumber,
      ),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("sets isFlagged to false and flagDetails to null when Question 9 is zero", async () => {
    mockGetSessionUser.mockReturnValue({
      emailAddress: "counselor@school.edu.ph",
    });
    mockEmployeeFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ type: "Counselor" }),
    });
    mockStudentResponseFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: validSubmissionId,
        studentId: validStudentId,
        assessmentType: "PHQ-9",
        submittedAt: new Date("2026-10-16T08:30:00.000Z"),
        answers: [1, 1, 0, 1, 0, 0, 0, 0, 0],
      }),
    });
    mockStudentFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        firstName: "Maria",
        lastName: "Santos",
        studentNumber: "2024-00456",
        programName: "BSCS",
        yearLevel: 2,
      }),
    });
    const event = makeEvent(validSubmissionId);

    const result = await handler(event);

    expect(event.node.res.statusCode).toBe(200);
    expect(result.data.student.yearLevel).toBe(2);
    expect(result.data.totalScore).toBe(3);
    expect(result.data.severityLabel).toBe("Minimal or No Depression");
    expect(result.data.isFlagged).toBe(false);
    expect(result.data.flagDetails).toBeNull();
  });
});
