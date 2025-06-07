import * as bcrypt from 'bcrypt';

export const PASSWORD_REGEX = /^.{8,}$/;

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const compareHash = async (password: string, passwordHash: string) => {
  return await bcrypt.compare(password, passwordHash);
};
