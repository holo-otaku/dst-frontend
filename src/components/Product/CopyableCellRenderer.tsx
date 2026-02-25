import React, { useState, useCallback } from "react";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";

interface CopyableCellRendererProps {
  value: string | null | undefined;
  children?: React.ReactNode;
  onCopySuccess?: () => void;
}

const CopyableCellRenderer = ({
  value,
  children,
  onCopySuccess,
}: CopyableCellRendererProps) => {
  const [copied, setCopied] = useState(false);
  const text = value != null ? String(value) : "";
  const hasValue = text !== "";

  const copyValue = useCallback(() => {
    if (!hasValue) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        onCopySuccess?.();
      })
      .catch((error: unknown) => {
        console.error("Failed to copy text to clipboard:", error);
      });
  }, [hasValue, text, onCopySuccess]);

  const handleButtonCopy = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      copyValue();
    },
    [copyValue]
  );

  const handleCellCopy = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      const selectedText = window.getSelection()?.toString() ?? "";
      if (selectedText.trim() !== "") return;
      copyValue();
    },
    [copyValue]
  );

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      copyValue();
    },
    [copyValue]
  );

  return (
    <div
      className={`copyable-cell${hasValue ? " copyable-cell--active" : ""}`}
      onClick={handleCellCopy}
      onKeyDown={handleCellKeyDown}
      role={hasValue ? "button" : undefined}
      tabIndex={hasValue ? 0 : -1}
      title={hasValue ? (copied ? "已複製" : "點擊可複製") : undefined}
      aria-label={hasValue ? "點擊即可複製儲存格內容" : undefined}
    >
      <span className="copyable-cell__text">{children ?? value}</span>
      {hasValue && (
        <button
          className={`copyable-cell__btn${copied ? " copyable-cell__btn--copied" : ""}`}
          onClick={handleButtonCopy}
          title={copied ? "已複製" : "複製"}
          tabIndex={-1}
          aria-label="複製儲存格內容"
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
