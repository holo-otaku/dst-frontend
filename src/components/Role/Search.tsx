import { useEffect } from "react";
import { Stack } from "react-bootstrap";
import useAxios from "axios-hooks";
import { RoleResponse } from "./Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import RoleTable from "./Table"; // Import the RoleTable component

export const Search = () => {
  const [{ data: roleResponse, loading: roleLoading }, refetchRoles] =
    useAxios<RoleResponse>(
      {
        url: "/role",
        method: "GET",
      },
      { manual: true },
    );

  const [{ loading: deleteLoading }, deleteRole] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    },
  );

  const pageLoading = roleLoading;

  // Fetch user data when the component mounts
  useEffect(() => {
    void refetchRoles();
  }, [refetchRoles]);

  const handleDeleteRole = (roleId: number) => {
    // Implement your logic to handle delete here
    console.log("Delete role with ID:", roleId);
    void deleteRole({
      url: `/role/${roleId}`,
    }).then(() => refetchRoles());
  };

  return (
    <Stack>
      <Backdrop show={pageLoading || deleteLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      {roleResponse && (
        <RoleTable roles={roleResponse.data} onDeleteRole={handleDeleteRole} />
      )}
    </Stack>
  );
};
