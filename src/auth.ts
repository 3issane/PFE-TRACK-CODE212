export type UserRole = "STUDENT" | "ADMIN" | "PROFESSOR";

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("authToken");
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem("role");
  if (role === "STUDENT" || role === "ADMIN" || role === "PROFESSOR") return role;
  return null;
}

export function getDashboardPath(): string {
  const role = getRole();
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PROFESSOR") return "/professor/dashboard";
  return "/";
}

export function clearAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("role");
}

export function authHeader(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
