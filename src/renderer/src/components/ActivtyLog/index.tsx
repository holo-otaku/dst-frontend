import useAxios from "axios-hooks";
import { useEffect } from "react";
import { Container, Stack, Table } from "react-bootstrap";
import { IActivityLogResponse } from "./Interface";
import Backdrop from "../Backdrop/Backdrop";
import { HashLoader } from "react-spinners";
import { get } from "lodash";
import { usePaginate } from "@renderer/hooks";
import { Pagination } from "../Pagination";

const MAX_PER_PAGE_LIMIT = 25;

const ActivityLog = () => {
  const [{ data: activityLog, loading }, fetchLog] =
    useAxios<IActivityLogResponse>({
      url: "/log",
      method: "GET",
    });
  const [PaginateState, PaginateAction] = usePaginate({
    total: get(activityLog, "totalCount", 0),
    limit: MAX_PER_PAGE_LIMIT,
  });

  useEffect(() => {
    if (activityLog) {
      PaginateAction.changeTotal(activityLog.totalCount);
    }
  }, [activityLog]);

  useEffect(() => {
    fetchLog({
      params: {
        page: PaginateState.currentPage,
        limit: PaginateState.limit,
      },
    });
    return () => {};
  }, [fetchLog, PaginateState.currentPage, PaginateState.limit]);

  const { currentPage, availablePages } = PaginateState;
  const logs = get(activityLog, "data", []) as IActivityLogResponse["data"];

  return (
    <Container>
      <Stack gap={3} className="mt-2">
        {loading && (
          <Backdrop show={loading}>
            <HashLoader color="#36d7b7" />
          </Backdrop>
        )}
        <h1>活動紀錄</h1>
        <LogTable data={logs} />
        <Stack direction="horizontal" className="justify-content-center">
          <Pagination
            {...{
              currentPage,
              availablePages,
              ...PaginateAction,
            }}
          />
        </Stack>
      </Stack>
    </Container>
  );
};

interface ILogTableProps {
  data: IActivityLogResponse["data"];
}

const LogTable = ({ data }: ILogTableProps) => (
  <Table striped bordered>
    <thead>
      <tr>
        <th>路徑</th>
        <th>資料</th>
        <th>使用者</th>
        <th>時間</th>
      </tr>
    </thead>
    <tbody>
      {data.map((log, index) => (
        <tr key={index}>
          <td>{log.url}</td>
          <td>{JSON.stringify(get(log, "payload", {}))}</td>
          <td>{log.userName}</td>
          <td>{log.createdAt}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default ActivityLog;
