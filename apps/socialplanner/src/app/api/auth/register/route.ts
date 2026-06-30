import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { createUser, getUserByEmail } from '@/lib/db';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (name === undefined || name === null || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name is required and must be a non-empty string' }, { status: 400 });
    }

    if (email === undefined || email === null || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ error: 'email is required and must be a non-empty string' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'email must be a valid email address' }, { status: 400 });
    }

    if (password === undefined || password === null || typeof password !== 'string' || password === '') {
      return NextResponse.json({ error: 'password is required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: 'password must be at least 8 characters long' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email.trim());
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
