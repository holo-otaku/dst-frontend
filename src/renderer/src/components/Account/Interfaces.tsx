export interface AccountResponse extends APIResponse {
  data: UserData[];
  totalCount: number;
}

export interface UserResponse extends APIResponse {
  data: OneUserData;
}

export interface UserData {
  id: number;
  role: string;
  userName: string;
}

export interface OneUserData {
  roleId: number;
  role: string;
  userName: string;
}
export interface CreateUserPayload {
  username: string;
  password: string;
  roleId: string;
}
export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface RoleResponse {
  code: number;
  data: Role[];
  msg: string;
}
