import { Image, Alert } from "react-bootstrap";
import { ProductData, ProductDataAttribute } from "./Interface";
import { useNavigate } from "react-router-dom";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import useAxios from "axios-hooks";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  RowDoubleClickedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./ProductTable.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const PREVIEW_WIDTH = 320;
const PREVIEW_MAX_HEIGHT = 360;
const PREVIEW_GUTTER = 12;
const FONT_SIZE_STORAGE_KEY = "productTable.fontSize";
const FONT_SIZE_DEFAULT = 16;
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 18;
type PreviewPosition = { top: number; left: number; maxHeight: number };

const calculatePreviewPosition = (rect: DOMRect): PreviewPosition => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxHeight = Math.min(PREVIEW_MAX_HEIGHT, viewportHeight - PREVIEW_GUTTER * 2);

  let left = rect.left + rect.width / 2;
  left = Math.min(viewportWidth - PREVIEW_GUTTER, Math.max(PREVIEW_GUTTER, left));

  let top = rect.bottom + PREVIEW_GUTTER;
  if (top + maxHeight > viewportHeight - PREVIEW_GUTTER) {
    top = Math.max(PREVIEW_GUTTER, rect.top - maxHeight - PREVIEW_GUTTER);
  }

  return { top, left, maxHeight };
};

