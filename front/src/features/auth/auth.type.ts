export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "user";
  createdAt: string;
}
export interface AuthSession {
  token: string;
  user: PublicUser;
}
