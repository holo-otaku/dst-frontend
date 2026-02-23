import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImagePreviewRendererProps {
  thumbnail: React.ReactNode;
  preview: React.ReactNode;
  previewWidth?: number;
  previewHeight?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ImagePreviewRenderer = ({
  thumbnail,
  preview,
  previewWidth = 360,
  previewHeight = 260,
}: ImagePreviewRendererProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const mountedRoot = useMemo(() => document.body, []);

  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const updatePosition = (clientX: number, clientY: number) => {
    const offset = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const left = clamp(
      clientX + offset + scrollX,
      scrollX + 8,
      scrollX + viewportWidth - previewWidth - 8
    );
    const preferredTop = clientY + offset + scrollY;
    const maxTop = scrollY + viewportHeight - previewHeight - 8;
    const top =
      preferredTop > maxTop
        ? clamp(clientY - previewHeight - offset + scrollY, scrollY + 8, maxTop)
        : clamp(preferredTop, scrollY + 8, maxTop);
    setPosition({ top, left });
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(event.clientX, event.clientY);
    setIsOpen(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    updatePosition(event.clientX, event.clientY);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="image-preview-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {thumbnail}
      {isOpen &&
        mountedRoot &&
        createPortal(
          <div
            className="image-preview-tooltip"
            style={{
              top: position.top,
              left: position.left,
              width: previewWidth,
              maxHeight: previewHeight,
            }}
          >
            {preview}
          </div>,
          mountedRoot
        )}
    </div>
  );
};

export default ImagePreviewRenderer;
