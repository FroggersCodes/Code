/**
 * Validates a user's code fix against the expected solution.
 * Uses normalized string comparison for the MVP.
 */
export function validateCodeFix(userCode: string, fixedCode: string): boolean {
  const normalize = (code: string) =>
    code
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();

  return normalize(userCode) === normalize(fixedCode);
}
