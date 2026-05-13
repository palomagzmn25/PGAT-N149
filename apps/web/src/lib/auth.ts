export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CAPTURISTA' | 'REVISOR';
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(data: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('accessToken');
}
