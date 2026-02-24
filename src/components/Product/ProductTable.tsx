import { Image, Alert } from "react-bootstrap";
import { ProductData, ProductDataAttribute } from "./Interface";
import { useNavigate } from "react-router-dom";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from "react";
import useAxios from "axios-hooks";
import { ColorModeContext } from "../../context";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  RowDoubleClickedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  ICellRendererParams,
  themeQuartz,
  ColumnHeaderContextMenuEvent,
  Column,
  type ColumnState,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import ImagePreviewRenderer from "./ImagePreviewRenderer";
import CopyableCellRenderer from "./CopyableCellRenderer";
import "./ProductTable.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const COLUMN_STATE_KEY_PREFIX = "dst_product_col_state_";

const loadColumnState = (seriesId: string | number): ColumnState[] | null => {
  try {
    const raw = localStorage.getItem(`${COLUMN_STATE_KEY_PREFIX}${seriesId}`);
    return raw ? (JSON.parse(raw) as ColumnState[]) : null;
  } catch {
    return null;
  }
};

const saveColumnState = (seriesId: string | number, state: unknown) => {
  try {
    localStorage.setItem(
      `${COLUMN_STATE_KEY_PREFIX}${seriesId}`,
      JSON.stringify(state)
    );
  } catch {
    return;
  }
};

interface ProductTableProps {
  products: ProductData[];
  sortState: { fieldId: number; order: "asc" | "desc" };
  setSortState: (sortState: { fieldId: number; order: "asc" | "desc" }) => void;
  showCheckbox: boolean;
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  seriesId: number;
}

