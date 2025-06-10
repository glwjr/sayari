import { User } from "./auth";
import { Post } from "./post";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  post: Post;
}
