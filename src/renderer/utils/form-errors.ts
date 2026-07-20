import type { ZodError } from 'zod';

export type FormErrors = Record<string, string>;

export function getFormErrors(error: ZodError): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}
