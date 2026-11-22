export const PHQ9_QUESTIONS: Record<number, string> = {
  1: "Little interest or pleasure in doing things",
  2: "Feeling down, depressed, or hopeless",
  3: "Trouble falling or staying asleep, or sleeping too much",
  4: "Feeling tired or having little energy",
  5: "Poor appetite or overeating",
  6: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  7: "Trouble concentrating on things, such as reading the newspaper or watching television",
  8: "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  9: "Thoughts that you would be better off dead, or of hurting yourself",
};

export const PHQ9_RESPONSE_LABELS: Record<number, string> = {
  0: "Not at all",
  1: "Several days",
  2: "More than half the days",
  3: "Nearly every day",
};

export function getPhq9SeverityLabel(totalScore: number): string {
  if (totalScore <= 4) return "Minimal or No Depression";
  if (totalScore <= 9) return "Mild Depression";
  if (totalScore <= 14) return "Moderate Depression";
  if (totalScore <= 19) return "Moderately Severe Depression";
  return "Severe Depression";
}
