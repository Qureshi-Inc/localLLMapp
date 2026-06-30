import { User, UserCreateInput } from '../types';

export const getUserByEmail = jest.fn((email: string) => {
  return null;
});

export const createUser = jest.fn((input: UserCreateInput) => {
  throw new Error('User with this email already exists');
});
