import { Image, Alert } from "react-bootstrap";
import { ProductData } from "./Interface";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import useAxios from "axios-hooks";

// 模組級別的文字測量函式
const createTextMeasurer = () => {
  const canvasRef = { current: null as HTMLCanvasElement | null };
  const ctxRef = { current: null as CanvasRenderingContext2D | null };
  const lastFontRef = { current: "" };

  return (text: string, font: string): number => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      ctxRef.current = canvasRef.current.getContext("2d");
    }
    if (!ctxRef.current) return text.length * 8;
    if (lastFontRef.current !== font) {
      ctxRef.current.font = font;
      lastFontRef.current = font;
    }
    return ctxRef.current.measureText(text).width;
  };
};

const measureTextPx = createTextMeasurer();

interface ProductTableProps {
  products: ProductData[];
  sortState: { fieldId: number; order: "asc" | "desc" };
  setSortState: (sortState: { fieldId: number; order: "asc" | "desc" }) => void;
  showCheckbox: boolean;
  selectedIds: Set<number>;
  toggleCheckbox: (id: number) => void;
  handleHeaderCheckbox: () => void;
}

const ProductTable = ({
  products,
  sortState,
  setSortState,
  showCheckbox,
  selectedIds,
  toggleCheckbox,
  handleHeaderCheckbox,
}: ProductTableProps) => {
  const [maxHeight, setMaxHeight] = useState("400px");
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const userResizedColumnsRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  const STORAGE_KEY_PREFIX = "productTable_columnWidths_";

  // 取得當前 seriesId
  const getCurrentSeriesId = (): number | null => {
    return products.length > 0 ? products[0].seriesId : null;
  };

  // 取得包含 seriesId 的 storage key
  const getStorageKey = (seriesId: number | null): string => {
    return seriesId !== null
      ? `${STORAGE_KEY_PREFIX}${seriesId}`
      : `${STORAGE_KEY_PREFIX}default`;
  };

  // 從 localStorage 讀取已保存的欄寬
  const loadSavedWidths = (
    seriesId: number | null
  ): { [key: string]: number } => {
    try {
      const saved = localStorage.getItem(getStorageKey(seriesId));
      return saved ? (JSON.parse(saved) as { [key: string]: number }) : {};
    } catch {
      return {};
    }
  };

  // 保存欄寬到 localStorage
  const saveWidthToStorage = (
    seriesId: number | null,
    columnKey: string,
    width: number
  ) => {
    try {
      const saved = loadSavedWidths(seriesId);
      saved[columnKey] = width;
      localStorage.setItem(getStorageKey(seriesId), JSON.stringify(saved));
    } catch {
      // 忽略存儲錯誤
    }
  };

  const getGridFont = (): string => {
    if (!gridRef.current) return "14px system-ui";
    const style = window.getComputedStyle(gridRef.current);
    return style.font || "14px system-ui";
  };

  const clampWidth = (width: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, width));
  };

  // 初始化：讀取已保存的欄寬（當 seriesId 改變時重新讀取）
  useEffect(() => {
    const seriesId = getCurrentSeriesId();
    if (seriesId === null) return;

    const savedWidths = loadSavedWidths(seriesId);
    if (Object.keys(savedWidths).length > 0) {
      queueMicrotask(() => {
        setColumnWidths((prev) => ({ ...prev, ...savedWidths }));
        // 標記所有已保存的欄位為「用戶已調整」
        Object.keys(savedWidths).forEach((key) => {
          userResizedColumnsRef.current.add(key);
        });
      });
    }
  }, [products]);

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

  // 初始化欄位寬度
  useEffect(() => {
    if (products.length > 0) {
      const attributes = get(products, "[0].attributes", []);
      const erpAttributes = get(products, "[0].erp", []);
      const initialWidths: { [key: string]: number } = {};

      // 設定預設寬度
      if (showCheckbox) initialWidths["checkbox"] = 50;
      initialWidths["id"] = 80;

      // 固定前5個屬性的預設寬度
      const fixedWidths = [120, 150, 120, 100, 120];
      attributes.slice(0, 5).forEach((attr, index) => {
        initialWidths[`attr-${attr.fieldId}`] = fixedWidths[index] || 120;
      });

      // 其他屬性和ERP欄位
      attributes.slice(5).forEach((attr) => {
        initialWidths[`attr-${attr.fieldId}`] = 120;
      });

      erpAttributes.forEach((erp) => {
        initialWidths[`erp-${erp.key}`] = 120;
      });

      queueMicrotask(() => {
        setColumnWidths((prev) => ({ ...initialWidths, ...prev }));
      });
    }
  }, [products, showCheckbox]);

  // 依目前頁面資料自動估算欄位寬度（避免每次手動調整）
  useLayoutEffect(() => {
    if (products.length === 0) return;
    if (!gridRef.current) return;

    // 等待 DOM style 準備好（確保拿到正確 font）
    const rafId = window.requestAnimationFrame(() => {
      const font = getGridFont();
      const attributes = get(
        products,
        "[0].attributes",
        [] as ProductData["attributes"]
      );
      const erpAttributes = get(products, "[0].erp", [] as ProductData["erp"]);

      const allColumnKeys: string[] = [];
      if (showCheckbox) allColumnKeys.push("checkbox");
      allColumnKeys.push("id");
      attributes.forEach((attr) => {
        allColumnKeys.push(`attr-${attr.fieldId}`);
      });
      erpAttributes.forEach((erp) => {
        allColumnKeys.push(`erp-${erp.key}`);
      });

      const computeColumnWidthPx = (columnKey: string): number => {
        if (columnKey === "checkbox") return 50;

        const minWidth = columnKey === "id" ? 80 : 100;
        const maxWidth = 600;

        // Tailwind p-2 => 8px 左右 padding，另外 header 有 sort icon / resize handle
        const headerExtra = 56;
        const cellExtra = 24;

        if (columnKey === "id") {
          const headerW = measureTextPx("#", font) + headerExtra;
          let contentW = 0;
          products.forEach((p) => {
            contentW = Math.max(
              contentW,
              measureTextPx(String(p.itemId), font) + cellExtra
            );
          });
          return clampWidth(Math.max(headerW, contentW), minWidth, maxWidth);
        }

        if (columnKey.startsWith("attr-")) {
          const fieldId = Number(columnKey.split("-")[1]);
          const attributeDef = attributes.find((a) => a.fieldId === fieldId);
          const headerName = attributeDef?.fieldName || "";
          const headerW = measureTextPx(headerName, font) + headerExtra;

          let contentW = 0;

          if (attributeDef) {
            // Special handling for non-text data types
            if (attributeDef.dataType === "picture") {
              contentW = 120;
            } else if (attributeDef.dataType === "image") {
              contentW = 110;
            } else if (attributeDef.dataType === "boolean") {
              contentW = 80;
            } else {
              // Measure actual text content width for all text-based columns
              products.forEach((p) => {
                const attr = p.attributes.find((a) => a.fieldId === fieldId);
                if (attr && attr.value != null) {
                  const textValue = String(attr.value);
                  contentW = Math.max(
                    contentW,
                    measureTextPx(textValue, font) + cellExtra
                  );
                }
              });
              // Use minimum of 150px for text columns even if content is shorter
              contentW = Math.max(contentW, 150);
            }
          }

          return clampWidth(Math.max(headerW, contentW), minWidth, maxWidth);
        }

        if (columnKey.startsWith("erp-")) {
          const erpKey = columnKey.split("-").slice(1).join("-");
          const headerW = measureTextPx(erpKey, font) + headerExtra;

          // Measure actual ERP content width
          let contentW = 0;
          products.forEach((p) => {
            const erpData = p.erp.find((e) => e.key === erpKey);
            if (erpData && erpData.value != null) {
              const textValue = String(erpData.value);
              contentW = Math.max(
                contentW,
                measureTextPx(textValue, font) + cellExtra
              );
            }
          });
          // Use minimum of 150px for ERP columns
          contentW = Math.max(contentW, 150);

          return clampWidth(Math.max(headerW, contentW), 100, maxWidth);
        }

        return 120;
      };

      setColumnWidths((prev) => {
        const next = { ...prev };
        // 從 localStorage 讀取已保存的寬度（用戶手動調整過的）
        const seriesId = getCurrentSeriesId();
        const savedWidths = loadSavedWidths(seriesId);

        allColumnKeys.forEach((key) => {
          // 1. 如果 localStorage 中有保存的寬度，優先使用（用戶手動調整過）
          if (savedWidths[key] !== undefined) {
            next[key] = savedWidths[key];
            userResizedColumnsRef.current.add(key);
            return;
          }
          // 2. 如果當前 state 已經有這個欄位的寬度，保留它
          if (prev[key] !== undefined) {
            return;
          }
          // 3. 否則自動計算寬度
          next[key] = computeColumnWidthPx(key);
        });
        return next;
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [products, showCheckbox]);

  // 從產品數據中取得屬性
  const currentPageIds = products.map((p) => p.itemId);
  const isAllSelected = currentPageIds.every((id) => selectedIds.has(id));

  const attributes = get(
    products,
    "[0].attributes",
    [] as ProductData["attributes"]
  );
  const erpAttributes = get(products, "[0].erp", [] as ProductData["erp"]);

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  // 處理排序邏輯
  const handleSortLogic = (fieldId: number) => {
    const isSorted = sortState.fieldId === fieldId;
    const needResetSort = isSorted && sortState.order === "desc";
    const sortFieldId = needResetSort ? -1 : fieldId;
    const sort = isSorted === false ? "asc" : needResetSort ? "asc" : "desc";
    const sortIcon = isSorted ? (
      sort === "asc" ? (
        <FaSortUp />
      ) : (
        <FaSortDown />
      )
    ) : (
      <FaSort color="#808080" />
    );

    return {
      fieldId: sortFieldId,
      order: sort,
      icon: sortIcon,
    };
  };

  // 取得顯示值的函數
  const getDisplayValue = (
    dataType: string,
    value: string | number | boolean | null | undefined
  ) => {
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
        } else {
          return <span></span>;
        }
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
      case "number":
        return typeof value === "number"
          ? value.toString()
          : String(value || "");
      default:
        return String(value || "");
    }
  };

  // 計算固定欄位的左側位置（包含邊框寬度）
  const calculateStickyLeft = (columnIndex: number): number => {
    let left = 0;

    if (showCheckbox && columnIndex > 0) {
      left += columnWidths["checkbox"] || 50;
      left += 1; // 邊框寬度
    }

    if (columnIndex > (showCheckbox ? 1 : 0)) {
      left += columnWidths["id"] || 80;
      left += 1; // 邊框寬度
    }

    // 計算前面固定屬性欄位的寬度（包含邊框）
    const attributes = get(products, "[0].attributes", []);
    const startIndex = showCheckbox ? 2 : 1;
    for (let i = startIndex; i < columnIndex; i++) {
      if (i - startIndex < attributes.length) {
        const attr = attributes[i - startIndex];
        left += columnWidths[`attr-${attr.fieldId}`] || 120;
        left += 1; // 邊框寬度
      }
    }

    return left;
  };

  // 取得欄位寬度
  const getColumnWidth = (key: string): number => {
    return columnWidths[key] || 120;
  };

  // 動態生成 grid-template-columns
  const generateGridColumns = () => {
    const cols: string[] = [];

    if (showCheckbox) {
      cols.push(`${getColumnWidth("checkbox")}px`);
    }
    cols.push(`${getColumnWidth("id")}px`);

    // 屬性欄位
    const attributes = get(products, "[0].attributes", []);
    attributes.forEach((attr) => {
      cols.push(`${getColumnWidth(`attr-${attr.fieldId}`)}px`);
    });

    // ERP 欄位
    const erpAttributes = get(products, "[0].erp", []);
    erpAttributes.forEach((erp) => {
      cols.push(`${getColumnWidth(`erp-${erp.key}`)}px`);
    });

    return cols.join(" ");
  };

  // 處理排序點擊，避免在調整寬度時誤觸發
  const handleSortClick = (
    e: React.MouseEvent,
    fieldId: number,
    order: "asc" | "desc"
  ) => {
    // 如果正在調整大小，不執行排序
    if (isResizing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 檢查點擊是否來自 ResizeHandle 區域
    const target = e.target as HTMLElement;
    if (target.closest("[data-resize-handle]")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    setSortState({ fieldId, order });
  };
  // 處理欄位寬度調整
  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡到排序點擊事件
    setIsResizing(columnKey);
    userResizedColumnsRef.current.add(columnKey);

    const startX = e.clientX;
    const startWidth = getColumnWidth(columnKey);
    let currentWidth = startWidth; // 追蹤當前寬度

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      currentWidth = newWidth; // 更新追蹤的寬度
      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // 直接用追蹤的寬度值保存到 localStorage，避免 state 異步問題
      const seriesId = getCurrentSeriesId();
      saveWidthToStorage(seriesId, columnKey, currentWidth);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 自動調整單一欄位寬度以適應內容
  const autoResizeColumn = (columnKey: string) => {
    if (products.length === 0) return;

    const font = getGridFont();
    const attributes = get(
      products,
      "[0].attributes",
      [] as ProductData["attributes"]
    );

    const headerExtra = 56;
    const cellExtra = 24;
    const maxWidth = 600;

    const computeOne = (): number => {
      if (columnKey === "checkbox") return 50;

      if (columnKey === "id") {
        const headerW = measureTextPx("#", font) + headerExtra;
        let contentW = 0;
        products.forEach((p) => {
          contentW = Math.max(
            contentW,
            measureTextPx(String(p.itemId), font) + cellExtra
          );
        });
        return clampWidth(Math.max(headerW, contentW), 80, maxWidth);
      }

      if (columnKey.startsWith("attr-")) {
        const fieldId = Number(columnKey.split("-")[1]);
        const attributeDef = attributes.find((a) => a.fieldId === fieldId);
        const headerName = attributeDef?.fieldName || "";
        const headerW = measureTextPx(headerName, font) + headerExtra;

        let contentW = 0;

        if (attributeDef) {
          // Special handling for non-text data types
          if (attributeDef.dataType === "picture") {
            contentW = 120;
          } else if (attributeDef.dataType === "image") {
            contentW = 110;
          } else if (attributeDef.dataType === "boolean") {
            contentW = 80;
          } else {
            // Measure actual content width for this attribute column
            let measuredW = 150; // minimum width
            for (const product of products) {
              const attr = product.attributes.find(
                (a) => a.fieldId === fieldId
              );
              if (attr && attr.value != null) {
                const text = String(attr.value);
                const measured = measureTextPx(text, font) + cellExtra;
                if (measured > measuredW) measuredW = measured;
              }
            }
            contentW = measuredW;
          }
        }

        return clampWidth(Math.max(headerW, contentW), 100, maxWidth);
      }

      if (columnKey.startsWith("erp-")) {
        const erpKey = columnKey.split("-").slice(1).join("-");
        const headerW = measureTextPx(erpKey, font) + headerExtra;

        // Measure actual content width for ERP
        let contentW = 150; // minimum width
        for (const product of products) {
          const erpEntry = product.erp?.find((e) => e.key === erpKey);
          if (erpEntry && erpEntry.value != null) {
            const measured = measureTextPx(erpEntry.value, font) + cellExtra;
            if (measured > contentW) contentW = measured;
          }
        }

        return clampWidth(Math.max(headerW, contentW), 100, maxWidth);
      }

      return 120;
    };

    setColumnWidths((prev) => ({ ...prev, [columnKey]: computeOne() }));
  };

  // 處理雙擊自動調整寬度
  const handleDoubleClick = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    autoResizeColumn(columnKey);
  };

  return (
    <div className="relative">
      <div
        className="border border-black"
        style={{
          maxHeight,
          position: "relative",
        }}
      >
        {/* Grid Container - 滾動容器移到這裡 */}
        <div
          ref={gridRef}
          className="grid bg-white relative overflow-auto"
          style={{
            gridTemplateColumns: generateGridColumns(),
            minWidth: "1000px",
            position: "relative",
            maxHeight: "inherit",
          }}
        >
          {/* Header Row */}
          {showCheckbox && (
            <div
              className="sticky-cell sticky top-0 bg-gray-100 border-b border-black p-2 flex items-center justify-center font-semibold text-gray-900 z-50 relative"
              style={{
                left: "0px",
                position: "sticky",
                boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
                width: `${getColumnWidth("checkbox")}px`,
                borderRight: "1px solid black",
              }}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleHeaderCheckbox}
                className="rounded"
              />
              <ResizeHandle
                onMouseDown={(e: React.MouseEvent) =>
                  handleMouseDown(e, "checkbox")
                }
                onDoubleClick={(e: React.MouseEvent) =>
                  handleDoubleClick(e, "checkbox")
                }
                isResizing={isResizing === "checkbox"}
              />
            </div>
          )}

          <div
            className="sticky-cell sticky top-0 bg-gray-100 border-b border-black p-2 flex items-center font-semibold text-gray-900 z-50 relative"
            style={{
              left: showCheckbox
                ? `${getColumnWidth("checkbox") + 1}px`
                : "0px",
              position: "sticky",
              boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
              width: `${getColumnWidth("id")}px`,
              borderRight: "1px solid black",
            }}
          >
            #
            <ResizeHandle
              onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, "id")}
              onDoubleClick={(e: React.MouseEvent) =>
                handleDoubleClick(e, "id")
              }
              isResizing={isResizing === "id"}
            />
          </div>

          {/* 固定欄位標題 - 前5個屬性 */}
          {attributes.slice(0, 5).map((attribute, index) => {
            const { fieldId, order, icon } = handleSortLogic(attribute.fieldId);
            const leftPosition = calculateStickyLeft(
              showCheckbox ? index + 2 : index + 1
            );
            const columnKey = `attr-${attribute.fieldId}`;

            return (
              <div
                key={`header-${attribute.fieldId}`}
                className="sticky-cell sticky top-0 bg-gray-100 border-b border-black p-2 flex items-center font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 z-50 relative"
                style={{
                  left: `${leftPosition}px`,
                  position: "sticky",
                  boxShadow: index === 4 ? "2px 0 4px rgba(0,0,0,0.1)" : "none",
                  width: `${getColumnWidth(columnKey)}px`,
                  borderRight: "1px solid black",
                }}
                onClick={(e) =>
                  handleSortClick(e, fieldId, order as "asc" | "desc")
                }
              >
                <span className="truncate">{attribute.fieldName}</span>
                {icon}
                <ResizeHandle
                  onMouseDown={(e: React.MouseEvent) =>
                    handleMouseDown(e, columnKey)
                  }
                  onDoubleClick={(e: React.MouseEvent) =>
                    handleDoubleClick(e, columnKey)
                  }
                  isResizing={isResizing === columnKey}
                />
              </div>
            );
          })}

          {/* 可滾動欄位標題 */}
          {attributes.slice(5).map((attribute) => {
            const { fieldId, order, icon } = handleSortLogic(attribute.fieldId);
            const columnKey = `attr-${attribute.fieldId}`;

            return (
              <div
                key={`header-scroll-${attribute.fieldId}`}
                className="sticky top-0 bg-gray-100 border-r border-b border-black p-2 flex items-center font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 z-20 relative"
                style={{
                  width: `${getColumnWidth(columnKey)}px`,
                }}
                onClick={(e) =>
                  handleSortClick(e, fieldId, order as "asc" | "desc")
                }
              >
                <span className="truncate">{attribute.fieldName}</span>
                {icon}
                <ResizeHandle
                  onMouseDown={(e: React.MouseEvent) =>
                    handleMouseDown(e, columnKey)
                  }
                  onDoubleClick={(e: React.MouseEvent) =>
                    handleDoubleClick(e, columnKey)
                  }
                  isResizing={isResizing === columnKey}
                />
              </div>
            );
          })}

          {/* ERP 欄位標題 */}
          {erpAttributes.map((erpAttr) => {
            const columnKey = `erp-${erpAttr.key}`;

            return (
              <div
                key={`erp-header-${erpAttr.key}`}
                className="sticky top-0 bg-gray-100 border-r border-b border-black p-2 flex items-center font-semibold text-gray-900 z-20 relative"
                style={{
                  width: `${getColumnWidth(columnKey)}px`,
                }}
              >
                <span className="truncate">{erpAttr.key}</span>
                <ResizeHandle
                  onMouseDown={(e: React.MouseEvent) =>
                    handleMouseDown(e, columnKey)
                  }
                  onDoubleClick={(e: React.MouseEvent) =>
                    handleDoubleClick(e, columnKey)
                  }
                  isResizing={isResizing === columnKey}
                />
              </div>
            );
          })}

          {/* Data Rows */}
          {products.map((product) => {
            // 計算行的樣式類別
            const rowStyle = product.isDeleted
              ? { backgroundColor: "#9ca3af" } // gray-400
              : product.hasArchive
                ? { backgroundColor: "#fee2e2" } // red-100
                : { backgroundColor: "#ffffff" };

            return (
              <React.Fragment key={product.itemId}>
                {/* Checkbox Cell */}
                {showCheckbox && (
                  <div
                    key={`checkbox-${product.itemId}`}
                    className={`sticky-cell sticky border-b border-black p-2 flex items-center justify-center hover:bg-gray-50 z-40`}
                    style={{
                      left: "0px",
                      position: "sticky",
                      boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                      width: `${getColumnWidth("checkbox")}px`,
                      borderRight: "1px solid black",
                      ...rowStyle,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.itemId)}
                      onChange={() => toggleCheckbox(product.itemId)}
                      className="rounded"
                    />
                  </div>
                )}

                {/* ID Cell */}
                <div
                  key={`id-${product.itemId}`}
                  className={`sticky-cell sticky border-b border-black p-2 flex items-center hover:bg-blue-50 z-40 cursor-pointer`}
                  style={{
                    left: showCheckbox
                      ? `${getColumnWidth("checkbox") + 1}px`
                      : "0px",
                    position: "sticky",
                    boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                    width: `${getColumnWidth("id")}px`,
                    borderRight: "1px solid black",
                    ...rowStyle,
                  }}
                  onDoubleClick={() =>
                    navigate(`/products/${product.itemId}/edit`)
                  }
                >
                  <span className="text-blue-600 font-medium truncate">
                    {product.itemId}
                  </span>
                </div>

                {/* 固定欄位數據 - 前5個屬性 */}
                {product.attributes.slice(0, 5).map((attribute, index) => {
                  const leftPosition = calculateStickyLeft(
                    showCheckbox ? index + 2 : index + 1
                  );
                  const columnKey = `attr-${attribute.fieldId}`;

                  return (
                    <div
                      key={`${product.itemId}-fixed-${index}`}
                      className={`sticky-cell sticky border-b border-black p-2 flex items-center hover:bg-blue-50 text-black z-40 cursor-pointer`}
                      style={{
                        left: `${leftPosition}px`,
                        position: "sticky",
                        boxShadow:
                          index === 4 ? "2px 0 4px rgba(0,0,0,0.05)" : "none",
                        width: `${getColumnWidth(columnKey)}px`,
                        borderRight: "1px solid black",
                        ...rowStyle,
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="w-full truncate"
                        style={{ minWidth: "0" }}
                        title={String(attribute.value ?? "")}
                      >
                        {getDisplayValue(attribute.dataType, attribute.value)}
                      </div>
                    </div>
                  );
                })}

                {/* 可滾動欄位數據 */}
                {product.attributes.slice(5).map((attribute, index) => {
                  const columnKey = `attr-${attribute.fieldId}`;

                  return (
                    <div
                      key={`${product.itemId}-scroll-${index}`}
                      className={`border-r border-b border-black p-2 flex items-center hover:bg-blue-50 text-black cursor-pointer`}
                      style={{
                        width: `${getColumnWidth(columnKey)}px`,
                        ...rowStyle,
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="w-full truncate"
                        style={{ minWidth: "0" }}
                        title={String(attribute.value ?? "")}
                      >
                        {getDisplayValue(attribute.dataType, attribute.value)}
                      </div>
                    </div>
                  );
                })}

                {/* ERP 數據 */}
                {product.erp.map((erpData, erpIndex) => {
                  const columnKey = `erp-${erpData.key}`;
                  const erpStyle =
                    product.isDeleted || product.hasArchive
                      ? rowStyle
                      : { backgroundColor: "#eff6ff" }; // blue-50

                  return (
                    <div
                      key={`${product.itemId}-erp-${erpIndex}`}
                      className={`border-r border-b border-black p-2 flex items-center hover:bg-blue-100 text-black cursor-pointer`}
                      style={{
                        width: `${getColumnWidth(columnKey)}px`,
                        ...erpStyle,
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="w-full truncate"
                        style={{ minWidth: "0" }}
                        title={String(erpData.value ?? "")}
                      >
                        {erpData.value}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ProductImage 組件
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

// AuthorizedImage 組件，支援授權圖片
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

  const [{ loading }, fetchImage] = useAxios<Blob>(
    {
      method: "GET",
      responseType: "blob",
    },
    { manual: true }
  );

  useEffect(() => {
    // 從 src 中提取 image ID，假設格式是 /image/123
    const imageId = src.split("/image/")[1];

    if (imageId) {
      fetchImage({
        url: `/image/${imageId}`,
      })
        .then((response) => {
          const blobUrl = URL.createObjectURL(response.data);
          setImageSrc(blobUrl);
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });
    }

    // 清理 blob URL
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
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

// ResizeHandle 組件
const ResizeHandle = ({
  onMouseDown,
  onDoubleClick,
  isResizing,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  isResizing: boolean;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止點擊事件冒泡
  };

  const handleDoubleClickEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止雙擊事件冒泡
    onDoubleClick(e);
  };

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 ${
        isResizing ? "bg-blue-500" : "bg-transparent"
      } transition-colors`}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClickEvent}
      data-resize-handle="true"
      style={{ zIndex: 50 }}
      title="拖拽調整寬度，雙擊自動適應內容"
    />
  );
};

export default ProductTable;
