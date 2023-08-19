import { useEffect } from "react";
import useAxios from "axios-hooks";
import { Button, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { ProductDeletePayload } from "./Interface";

export const Delete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!error) return;
    alert("刪除失敗" + error.response?.data?.msg);
  }, [error]);

  if (!id) {
    alert("無效的產品ID");
    navigate(-1);
    return;
  }

  return (
    <div
      className="modal show"
      style={{ display: "block", position: "initial" }}
    >
      <Backdrop show={loading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>確定刪除此產品?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>刪除後無法復原，請確認是否執行此動作</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              deleteProduct({ data: { itemId: [parseInt(id)] } }).then(() =>
                navigate("/products")
              )
            }
          >
            確定
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
};
