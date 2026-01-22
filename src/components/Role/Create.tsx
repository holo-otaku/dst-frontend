import { useState, useEffect, useMemo } from "react";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import {
  RoleResponse,
  PermissionResponse,
  CreateRolePayload,
} from "./Interfaces";
import PermissionTable from "./PermissionTable";
import { AxiosError } from "axios";

export const Create = () => {
  const navigate = useNavigate();
  const [rolename, setRolename] = useState<string>("");
  const [rolePermissionIds, setRolePermissionIds] = useState<number[]>([]);

  const [{ loading: addLoading }, addRole] = useAxios<RoleResponse>(
    {
      url: "/role",
      method: "POST",
    },
    {
      manual: true,
    }
  );

  const [
    { data: permissionResponse, loading: permissionLoading },
    refetchPermission,
  ] = useAxios<PermissionResponse>(
    {
      url: "/permission",
      method: "GET",
      params: {
        limit: 100,
      },
    },
    { manual: true }
  );

  useEffect(() => {
    void refetchPermission();
  }, [refetchPermission]);

  const permissions = useMemo(
    () => permissionResponse?.data ?? [],
    [permissionResponse]
  );

  const handleSubmit = () => {
    const payload: CreateRolePayload = {
      roleName: rolename,
      permissionIds: rolePermissionIds,
    };
    addRole({
      data: payload,
    })
      .then(
        () => navigate("/roles") // Redirect to the roles list page on success
      )
      .catch((e) =>
        alert(
          (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
        )
      );
  };

  return (
    <Stack gap={2}>
      <Backdrop show={permissionLoading || addLoading}>
        <ScaleLoader color="#36d7b7" />
      </Backdrop>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>名稱</InputGroup.Text>
          <Form.Control
            isInvalid={rolename === ""}
            value={rolename}
            onChange={(e) => setRolename(e.target.value)}
          />
        </InputGroup>
      </Stack>
      <Stack direction="horizontal" gap={3}>
        <PermissionTable
          permissions={permissions}
          rolePermissionIds={rolePermissionIds}
          setRolePermissionIds={setRolePermissionIds}
        />
      </Stack>
      <Stack direction="horizontal" gap={3} className="mt-3">
        <div className="flex-grow-1" />
        <Button
          variant="primary"
          disabled={!rolename || rolePermissionIds.length === 0}
          onClick={handleSubmit}
        >
          新增
        </Button>
        <Button variant="outline-warning" onClick={() => navigate("/roles")}>
          取消
        </Button>
      </Stack>
    </Stack>
  );
};
