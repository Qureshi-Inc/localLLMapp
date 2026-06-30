import { Post, PostCreateInput, PostUpdateInput, User, UserCreateInput } from '../types';

export const getUserByEmail = jest.fn((email: string) => {
  return null;
});

export const createUser = jest.fn((input: UserCreateInput) => {
  throw new Error('User with this email already exists');
});

export const getAllPosts = jest.fn(() => {
  return Promise.resolve([]);
});

export const getPostsByUser = jest.fn((_userId: string) => {
  return Promise.resolve([]);
});

export const getPostById = jest.fn((_id: string, _userId: string) => {
  return Promise.resolve(null);
});

export const createPost = jest.fn((input: PostCreateInput) => {
  return Promise.resolve({ id: 'post_123', ...input, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Post);
});

export const updatePost = jest.fn((_id: string, _userId: string, _updates: PostUpdateInput) => {
  return Promise.resolve(null);
});

export const deletePost = jest.fn((_id: string, _userId: string) => {
  return Promise.resolve(false);
});
