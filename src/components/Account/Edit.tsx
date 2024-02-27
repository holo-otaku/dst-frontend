import { useState, useEffect } from "react";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import { RoleResponse, Role } from "./Interfaces";
import { UserResponse, CreateUserPayload } from "./Interfaces";
import { AxiosError } from "axios";

export const Edit = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const { id } = useParams();

  const [{ data: userResponse, loading: userLoading }] = useAxios<UserResponse>(
    {
      url: `/user/${id}`,
      method: "GET",
    }
  );

  const [{ loading: editLoading }, editUser] = useAxios<UserResponse>(
    {
      url: `/user/${id}`,
      method: "PATCH",
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    if (!userResponse) return;

    setUsername(userResponse.data.userName);
    setRoleId(userResponse.data.roleId.toString());
  }, [userResponse]);

  const [{ data: roleResponse, loading: roleLoading }] = useAxios<RoleResponse>(
    {
      url: "/role",
      method: "GET",
      params: {
        limit: 100,
      },
    }
  );

  useEffect(() => {
    if (!roleResponse) return;
    setRoles(roleResponse.data);
  }, [roleResponse]);

  const handleSubmit = () => {
    const payload: CreateUserPayload = {
      username,
      password,
      roleId,
    };
    editUser({
      data: payload,
    })
      .then(() => navigate("/accounts"))
      .catch((e) =>
        alert(
          (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
        )
      );
  };

  const isValidPayload = username !== "" && roleId !== "";
  const pageLoading = userLoading || roleLoading || editLoading;

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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputGroup>
      </Stack>
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
          onClick={handleSubmit}
        >
          更新
        </Button>
        <Button variant="outline-warning" onClick={() => navigate("/accounts")}>
          取消
        </Button>
      </Stack>
    </Stack>
  );
};
