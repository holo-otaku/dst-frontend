import Series, {
  Management,
  Create as SeriesCreate,
  Edit as SeriesEdit,
} from "@renderer/components/Series";
import { Route, Routes } from "react-router-dom";

export const SeriesRoute = () => (
  <Routes>
    <Route element={<Series />}>
      <Route index element={<Management />} />
      <Route path="/series/create" element={<SeriesCreate />} />
      <Route path=":id/edit" element={<SeriesEdit />} />
    </Route>
  </Routes>
);
