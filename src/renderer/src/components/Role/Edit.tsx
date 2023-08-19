import { useState, useEffect } from "react";
import {
  Stack,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  FormGroup,
  FormCheck,
} from "react-bootstrap";
import useAxios from "axios-hooks";
import { ScaleLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import {
  RoleResponse,
  PermissionResponse,
  CreateRolePayload,
  PermissionData,
  RoleDetailResponse,
} from "./Interfaces";

export const Edit = () => {
  const navigate = useNavigate();
  const [rolename, setRolename] = useState<string>("");
  const [rolePermissionIds, setRolePermissionIds] = useState<number[]>([]);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const { id } = useParams();

  const [{ data: detailResponse, loading: detailLoading }, getRole] =
    useAxios<RoleDetailResponse>(
      {
        method: "GET",
      },
      {
        manual: true,
      }
    );

  const [{ loading: editLoading }, editRole] = useAxios<RoleResponse>(
    {
      url: `/role/${id}`,
      method: "PATCH",
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
    },
    { manual: true }
  );

  // Fetch role data when the component mounts
  useEffect(() => {
    if (detailResponse?.data) {
      setRolename(detailResponse.data.name);
      setRolePermissionIds(
        detailResponse.data.permissions.map((perm) => perm.id)
      );
    }
  }, [detailResponse]);

  useEffect(() => {
    void refetchPermission();
  }, [refetchPermission]);

  // Populate the permissions state when the permissionResponse is available
  useEffect(() => {
    if (permissionResponse && permissionResponse.data) {
      setPermissions(permissionResponse.data);
    }
  }, [permissionResponse]);

  // Fetch role data when the component mounts
  useEffect(() => {
    if (!id) return;
    void getRole({
      url: `/role/${id}`,
    });
  }, [id, getRole]);

  const handleSubmit = () => {
    const payload: CreateRolePayload = {
      roleName: rolename,
      permissionIds: rolePermissionIds,
    };
    editRole({
      data: payload,
    }).then(
      () => navigate("/roles"), // Redirect to the accounts list page on success
      () => undefined // Handle error, you can add an error notification here
    );
  };

  return (
    <Stack gap={2}>
      <Backdrop show={detailLoading || permissionLoading || editLoading}>
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
        <Form.Label>選擇權限</Form.Label>
        <Row>
          {permissions.length > 0 &&
            permissions.map((permission) => (
              <Col key={permission.id} xs={6} sm={4} md={3}>
                <FormGroup>
                  <FormCheck
                    type="checkbox"
                    label={permission.name}
                    checked={rolePermissionIds.includes(permission.id)}
                    onChange={() => {
                      if (rolePermissionIds.includes(permission.id)) {
                        setRolePermissionIds(
                          rolePermissionIds.filter((id) => id !== permission.id)
                        );
                      } else {
                        setRolePermissionIds([
                          ...rolePermissionIds,
                          permission.id,
                        ]);
                      }
                    }}
                  />
                </FormGroup>
              </Col>
            ))}
        </Row>
      </Stack>
      <Stack direction="horizontal" gap={3} className="mt-3">
        <div className="flex-grow-1" />
        <Button
          variant="primary"
          disabled={!rolename || rolePermissionIds.length === 0}
          onClick={handleSubmit}
        >
          更新
        </Button>
        <Button variant="outline-warning" onClick={() => navigate("/roles")}>
          取消
        </Button>
      </Stack>
    </Stack>
  );
};
