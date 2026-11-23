export interface IActivityLogResponse extends APIResponse {
  data: IActivityLogData[];
  totalCount: number;
}

interface IActivityLogData {
  id: number;
  url: string;
  payload: unknown;
  method: string;
  userId: number;
  userName: string;
  status: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}
