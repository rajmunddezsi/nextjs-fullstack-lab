export interface InvitationFormState {
  success: boolean;
  message: string;
  errors?: { email?: string[]; role?: string[] };
}