import { validateCodeFix } from "../lib/challenges";

export function validateSubmission(userCode: string, fixedCode: string): boolean {
  return validateCodeFix(userCode, fixedCode);
}
