import React, { useState, useCallback } from "react";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";

interface CopyableCellRendererProps {
  value: string | null | undefined;
  children?: React.ReactNode;
}

const CopyableCellRenderer = ({
  value,
  children,
}: CopyableCellRendererProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const text = value != null ? String(value) : "";
      if (!text) return;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((error: unknown) => {
          console.error("Failed to copy text to clipboard:", error);
        });
    },
    [value]
  );

  return (
    <div className="copyable-cell">
      <span className="copyable-cell__text">{children ?? value}</span>
      {value != null && value !== "" && (
        <button
          className={`copyable-cell__btn${copied ? " copyable-cell__btn--copied" : ""}`}
          onClick={handleCopy}
          title={copied ? "已複製" : "複製"}
          tabIndex={-1}
        >
          {copied ? (
            <IoCheckmarkOutline size={13} />
          ) : (
            <IoCopyOutline size={13} />
          )}
        </button>
      )}
    </div>
  );
};

export default CopyableCellRenderer;
