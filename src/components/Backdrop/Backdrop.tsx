import { ReactNode } from "react";

interface BackdropProps {
  show: boolean;
  children: ReactNode;
}

const Backdrop = ({ show, children }: BackdropProps) =>
  show && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );

export default Backdrop;
