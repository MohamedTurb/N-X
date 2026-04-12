import { requestJson } from "./api";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "customer";
};

export const authApi = {
  login: (payload: LoginPayload) => requestJson<AuthResponse>("/auth/login", { method: "POST", body: payload }),
  register: (payload: RegisterPayload) => requestJson<AuthResponse>("/auth/register", { method: "POST", body: payload }),
};