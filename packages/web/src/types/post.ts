import { User } from "./auth";

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
