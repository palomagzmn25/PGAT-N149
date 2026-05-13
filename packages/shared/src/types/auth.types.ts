export enum Role {
  ADMIN = 'ADMIN',
  CAPTURISTA = 'CAPTURISTA',
  REVISOR = 'REVISOR',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}
