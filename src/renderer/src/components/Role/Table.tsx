import { useContext } from "react";
import { Table, Button } from "react-bootstrap";
import { RoleData } from "./Interfaces";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@renderer/context";

interface RoleTableProps {
  roles: RoleData[];
  onDeleteRole: (roleId: number) => void;
}

const RoleTable = ({ roles, onDeleteRole }: RoleTableProps) => {
  const navigate = useNavigate();
  const { getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();
  const editable = permissions.includes("role.edit");
  const deletable = permissions.includes("role.delete");

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>角色名稱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} onDoubleClick={() => navigate(`${role.id}/edit`)}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>
                <Button
                  {...{
                    variant: deletable ? "danger" : "secondary",
                    disabled: !deletable,
                  }}
                  size="sm"
                  className="mx-1"
                  onClick={() => onDeleteRole(role.id)}
                >
                  刪除
                </Button>
                <Button
                  {...{
                    variant: editable ? "warning" : "secondary",
                    disabled: !editable,
                  }}
                  size="sm"
                  className="mx-1"
                  onClick={() => navigate(`${role.id}/edit`)}
                >
                  編輯
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;
