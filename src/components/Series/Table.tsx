import { Table, Button } from "react-bootstrap";
import { SeriesData } from "./Interfaces";
import moment from "moment";
import { useNavigate } from "react-router-dom";

interface SeriesTableProps {
  data: SeriesData[];
  handleDelete: (id: number) => void;
}

export const SeriesTable = ({ data, handleDelete }: SeriesTableProps) => {
  const navigate = useNavigate();

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
                <Button
                  variant="danger"
                  className="mx-1"
                  size="sm"
                  onClick={() => handleDelete(series.id)}
                >
                  刪除
                </Button>
                <Button
                  variant="warning"
                  className="mx-1"
                  size="sm"
                  onClick={() => navigate(`${series.id}/edit`)}
                >
                  編輯
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};
