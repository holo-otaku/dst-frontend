import React, { useState, useEffect } from "react";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import { RoleResponse, Role } from "./Interfaces";

interface CreateUserPayload {
  username: string;
  password: string;
  roleId: string;
}

export const Create = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  const [{ data: createResponse, loading: createLoading }, createUser] =
    useAxios<APIResponse, CreateUserPayload>(
      {
        url: "/user",
        method: "POST",
      },
      {
        manual: true,
      },
    );

  const [{ data: roleResponse, loading: roleLoading }, refetchRoles] =
    useAxios<RoleResponse>(
      {
        url: "/role",
        method: "GET",
      },
      {
        manual: true,
      },
    );

  // Populate the roles state when the roleResponse is available
  useEffect(() => {
    if (roleResponse && roleResponse.data) {
      setRoles(roleResponse.data);
    }
  }, [roleResponse]);

  useEffect(() => {
    void refetchRoles();
  }, [refetchRoles]);

  useEffect(() => {
    if (!createResponse) return;
    navigate("/accounts");
  }, [createResponse, navigate]);

  const handleSubmit = () => {
    const payload: CreateUserPayload = {
      username,
      password,
      roleId,
    };
    createUser({
      data: payload,
    }).then(
      () => navigate("/accounts"), // Redirect to the users list page on success
      () => undefined, // Handle error, you can add an error notification here
    );
  };

  const isValidPayload = username !== "" && password !== "" && roleId !== "";

  return (
    <Stack gap={2}>
      <Backdrop show={createLoading || roleLoading}>
        <ScaleLoader color="#36d7b7" />
      </Backdrop>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>名稱</InputGroup.Text>
          <Form.Control
            isInvalid={username === ""}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputGroup>
      </Stack>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>密碼</InputGroup.Text>
          <Form.Control
            isInvalid={password === ""}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </Stack>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>Role</InputGroup.Text>
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
        <Button
          variant="primary"
          disabled={!isValidPayload}
          onClick={handleSubmit}
        >
          新增
        </Button>
        <Button variant="outline-warning" onClick={() => navigate("/accounts")}>
          取消
        </Button>
      </Stack>
    </Stack>
  );
};
