/**
 * Mock authentication module.
 * TODO: Replace with Supabase Auth (Google OAuth) when integration is connected.
 * TODO: Replace sendWelcomeEmail with Resend API call when integration is connected.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const MOCK_USERS: AuthUser[] = [
  {
    id: "usr_001",
    name: "Carlos Martinez",
    email: "carlos.martinez@gmail.com",
    avatar: "CM",
  },
  {
    id: "usr_002",
    name: "Valentina Lopez",
    email: "valentina.lopez@gmail.com",
    avatar: "VL",
  },
  {
    id: "usr_003",
    name: "Santiago Ruiz",
    email: "santiago.ruiz@gmail.com",
    avatar: "SR",
  },
];

/**
 * Simulates Google OAuth sign-in with a 1.5s delay.
 * TODO: Replace with Supabase signInWithOAuth({ provider: 'google' })
 */
export async function mockGoogleSignIn(): Promise<AuthUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      resolve(user);
    }, 1500);
  });
}

/**
 * Simulates saving the user email to the database.
 * TODO: Replace with Supabase insert into 'users' table
 */
export async function mockSaveUserToDb(user: AuthUser): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate DB insert
      // TODO: Replace with actual DB insert via API route
      resolve(true);
    }, 300);
  });
}

/**
 * Simulates sending a welcome email.
 * TODO: Replace with Resend API call using a branded HTML template
 */
export async function mockSendWelcomeEmail(user: AuthUser): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // TODO: Replace with Resend/SES API call
      resolve(true);
    }, 500);
  });
}