const ProductTable = ({
  products,
  sortState,
  setSortState,
  showCheckbox,
  selectedIds,
  setSelectedIds,
  seriesId,
}: ProductTableProps) => {
  const navigate = useNavigate();
  const { colorMode } = useContext(ColorModeContext);
  const [maxHeight, setMaxHeight] = useState("400px");
  const gridRef = useRef<AgGridReact>(null);
  const lastContextMenuPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [headerMenu, setHeaderMenu] = useState<{
    x: number;
    y: number;
    colId: string;
    isPinned: boolean;
  } | null>(null);

  const onColumnHeaderContextMenu = useCallback(
    (e: ColumnHeaderContextMenuEvent) => {
      const col = e.column as Column;
      if (typeof col.getColId !== "function") return;
      const colId = col.getColId();
      // Don't allow pin/unpin on the # (id) column which is lockPinned
      if (colId === "id") return;
      const isPinned = col.isPinnedLeft() || col.isPinnedRight();
      setHeaderMenu({
        x: lastContextMenuPos.current.x,
        y: lastContextMenuPos.current.y,
        colId,
        isPinned,
      });
    },
    []
  );

  // 自定義 theme：基於 themeQuartz，依 colorMode 切換亮/暗色
  const customTheme = useMemo(() => {
    const isDark = colorMode === "dark";
    return themeQuartz.withParams({
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      foregroundColor: isDark ? "#e2e8f0" : "#1e3a8a",
      borderColor: isDark ? "#334155" : "#e2e8f0",
      headerBackgroundColor: isDark ? "#0f172a" : "#ffffff",
      oddRowBackgroundColor: isDark ? "#1e293b" : "#f8fafc",
      rowHoverColor: isDark ? "#334155" : "#f1f5f9",
      selectedRowBackgroundColor: isDark ? "#1d4ed8" : "#dbeafe",
      fontFamily: '"Fira Sans", sans-serif',
      fontSize: 14,
      rowHeight: 88,
      headerHeight: 48,
      cellHorizontalPadding: 16,
      checkboxCheckedShapeColor: "#3b82f6",
      borderRadius: 8,
    });
  }, [colorMode]);

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
    if (!headerMenu) return;
    const close = () => setHeaderMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
    };
  }, [headerMenu]);

  const renderCellValue = useCallback(
    (
      dataType: string,
      value: string | number | boolean | null | undefined,
      productData?: ProductData
    ) => {
      const serverBaseUrl = import.meta.env.VITE_API_HOST;

      const getProductName = () => {
        const productNameValue = productData?.attributes?.find(
          (a: ProductDataAttribute) => a.fieldName === "供應商料號"
        )?.value;
        return typeof productNameValue === "string"
          ? productNameValue
          : undefined;
      };

      if (value === null || value === undefined) return "";

      switch (dataType) {
        case "boolean":
          return value ? "True" : "False";
        case "picture":
          if (value && typeof value === "string") {
            const productName = getProductName();
            const altText = productName
              ? `${productName} 產品圖片`
              : "產品圖片";
            const thumbnail = (
              <AuthorizedImage
                src={`${serverBaseUrl}${value}`}
                alt={altText}
                style={{ maxWidth: "100px", maxHeight: "80px" }}
              />
            );
            const preview = (
              <AuthorizedImage
                src={`${serverBaseUrl}${value}`}
                alt={altText}
                style={{ maxWidth: "420px", maxHeight: "320px" }}
              />
            );
            return (
              <ImagePreviewRenderer
                thumbnail={thumbnail}
                preview={preview}
                previewWidth={420}
                previewHeight={320}
              />
            );
          }
          return "";
        case "image":
          if (typeof value === "string" && value.trim() !== "") {
            const productName = getProductName();
            const altText = productName
              ? `${productName} 產品圖片`
              : "產品圖片";
            const thumbnail = (
              <ProductImage
                src={value}
                alt={altText}
                style={{ maxWidth: "80px", maxHeight: "60px" }}
              />
            );
            const preview = (
              <ProductImage
                src={value}
                alt={altText}
                style={{ maxWidth: "420px", maxHeight: "320px" }}
              />
            );
            return (
              <ImagePreviewRenderer
                thumbnail={thumbnail}
                preview={preview}
                previewWidth={420}
                previewHeight={320}
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

    // Checkbox column is now handled by rowSelection config, not column definition
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

    const isDstPartNumber = (fieldName: string) => {
      const lower = fieldName.toLowerCase();
      return lower.includes("dst") && lower.includes("料號");
    };

    attributes.forEach((attr: ProductDataAttribute) => {
      const shouldPin = isDstPartNumber(attr.fieldName);
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
          const rendered = renderCellValue(
            attribute.dataType,
            attribute.value,
            params.data
          );
          if (attribute.dataType === "picture") return rendered;
          const textValue =
            attribute.value != null ? String(attribute.value) : "";
          return (
            <CopyableCellRenderer value={textValue}>
              {rendered}
            </CopyableCellRenderer>
          );
        },
        minWidth: 100,
        ...(shouldPin && { pinned: "left" as const, lockPinned: true }),
        resizable: true,
        sortable: true,
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

  const rowSelection = useMemo(
    () => ({
      mode: "multiRow" as const,
      checkboxes: showCheckbox,
      headerCheckbox: showCheckbox,
      enableClickSelection: false,
      selectAll: "filtered" as const,
    }),
    [showCheckbox]
  );

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

  const selectionColumnDef = useMemo(
    () => ({
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      resizable: false,
      suppressMovable: true,
      lockPosition: "left" as const,
      pinned: "left" as const,
      headerName: "",
    }),
    []
  );

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

      const saved = loadColumnState(seriesId);
      if (saved) {
        params.api.applyColumnState({ state: saved, applyOrder: true });
      } else {
        params.api.autoSizeAllColumns();
      }
    },
    [sortState, seriesId]
  );

  useEffect(() => {
    if (!gridRef.current?.api) return;
    const saved = loadColumnState(seriesId);
    if (saved) {
      gridRef.current.api.applyColumnState({ state: saved, applyOrder: true });
    } else {
      gridRef.current.api.autoSizeAllColumns();
    }
  }, [products, columnDefs, seriesId]);

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

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  return (
    <div
      className="product-table-container"
      style={{ height: maxHeight, width: "100%" }}
      onContextMenu={(ev) => {
        lastContextMenuPos.current = { x: ev.clientX, y: ev.clientY };
        const target = ev.target as HTMLElement;
        if (target.closest(".ag-header-cell")) {
          ev.preventDefault();
        }
      }}
    >
      <AgGridReact
        ref={gridRef}
        theme={customTheme}
        rowData={products}
        columnDefs={columnDefs}
        defaultColDef={{ suppressHeaderMenuButton: false }}
        rowSelection={rowSelection}
        selectionColumnDef={selectionColumnDef}
        onSelectionChanged={onSelectionChanged}
        onSortChanged={onSortChanged}
        onRowDoubleClicked={onRowDoubleClicked}
        onGridReady={onGridReady}
        onColumnHeaderContextMenu={onColumnHeaderContextMenu}
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
        domLayout="normal"
        enableCellTextSelection={true}
      />
      {headerMenu && (
        <div
          className="col-header-context-menu"
          style={{ top: headerMenu.y, left: headerMenu.x }}
          onClick={(ev) => ev.stopPropagation()}
        >
          {headerMenu.isPinned ? (
            <button
              className="col-header-context-menu__item"
              onClick={() => {
                gridRef.current!.api.setColumnsPinned([headerMenu.colId], null);
                saveColumnState(
                  seriesId,
                  gridRef.current!.api.getColumnState()
                );
                setHeaderMenu(null);
              }}
            >
              <span className="col-header-context-menu__icon">📌</span>
              Unpin Column
            </button>
          ) : (
            <button
              className="col-header-context-menu__item"
              onClick={() => {
                gridRef.current!.api.setColumnsPinned(
                  [headerMenu.colId],
                  "left"
                );
                saveColumnState(
                  seriesId,
                  gridRef.current!.api.getColumnState()
                );
                setHeaderMenu(null);
              }}
            >
              <span className="col-header-context-menu__icon">📌</span>
              Pin Left
            </button>
          )}
        </div>
      )}
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

  useEffect(() => {
    queueMicrotask(() => {
      setImageSrc(src);
      setHasError(false);
    });
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div
        className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs"
        style={style}
      >
        No Image
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      style={style}
      onError={handleImageError}
      className="object-cover rounded"
    />
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
        className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs"
        style={style}
      >
        Loading...
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div
        className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs"
        style={style}
      >
        No Image
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      style={style}
      className="object-cover rounded"
    />
  );
};

export default ProductTable;
