import { useEffect } from "react";
import { Stack } from "react-bootstrap";
import useAxios from "axios-hooks";
import { AccountResponse } from "./Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import AccountTable from "./Table"; // Import the AccountTable component

export const Search = () => {
  const [{ data: accountResponse, loading: accountLoading }, refetchAccounts] =
    useAxios<AccountResponse>({
      url: "/user",
      method: "GET",
    });

  const [{ loading: deleteLoading }, deleteUser] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    void refetchAccounts();
    return () => {};
  }, [refetchAccounts]);

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
    </Stack>
  );
};
