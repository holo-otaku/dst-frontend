import useAxios from "axios-hooks";
import { ProductDeletePayload } from "../components/Product/Interface";

const useDeleteProduct = () => {
  const [{ loading, error }, deleteProduct] = useAxios<
    APIResponse,
    ProductDeletePayload,
    APIResponse
  >(
    {
      url: `/product/delete`,
      method: "DELETE",
    },
    {
      manual: true,
    }
  );

  return { loading, error, deleteProduct };
};

export default useDeleteProduct;
