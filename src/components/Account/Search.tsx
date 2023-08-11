import React, { useEffect } from 'react';
import { Stack } from 'react-bootstrap';
import useAxios from 'axios-hooks';
import { AccountResponse, UserData } from './Interfaces';
import Backdrop from '../Backdrop/Backdrop';
import RingLoader from 'react-spinners/RingLoader';
import AccountTable from './Table'; // Import the AccountTable component

export const Search = () => {
    const [{ data: accountResponse, loading: accountLoading }, refetchAccounts] =
        useAxios<AccountResponse>(
            {
                url: '/user',
                method: 'GET',
            },
            { manual: true }
        );

    const [{ loading: deleteLoading }, deleteUser] = useAxios<void>(
        {
            method: "DELETE",
        },
        {
            manual: true,
        },
    );

    const pageLoading = accountLoading;

    // Fetch user data when the component mounts
    useEffect(() => {
        void refetchAccounts();
    }, []);

    const handleDeleteAccount = (accountId: number) => {
        // Implement your logic to handle delete here
        console.log('Delete account with ID:', accountId);
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


