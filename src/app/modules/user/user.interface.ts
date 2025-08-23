export enum Role {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export interface IAuthsProviders {
  provider: "google" | "credential";
  providerID: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  picture?: string;
  address?: string;
  role: Role;
  isActive?: IsActive;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths: IAuthsProviders[];
  commissionRate?: number;
}
