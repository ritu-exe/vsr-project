export function login(email, password) {
  // later: fetch('/api/auth/login')
  return Promise.resolve({ userId: "mock-user" });
}

export function register(name, email, password) {
  // later: fetch('/api/auth/register')
  return Promise.resolve({ userId: "mock-user" });
}
