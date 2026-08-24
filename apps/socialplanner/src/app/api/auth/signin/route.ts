import { NextResponse } from 'next/server';

import { getUserByEmail } from '@/lib/db';
import { createSession } from '@/lib/session';
import { verifyPassword } from '@/lib/auth';

// A fixed, valid bcrypt hash used only to equalize response timing when no user
// is found. Running a real bcrypt.compare on the no-user path prevents an
// attacker from distinguishing "email exists" from "email doesn't" via timing
// (user enumeration, CWE-204). This is not a secret; it hashes a throwaway value.
const DUMMY_PASSWORD_HASH = '$2b$10$6bCG61KJ34ehREV5uvndkO1i.p4hLPt15qz1cLChUqNml9BzF3us.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      // Compare against a dummy hash so this path costs the same as a real
      // password check, then return the identical 401 as a wrong password.
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await createSession(user);

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
