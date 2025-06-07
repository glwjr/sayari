import { User } from 'src/users/user.entity';

export type NewUserPayload = {
  username: string;
  passwordHash: string;
};

export type PartialUser = Partial<User>;