interface ProductTableProps {
  products: ProductData[];
  sortState: { fieldId: number; order: "asc" | "desc" };
  setSortState: (sortState: { fieldId: number; order: "asc" | "desc" }) => void;
  showCheckbox: boolean;
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const ProductTable = ({
  products,
  sortState,
  setSortState,
  showCheckbox,
  selectedIds,
  setSelectedIds,
}: ProductTableProps) => {
  const navigate = useNavigate();
  const [maxHeight, setMaxHeight] = useState("400px");
  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, parsed));
      }
    }
    return FONT_SIZE_DEFAULT;
  });
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    const calculateMaxHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 120;
      const footerHeight = 100;
      const paddingBuffer = 50;
      const calculatedHeight =
        windowHeight - headerHeight - footerHeight - paddingBuffer;
      setMaxHeight(`${Math.max(calculatedHeight, 300)}px`);
    };

    calculateMaxHeight();
    window.addEventListener("resize", calculateMaxHeight);
    return () => window.removeEventListener("resize", calculateMaxHeight);
  }, []);

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize));
    if (!gridRef.current?.api) return;
    gridRef.current.api.resetRowHeights();
    gridRef.current.api.refreshCells({ force: true });
    gridRef.current.api.autoSizeAllColumns();
  }, [fontSize]);

  const renderCellValue = useCallback(
    (dataType: string, value: string | number | boolean | null | undefined) => {
      const serverBaseUrl = import.meta.env.VITE_API_HOST;

      if (value === null || value === undefined) return "";

      switch (dataType) {
        case "boolean":
          return value ? "True" : "False";
        case "picture":
          if (value && typeof value === "string") {
            return (
              <AuthorizedImage
                src={`${serverBaseUrl}${value}`}
                alt="Product"
                style={{ maxWidth: "100px" }}
              />
            );
          }
          return "";
        case "image":
          if (typeof value === "string" && value.trim() !== "") {
            return (
              <ProductImage
                src={value}
                alt="Product"
                style={{ maxWidth: "80px", maxHeight: "60px" }}
              />
            );
          }
          return "No Image";
        default:
          return String(value);
      }
    },
    []
  );

  const columnDefs = useMemo((): ColDef[] => {
    if (products.length === 0) return [];

    const cols: ColDef[] = [];
    const attributes = products[0].attributes || [];
    const erpAttributes = products[0].erp || [];

    if (showCheckbox) {
      cols.push({
        colId: "checkbox",
        headerName: "",
        field: undefined,
        valueGetter: () => "",
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        pinned: "left",
        lockPinned: true,
        suppressMovable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        resizable: false,
        suppressSizeToFit: true,
      });
    }

    cols.push({
      colId: "id",
      headerName: "#",
      field: "itemId",
      width: 80,
      pinned: "left",
      lockPinned: true,
      suppressMovable: true,
      resizable: true,
      cellClass: "monospace-cell",
      cellStyle: { color: "#2563eb", fontWeight: "500" },
    });

    attributes.slice(0, 5).forEach((attr: ProductDataAttribute) => {
      cols.push({
        colId: `attr_${attr.fieldId}`,
        headerName: attr.fieldName,
        field: `attributes`,
        valueGetter: (params) => {
          const attribute = (params.data as ProductData)?.attributes?.find(
            (a: ProductDataAttribute) => a.fieldId === attr.fieldId
          );
          return attribute?.value;
        },
        cellRenderer: (params: ICellRendererParams<ProductData>) => {
          const attribute = params.data?.attributes?.find(
            (a: ProductDataAttribute) => a.fieldId === attr.fieldId
          );
          if (!attribute) return "";
          return renderCellValue(attribute.dataType, attribute.value);
        },
        minWidth: 100,
        maxWidth: 800,
        resizable: true,
        sortable: true,
        cellClass:
          attr.dataType === "image" || attr.dataType === "picture"
            ? "image-cell"
            : undefined,
      });
    });

    attributes.slice(5).forEach((attr: ProductDataAttribute) => {
      cols.push({
        colId: `attr_${attr.fieldId}`,
        headerName: attr.fieldName,
        field: `attributes`,
        valueGetter: (params) => {
          const attribute = (params.data as ProductData)?.attributes?.find(
            (a: ProductDataAttribute) => a.fieldId === attr.fieldId
          );
          return attribute?.value;
        },
        cellRenderer: (params: ICellRendererParams<ProductData>) => {
          const attribute = params.data?.attributes?.find(
            (a: ProductDataAttribute) => a.fieldId === attr.fieldId
          );
          if (!attribute) return "";
          return renderCellValue(attribute.dataType, attribute.value);
        },
        minWidth: 100,
        maxWidth: 800,
        resizable: true,
        sortable: true,
        cellClass:
          attr.dataType === "image" || attr.dataType === "picture"
            ? "image-cell"
            : undefined,
      });
    });

    erpAttributes.forEach((erp) => {
      cols.push({
        colId: `erp_${erp.key}`,
        headerName: erp.key,
        field: "erp",
        valueGetter: (params) => {
          const erpData = (params.data as ProductData)?.erp?.find(
            (e) => e.key === erp.key
          );
          return erpData?.value || "";
        },
        minWidth: 100,
        maxWidth: 800,
        resizable: true,
        cellStyle: (params) => {
          const data = params.data as ProductData | undefined;
          if (data?.isDeleted || data?.hasArchive) {
            return undefined;
          }
          return { backgroundColor: "#DBEAFE" };
        },
      });
    });

    return cols;
  }, [products, showCheckbox, renderCellValue]);

  useEffect(() => {
    if (!gridRef.current?.api) return;

    const api = gridRef.current.api;
    api.forEachNode((node) => {
      const data = node.data as ProductData | undefined;
      if (!data) return;
      const isSelected = selectedIds.has(data.itemId);
      node.setSelected(isSelected);
    });
  }, [selectedIds]);

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent<ProductData>) => {
      const selectedNodes = event.api.getSelectedNodes();
      const newSelectedIds = new Set(
        selectedNodes.map((node) => (node.data as ProductData).itemId)
      );
      setSelectedIds(newSelectedIds);
    },
    [setSelectedIds]
  );

  const onSortChanged = useCallback(
    (event: SortChangedEvent) => {
      const columnState = event.api.getColumnState();
      const sortedColumn = columnState.find((col) => col.sort !== null);

      if (sortedColumn) {
        const colId = sortedColumn.colId || "";
        if (colId.startsWith("attr_")) {
          const fieldId = parseInt(colId.split("_")[1]);
          const order = sortedColumn.sort === "asc" ? "asc" : "desc";
          setSortState({ fieldId, order });
        }
      } else {
        setSortState({ fieldId: -1, order: "asc" });
      }
    },
    [setSortState]
  );

  const onRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<ProductData>) => {
      if (!event.data) return;
      navigate(`/products/${event.data.itemId}/edit`);
    },
    [navigate]
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent<ProductData>) => {
      if (sortState.fieldId !== -1) {
        const colId = `attr_${sortState.fieldId}`;
        params.api.applyColumnState({
          state: [
            {
              colId,
              sort: sortState.order,
            },
          ],
          defaultState: { sort: null },
        });
      }

      params.api.autoSizeAllColumns();
    },
    [sortState]
  );

  useEffect(() => {
    if (!gridRef.current?.api) return;

    gridRef.current.api.autoSizeAllColumns();
  }, [products, columnDefs]);

  useEffect(() => {
    if (!gridRef.current?.api || sortState.fieldId === -1) return;

    const colId = `attr_${sortState.fieldId}`;
    gridRef.current.api.applyColumnState({
      state: [
        {
          colId,
          sort: sortState.order,
        },
      ],
      defaultState: { sort: null },
    });
  }, [sortState]);

  const rowHeight = Math.max(fontSize + 10, 40);
  const headerHeight = 48;

  const handleFontSizeChange = (value: number) => {
    const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
    setFontSize(clamped);
  };

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  return (
    <div className="product-table-shell">
      <div className="product-table-toolbar">
        <label className="font-size-label" htmlFor="font-size-control">
          字體大小
        </label>
        <input
          id="font-size-control"
          type="range"
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          value={fontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          aria-label="字體大小"
        />
        <div className="font-size-value">{fontSize}px</div>
      </div>

      <div
        className="ag-theme-quartz ag-theme-custom product-table-container"
        style={{
          height: maxHeight,
          width: "100%",
          ["--pt-font-size" as string]: `${fontSize}px`,
          ["--pt-row-height" as string]: `${rowHeight}px`,
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={products}
          columnDefs={columnDefs}
          rowSelection={showCheckbox ? "multiple" : undefined}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          onSelectionChanged={onSelectionChanged}
          onSortChanged={onSortChanged}
          onRowDoubleClicked={onRowDoubleClicked}
          onGridReady={onGridReady}
          rowClassRules={{
            "row-deleted": (params) => {
              const data = params.data as ProductData | undefined;
              return !!data?.isDeleted;
            },
            "row-archived": (params) => {
              const data = params.data as ProductData | undefined;
              return !!data?.hasArchive && !data?.isDeleted;
            },
          }}
          suppressRowClickSelection={true}
          domLayout="normal"
        />
      </div>
    </div>
  );
};

const ProductImage = ({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition>({
    top: 0,
    left: 0,
    maxHeight: PREVIEW_MAX_HEIGHT,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setImageSrc(src);
      setHasError(false);
    });
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
  };

  const handleMouseEnter = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPreviewPosition(calculatePreviewPosition(rect));
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  if (hasError || !src) {
    return (
      <div
        className="image-thumb-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={wrapperRef}
      >
        <div
          className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-thumb"
          style={style}
        >
          No Image
        </div>
        {showPreview &&
          createPortal(
            <div
            className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-preview"
            style={{
              top: previewPosition.top,
              left: previewPosition.left,
              width: PREVIEW_WIDTH,
              maxHeight: previewPosition.maxHeight,
              transform: "translate(-50%, 0)",
            }}
          >
              No Image
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div
      className="image-thumb-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={wrapperRef}
    >
      <Image
        src={imageSrc}
        alt={alt}
        style={style}
        onError={handleImageError}
        className="object-cover rounded image-thumb"
      />
      {showPreview &&
        createPortal(
          <Image
            src={imageSrc}
            alt={alt}
            className="object-cover rounded image-preview"
            style={{
              top: previewPosition.top,
              left: previewPosition.left,
              width: PREVIEW_WIDTH,
              maxHeight: previewPosition.maxHeight,
              transform: "translate(-50%, 0)",
            }}
          />,
          document.body
        )}
    </div>
  );
};

const AuthorizedImage = ({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const blobUrlRef = useRef<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition>({
    top: 0,
    left: 0,
    maxHeight: PREVIEW_MAX_HEIGHT,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [{ loading }, fetchImage] = useAxios<Blob>(
    {
      method: "GET",
      responseType: "blob",
    },
    { manual: true }
  );

  useEffect(() => {
    const imageId = src.split("/image/")[1];

    if (imageId) {
      fetchImage({
        url: `/image/${imageId}`,
      })
        .then((response) => {
          // Revoke previous blob URL before creating new one
          if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
            URL.revokeObjectURL(blobUrlRef.current);
          }

          const blobUrl = URL.createObjectURL(response.data);
          blobUrlRef.current = blobUrl;
          setImageSrc(blobUrl);
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });
    }

    return () => {
      if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = "";
      }
    };
  }, [src, fetchImage]);

  if (loading) {
    return (
      <div
        className="image-thumb-wrapper"
        onMouseEnter={() => {
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          setPreviewPosition(calculatePreviewPosition(rect));
          setShowPreview(true);
        }}
        onMouseLeave={() => setShowPreview(false)}
        ref={wrapperRef}
      >
        <div
          className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-thumb"
          style={style}
        >
          Loading...
        </div>
        {showPreview &&
          createPortal(
            <div
              className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-preview"
              style={{
                top: previewPosition.top,
                left: previewPosition.left,
                width: PREVIEW_WIDTH,
                maxHeight: previewPosition.maxHeight,
                transform: "translate(-50%, 0)",
              }}
            >
              Loading...
            </div>,
            document.body
          )}
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div
        className="image-thumb-wrapper"
        onMouseEnter={() => {
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          setPreviewPosition(calculatePreviewPosition(rect));
          setShowPreview(true);
        }}
        onMouseLeave={() => setShowPreview(false)}
        ref={wrapperRef}
      >
        <div
          className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-thumb"
          style={style}
        >
          No Image
        </div>
        {showPreview &&
          createPortal(
            <div
              className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs rounded image-preview"
              style={{
                top: previewPosition.top,
                left: previewPosition.left,
                width: PREVIEW_WIDTH,
                maxHeight: previewPosition.maxHeight,
                transform: "translate(-50%, 0)",
              }}
            >
              No Image
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div
      className="image-thumb-wrapper"
      onMouseEnter={() => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        setPreviewPosition(calculatePreviewPosition(rect));
        setShowPreview(true);
      }}
      onMouseLeave={() => setShowPreview(false)}
      ref={wrapperRef}
    >
      <Image
        src={imageSrc}
        alt={alt}
        style={style}
        className="object-cover rounded image-thumb"
      />
      {showPreview &&
        createPortal(
          <Image
            src={imageSrc}
            alt={alt}
            className="object-cover rounded image-preview"
            style={{
              top: previewPosition.top,
              left: previewPosition.left,
              width: PREVIEW_WIDTH,
              maxHeight: previewPosition.maxHeight,
              transform: "translate(-50%, 0)",
            }}
          />, 
          document.body
        )}
    </div>
  );
};

export default ProductTable;
