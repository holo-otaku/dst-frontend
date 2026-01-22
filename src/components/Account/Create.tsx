import { useState, useEffect, useMemo } from "react";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import { RoleResponse } from "./Interfaces";
import { AxiosError } from "axios";

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

  const [{ data: createResponse, loading: createLoading }, createUser] =
    useAxios<APIResponse, CreateUserPayload>(
      {
        url: "/user",
        method: "POST",
      },
      {
        manual: true,
      }
    );

  const [{ data: roleResponse, loading: roleLoading }, refetchRoles] =
    useAxios<RoleResponse>(
      {
        url: "/role",
        method: "GET",
        params: {
          limit: 100,
        },
      },
      {
        manual: true,
      }
    );

  const roles = useMemo(() => roleResponse?.data ?? [], [roleResponse]);

  useEffect(() => {
    void refetchRoles();
  }, [refetchRoles]);

  useEffect(() => {
    if (!createResponse) return;
    navigate("/accounts");
  }, [createResponse, navigate]);

  const handleSubmit = async () => {
    const payload: CreateUserPayload = {
      username,
      password,
      roleId,
    };
    await createUser({
      data: payload,
    }).catch((e) =>
      alert(
        (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
      )
    );

    return navigate("/accounts");
  };

  const isValidPayload = username !== "" && password !== "" && roleId !== "";
  const pageLoading = createLoading || roleLoading;

  return (
    <Stack gap={2}>
      <Backdrop show={pageLoading}>
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
          <InputGroup.Text>角色</InputGroup.Text>
          <Form.Select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">選擇角色</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                {role.name}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Stack>
      <Stack direction="horizontal" gap={3} className="mt-3">
        <div className="flex-grow-1" />
        <Button
          variant="primary"
          disabled={!isValidPayload}
          onClick={() => void handleSubmit()}
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
