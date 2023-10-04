import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmDeleteModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

const Delete: React.FC<ConfirmDeleteModalProps> = ({
  show,
  onHide,
  onConfirm,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>確定刪除此系列?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>刪除後無法復原，請確認是否執行此動作</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          取消
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          確定
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Delete;
