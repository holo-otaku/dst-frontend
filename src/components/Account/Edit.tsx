import React, { useState, useEffect } from "react";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import { RoleResponse, Role } from './Interfaces';
import { UserResponse, CreateUserPayload } from './Interfaces';

export const Edit = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [roles, setRoles] = useState<Role[]>([]);
    const { id } = useParams();

    const [{ data: userResponse, loading: userLoading }, getUser] =
        useAxios<UserResponse>({
            method: "GET",
        });

    const [{ loading: editLoading }, editUser] =
        useAxios<UserResponse>(
            {
                url: `/user/${id}`,
                method: "PATCH",
            },
            {
                manual: true,
            }
        );

    // Fetch user data when the component mounts
    useEffect(() => {
        if (userResponse && userResponse.data) {
            setUsername(userResponse.data.userName);
            setRoleId(userResponse.data.roleId); // Assuming role is stored as roleId in the user data
        }
    }, [userResponse]);

    // Fetch the available roles when the component mounts
    const [{ data: roleResponse, loading: roleLoading }, refetchRoles] =
        useAxios<RoleResponse>(
            {
                url: "/role",
                method: "GET",
            },
            {
                manual: true,
            }
        );

    useEffect(() => {
        void refetchRoles();
    }, [refetchRoles]);

    // Populate the roles state when the roleResponse is available
    useEffect(() => {
        if (roleResponse && roleResponse.data) {
            setRoles(roleResponse.data);
        }
    }, [roleResponse]);

    // Fetch user data when the component mounts
    useEffect(() => {
        if (!id) return;
        void getUser({
            url: `/user/${id}`,
        });
    }, [id, getUser]);

    const handleSubmit = () => {
        const payload: CreateUserPayload = {
            username,
            password,
            roleId,
        };
        editUser({
            data: payload,
        }).then(
            () => navigate("/accounts"), // Redirect to the accounts list page on success
            () => undefined // Handle error, you can add an error notification here
        );
    };

    const isValidPayload = username !== "" && roleId !== "";

    return (
        <Stack gap={2}>
            <Backdrop show={userLoading || roleLoading || editLoading}>
                <ScaleLoader color="#36d7b7" />
            </Backdrop>
            <Stack direction="horizontal" gap={3}>
                <InputGroup>
                    <InputGroup.Text>名稱</InputGroup.Text>
                    <Form.Control
                        isInvalid={username === ""}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </InputGroup>
            </Stack>
            {/* Assuming you also have an input field for the password */}
            <Stack direction="horizontal" gap={3}>
                <InputGroup>
                    <InputGroup.Text>密碼</InputGroup.Text>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </InputGroup>
            </Stack>
            <Stack direction="horizontal" gap={3}>
                <InputGroup>
                    <InputGroup.Text>角色</InputGroup.Text>
                    <Form.Control
                        as="select"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id.toString()}>
                                {role.name}
                            </option>
                        ))}
                    </Form.Control>
                </InputGroup>
            </Stack>
            <Stack direction="horizontal" gap={3} className="mt-3">
                <div className="flex-grow-1" />
                <Button variant="primary" disabled={!isValidPayload} onClick={handleSubmit}>
                    更新
                </Button>
                <Button variant="outline-warning" onClick={() => navigate("/accounts")}>
                    取消
                </Button>
            </Stack>
        </Stack>
    );
};
