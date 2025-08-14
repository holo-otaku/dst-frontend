import { useEffect } from "react";
import { Stack } from "react-bootstrap";
import useAxios from "axios-hooks";
import { RoleResponse } from "./Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import RoleTable from "./Table";
import { usePaginate } from "../../hooks";
import { Pagination } from "../Pagination";
import { get } from "lodash";

export const Search = () => {
  const [{ data: roleResponse, loading: roleLoading }, refetchRoles] =
    useAxios<RoleResponse>(
      {
        url: "/role",
        method: "GET",
      },
      { manual: true }
    );

  const [{ loading: deleteLoading }, deleteRole] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    }
  );
  const [PaginateState, PaginateAction] = usePaginate({
    total: get(roleResponse, "totalCount", 0),
    limit: 10,
  });

  const { currentPage, availablePages } = PaginateState;

  const pageLoading = roleLoading;

  // Fetch user data when the component mounts
  useEffect(() => {
    void refetchRoles();
  }, [refetchRoles]);

  useEffect(() => {
    if (roleResponse) {
      PaginateAction.changeTotal(roleResponse.totalCount);
    }
  }, [roleResponse]);

  const handleDeleteRole = (roleId: number) => {
    if (!window.confirm("確定要刪除此角色嗎？")) {
      return;
    }
    // Implement your logic to handle delete here
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
      <Stack direction="horizontal" className="justify-content-center">
        <Pagination
          {...{
            currentPage,
            availablePages,
            ...PaginateAction,
          }}
        />
      </Stack>
    </Stack>
  );
};
