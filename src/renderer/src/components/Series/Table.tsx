import { Table, Button } from "react-bootstrap";
import { SeriesData } from "./Interfaces";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "@renderer/context";
import ConfirmDeleteModal from "./Delete"; // 確保路徑正確

interface SeriesTableProps {
  data: SeriesData[];
  handleDelete: (id: number) => void;
}

export const SeriesTable = ({ data, handleDelete }: SeriesTableProps) => {
  const navigate = useNavigate();
  const { getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();
  const editable = permissions.includes("series.edit");
  const deletable = permissions.includes("series.delete");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<number | null>(null);

  const handleShowDeleteModal = (id: number) => {
    setSeriesToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (seriesToDelete !== null) {
      handleDelete(seriesToDelete);
    }
    setSeriesToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <div>
      <div>
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
                <tr
                  key={series.id}
                  onDoubleClick={() => navigate(`${series.id}/edit`)}
                >
                  <td>{series.name}</td>
                  <td>{series.createdBy}</td>
                  <td>{moment(series.createdAt).format("YYYY-MM-DD")}</td>
                  <td>
                    <Button
                      {...{
                        variant: deletable ? "danger" : "secondary",
                        disabled: !deletable,
                      }}
                      className="mx-1"
                      size="sm"
                      onClick={() => handleShowDeleteModal(series.id)} // 顯示確認刪除模態對話框
                    >
                      刪除
                    </Button>
                    <Button
                      {...{
                        variant: editable ? "primary" : "secondary",
                        disabled: !editable,
                      }}
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
      </div>
      <div>
        <ConfirmDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};
