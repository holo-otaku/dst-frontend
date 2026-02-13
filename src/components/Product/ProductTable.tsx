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
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "./ProductTable.css";

ModuleRegistry.registerModules([AllCommunityModule]);

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
  const gridRef = useRef<AgGridReact>(null);

  // 自定義 theme：基於 themeQuartz 但覆蓋顏色
  const customTheme = useMemo(
    () =>
      themeQuartz.withParams({
        backgroundColor: "#f8fafc",
        foregroundColor: "#1e3a8a",
        borderColor: "#e2e8f0",
        headerBackgroundColor: "#ffffff",
        oddRowBackgroundColor: "#f8fafc",
        rowHoverColor: "#f1f5f9",
        selectedRowBackgroundColor: "#dbeafe",
        fontFamily: '"Fira Sans", sans-serif',
        fontSize: 14,
        rowHeight: 48,
        headerHeight: 48,
        cellHorizontalPadding: 16,
        checkboxCheckedShapeColor: "#3b82f6",
        borderRadius: 8,
      }),
    []
  );

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
        maxWidth: 400,
        pinned: "left",
        lockPinned: true,
        resizable: true,
        sortable: true,
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
        maxWidth: 400,
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
        maxWidth: 400,
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
      initialPinned: "left" as const,
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

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  return (
    <div
      className="product-table-container"
      style={{ height: maxHeight, width: "100%" }}
    >
      <AgGridReact
        ref={gridRef}
        theme={customTheme}
        rowData={products}
        columnDefs={columnDefs}
        rowSelection={rowSelection}
        selectionColumnDef={selectionColumnDef}
        rowHeight={48}
        headerHeight={48}
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
        domLayout="normal"
      />
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
