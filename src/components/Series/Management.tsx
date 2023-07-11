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

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <>
      <Backdrop show={loading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Controls />
      {data && <SeriesTable data={data.data} />}
    </>
  );
};
