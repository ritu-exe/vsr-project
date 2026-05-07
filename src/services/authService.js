import { login as apiLogin, signup as apiSignup } from "./api";

export async function login(username, password) {
  const res = await apiLogin({ username, password });
  if (res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", res.username);
  }
  return res;
}

export async function register(username, password) {
  return apiSignup({ username, password });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUsername() {
  return localStorage.getItem("username");
}
