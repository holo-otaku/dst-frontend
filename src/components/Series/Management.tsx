import { useEffect } from "react";
import { SeriesTable } from "./Table";
import { Controls } from "./Controls";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { SeriesResponse } from "./Interfaces";

export const Management = () => {
  const [{ data, loading }, refetch] = useAxios<SeriesResponse>(
    {
      url: "/series",
      method: "GET",
    },
    { manual: true },
  );
  const [{ loading: deleteLoading }, deleteSeries] = useAxios<void>(
    {
      method: "DELETE",
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    void refetch();
    return () => {};
  }, [refetch]);

  const handleDelete = (id: number) => {
    void deleteSeries({
      url: `/series/${id}`,
    }).then(() => refetch());
  };

  const pageLoading = loading || deleteLoading;

  return (
    <>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Controls />
      {data && <SeriesTable data={data.data} handleDelete={handleDelete} />}
    </>
  );
};
