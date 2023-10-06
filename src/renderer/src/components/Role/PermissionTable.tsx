import React from "react";
import { Form } from "react-bootstrap";
import { PermissionData } from "./Interfaces";

interface PermissionTableProps {
  permissions: PermissionData[];
  rolePermissionIds: number[];
  setRolePermissionIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  rolePermissionIds,
  setRolePermissionIds,
}) => {
  const groupedPermissions: Record<string, PermissionData[]> = {};

  permissions.forEach((permission) => {
    const [category] = permission.name.split(".");
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = [];
    }
    groupedPermissions[category].push(permission);
  });

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
      setRolePermissionIds(
        rolePermissionIds.filter(
          (id) => !selectedCategoryPermissionIds.includes(id)
        )
      );
    } else {
      setRolePermissionIds((prevIds) =>
        Array.from(new Set([...prevIds, ...selectedCategoryPermissionIds]))
      );
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    if (rolePermissionIds.includes(permissionId)) {
      setRolePermissionIds(
        rolePermissionIds.filter((id) => id !== permissionId)
      );
    } else {
      setRolePermissionIds([...rolePermissionIds, permissionId]);
    }
  };

  return (
    <table className="table table-striped table-bordered">
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
                {groupedPermissions[category].map((permission, subIndex) => (
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
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                  </React.Fragment>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PermissionTable;
