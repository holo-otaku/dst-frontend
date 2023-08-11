import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { UserData } from './Interfaces';
import { useNavigate } from "react-router-dom";

interface AccountTableProps {
    accounts: UserData[];
    onDeleteAccount: (accountId: number) => void;
}

const AccountTable: React.FC<AccountTableProps> = ({ accounts, onDeleteAccount }) => {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Account List</h2>
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
                        <tr key={account.id}>
                            <td>{account.id}</td>
                            <td>{account.role}</td>
                            <td>{account.userName}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="mx-1"
                                    onClick={() => onDeleteAccount(account.id)}>
                                    刪除
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="mx-1"
                                    onClick={() => navigate(`${account.id}/edit`)}>
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
