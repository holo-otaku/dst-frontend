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
        all: true,
      },
    });

  const [{ loading: updateLoading }, updateUser] = useAxios<void>(
    {
      method: "PATCH",
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
        all: true,
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
    if (!window.confirm("確定要停用此帳號嗎？")) {
      return;
    }
    void updateUser({
      url: `/user/${accountId}`,
      data: {
        isDisabled: true,
      },
    }).then(() =>
      refetchAccounts({
        params: {
          page: currentPage,
          limit: 10,
          all: true,
        },
      })
    );
  };

  const handleEnableAccount = (accountId: number) => {
    if (!window.confirm("確定要啟用此帳號嗎？")) {
      return;
    }
    void updateUser({
      url: `/user/${accountId}`,
      data: {
        isDisabled: false,
      },
    }).then(() =>
      refetchAccounts({
        params: {
          page: currentPage,
          limit: 10,
          all: true,
        },
      })
    );
  };

  return (
    <Stack>
      <Backdrop show={pageLoading || updateLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      {accountResponse && (
        <AccountTable
          accounts={accountResponse.data}
          onDeleteAccount={handleDeleteAccount}
          onEnableAccount={handleEnableAccount}
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
