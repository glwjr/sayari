export interface User {
  id: string;
  username: string;
  role?: string;
  createdAt: Date;
  isActive: boolean;
  postCount?: number;
}
