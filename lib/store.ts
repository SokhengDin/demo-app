export type SignupRecord = {
  id: string;
  password: string;
  verified: boolean;
  verificationToken: string;
};

export type ProfileRecord = {
  name: string;
  company: string;
  plan?: string;
  purchased?: boolean;
};

export const signups: Map<string, SignupRecord> = new Map();
export const profiles: Map<string, ProfileRecord> = new Map();
