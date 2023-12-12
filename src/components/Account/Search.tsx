import { useEffect } from "react";
import { Stack } from "react-bootstrap";
import useAxios from "axios-hooks";
import { AccountResponse } from "./Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import AccountTable from "./Table";
import { usePaginate } from "../../hooks";
import { Pagination } from "../Pagination";
import { get } from "lodash";

export const Search = () => {
  const [{ data: accountResponse, loading: accountLoading }, refetchAccounts] =
    useAxios<AccountResponse>({
      url: "/user",
      method: "GET",
      params: {
        limit: 100,
      },
    });

  const [{ loading: deleteLoading }, deleteUser] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    }
  );

  const [PaginateState, PaginateAction] = usePaginate({
    total: get(accountResponse, "totalCount", 0),
    limit: 10,
  });

  const { currentPage, availablePages } = PaginateState;

  useEffect(() => {
    refetchAccounts({
      params: {
        page: currentPage,
        limit: 10,
      },
    });
    return () => {};
  }, [refetchAccounts, currentPage]);

  useEffect(() => {
    if (accountResponse) {
      PaginateAction.changeTotal(accountResponse.totalCount);
    }
  }, [accountResponse]);

  const pageLoading = accountLoading;

  const handleDeleteAccount = (accountId: number) => {
    void deleteUser({
      url: `/user/${accountId}`,
    }).then(() => refetchAccounts());
  };

  return (
    <Stack>
      <Backdrop show={pageLoading || deleteLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      {accountResponse && (
        <AccountTable
          accounts={accountResponse.data}
          onDeleteAccount={handleDeleteAccount}
        />
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
