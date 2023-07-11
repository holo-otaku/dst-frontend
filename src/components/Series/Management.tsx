import { useEffect } from "react";
import { SeriesTable } from "./Table";
import { Controls } from "./Controls";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { SeriesMutliResponse } from "./Interfaces";

export const Management = () => {
  const [{ data, loading }, refetch] = useAxios<SeriesMutliResponse>({
    url: "/series",
    method: "GET",
  });
  const [{ data: deleteResponse, loading: deleteLoading }, deleteSeries] = useAxios<void>({
    method: "DELETE",
  });

  useEffect(() => {
    void refetch();
  }, [refetch, deleteResponse]);

  const handleDelete = (id: number) => {
    void deleteSeries({
      url: `/series/${id}`,
    });
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
