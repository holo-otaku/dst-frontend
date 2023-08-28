import React, { useState, useEffect } from "react";
import { Stack, Button, Form, InputGroup, Table } from "react-bootstrap";
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

const groupPermissionsByCategory = (permissions: PermissionData[]) => {
  const groupedPermissions: Record<string, PermissionData[]> = {};

  permissions.forEach((permission) => {
    const [category] = permission.name.split(".");
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = [];
    }
    groupedPermissions[category].push(permission);
  });

  return groupedPermissions;
};

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
      params: {
        limit: 100,
      },
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

  const groupedPermissions = groupPermissionsByCategory(permissions);
  const handleSelectCategory = (category: string) => {
    const selectedCategoryPermissions = groupedPermissions[category];
    if (!selectedCategoryPermissions) return;

    const selectedCategoryPermissionIds = selectedCategoryPermissions.map(
      (permission) => permission.id
    );

    if (
      selectedCategoryPermissionIds.every((id) =>
        rolePermissionIds.includes(id)
      )
    ) {
      // Unselect all permissions if all were selected
      setRolePermissionIds(
        rolePermissionIds.filter(
          (id) => !selectedCategoryPermissionIds.includes(id)
        )
      );
    } else {
      // Select all permissions if any were not selected
      setRolePermissionIds([
        ...rolePermissionIds,
        ...selectedCategoryPermissionIds,
      ]);
    }
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
        <Table striped bordered>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>大功能</th>
              <th>權限</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedPermissions).map((category) => (
              <tr key={category}>
                <td>
                  <Form.Check
                    type="checkbox"
                    label={category}
                    checked={groupedPermissions[category].every((permission) =>
                      rolePermissionIds.includes(permission.id)
                    )}
                    onChange={() => handleSelectCategory(category)}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {groupedPermissions[category].map(
                      (permission, subIndex) => (
                        <React.Fragment key={permission.id}>
                          {subIndex > 0 && (
                            <div
                              style={{
                                borderRight: "1px solid #ccc",
                                margin: "0 5px",
                                height: "100%",
                              }}
                            />
                          )}
                          <Form.Check
                            type="checkbox"
                            label={permission.name.split(".")[1]}
                            checked={rolePermissionIds.includes(permission.id)}
                            onChange={() => {
                              if (rolePermissionIds.includes(permission.id)) {
                                setRolePermissionIds(
                                  rolePermissionIds.filter(
                                    (id) => id !== permission.id
                                  )
                                );
                              } else {
                                setRolePermissionIds([
                                  ...rolePermissionIds,
                                  permission.id,
                                ]);
                              }
                            }}
                          />
                        </React.Fragment>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
