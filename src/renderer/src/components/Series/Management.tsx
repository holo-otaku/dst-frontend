import { useEffect, useState } from "react";
import { SeriesTable } from "./Table";
import { Controls } from "./Controls";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { SeriesResponse } from "./Interfaces";
import { Pagination, Stack } from "react-bootstrap";

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
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const totalCount = data?.totalCount || 0;
  const totalPage = Math.ceil(totalCount / limit);

  useEffect(() => {
    void refetch({
      params: {
        page,
        limit,
      },
    });
    return () => {};
  }, [refetch, page]);

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
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} />
          {Array.from({ length: totalPage }).map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === page}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Last onClick={() => setPage(totalPage)} />
        </Pagination>
      </Stack>
    </Stack>
  );
};
