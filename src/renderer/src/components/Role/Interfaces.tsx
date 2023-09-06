export interface RoleResponse extends APIResponse {
  data: RoleData[];
  totalCount: number;
}

export interface RoleData {
  id: number;
  name: string;
  permissions: PermissionData[];
}

export interface PermissionData {
  id: number;
  name: string;
}

export interface PermissionResponse {
  data: PermissionData[];
}

export interface CreateRolePayload {
  roleName: string;
  permissionIds: number[];
}

export interface RoleDetailResponse extends APIResponse {
  data: RoleData;
}
