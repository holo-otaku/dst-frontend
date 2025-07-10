import useAxios from "axios-hooks";
import {
  CopyProductResponse,
  CopyProductPayloadField,
} from "../components/Product/Interface";

const useCopyProduct = () => {
  const [{ loading, error }, copyProduct] = useAxios<
    CopyProductResponse,
    CopyProductPayloadField
  >(
    {
      url: "/product/copy",
      method: "POST",
    },
    {
      manual: true,
    }
  );

  return { loading, error, copyProduct };
};

export default useCopyProduct;
