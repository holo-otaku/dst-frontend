import { useEffect } from "react";
import { SeriesTable } from "./Table";
import { Controls } from "./Controls";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { SeriesResponse } from "./Interfaces";
import { Stack } from "react-bootstrap";
import { Pagination } from "../Pagination";
import { usePaginate } from "@renderer/hooks";
import { get } from "lodash";

export const Management = () => {
  const [{ data, loading }, refetch] = useAxios<SeriesResponse>(
    {
      url: "/series",
      method: "GET",
    },
    { manual: true }
  );
  const [{ loading: deleteLoading }, deleteSeries] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    }
  );
  const [{ currentPage, availablePages, limit }, PaginateAction] = usePaginate({
    total: get(data, "totalCount", 0),
    limit: 10,
  });

  useEffect(() => {
    if (data) {
      PaginateAction.changeTotal(data.totalCount);
    }
  }, [data]);

  useEffect(() => {
    void refetch({
      params: {
        page: currentPage,
        limit,
      },
    });
    return () => {};
  }, [refetch, currentPage]);

  const handleDelete = (id: number) => {
    void deleteSeries({
      url: `/series/${id}`,
    }).then(() => refetch());
  };

  const pageLoading = loading || deleteLoading;

  return (
    <Stack gap={2}>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Controls />
      {data && <SeriesTable data={data.data} handleDelete={handleDelete} />}
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
