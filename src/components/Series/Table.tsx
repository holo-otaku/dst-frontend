import { Table, Button } from "react-bootstrap";
import { SeriesData } from "./Interfaces";
import moment from "moment";

interface SeriesTableProps {
  data: SeriesData[];
}

export const SeriesTable = ({ data }: SeriesTableProps) => {
  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>名稱</th>
          <th>建立者</th>
          <th>建立時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((series) => (
            <tr key={series.id}>
              <td>{series.name}</td>

              <td>{series.createdBy}</td>
              <td>{moment(series.createdAt).format("YYYY-MM-DD")}</td>
              <td>
                <Button variant="danger" className="mx-1" size="sm">
                  刪除
                </Button>
                <Button variant="warning" className="mx-1" size="sm">
                  編輯
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};
