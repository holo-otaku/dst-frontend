import { Table, Button } from "react-bootstrap";
import { UserData } from "./Interfaces";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@renderer/context";

interface AccountTableProps {
  accounts: UserData[];
  onDeleteAccount: (accountId: number) => void;
}

const AccountTable = ({ accounts, onDeleteAccount }: AccountTableProps) => {
  const navigate = useNavigate();
  const { getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();
  const editable = permissions.includes("user.edit");
  const deletable = permissions.includes("user.delete");

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>角色</th>
            <th>使用者名稱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr
              key={account.id}
              onDoubleClick={() => navigate(`${account.id}/edit`)}
            >
              <td>{account.id}</td>
              <td>{account.role}</td>
              <td>{account.userName}</td>
              <td>
                <Button
                  {...{
                    variant: deletable ? "danger" : "secondary",
                    disabled: !deletable,
                  }}
                  size="sm"
                  className="mx-1"
                  onClick={() => onDeleteAccount(account.id)}
                >
                  刪除
                </Button>
                <Button
                  {...{
                    variant: editable ? "primary" : "secondary",
                    disabled: !editable,
                  }}
                  size="sm"
                  className="mx-1"
                  onClick={() => navigate(`${account.id}/edit`)}
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

export default AccountTable;
