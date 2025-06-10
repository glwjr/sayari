import { User } from "./auth";
import { Comment } from "./comment";

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  comments: Comment[];
  commentCount?: number;
}
