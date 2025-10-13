import { Image, Alert } from "react-bootstrap";
import { ProductData } from "./Interface";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import useAxios from "axios-hooks";

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
  const navigate = useNavigate();

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

      setColumnWidths((prev) => ({ ...initialWidths, ...prev }));
    }
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

    const startX = e.clientX;
    const startWidth = getColumnWidth(columnKey);

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 自動調整欄位寬度以適應內容
  const autoResizeColumn = (columnKey: string) => {
    console.log("開始自動調整:", columnKey); // Debug 日誌

    // 確保有產品數據
    if (products.length === 0) {
      console.log("沒有產品數據");
      return;
    }

    let maxWidth = 120; // 預設寬度

    if (columnKey === "checkbox") {
      maxWidth = 50;
    } else if (columnKey === "id") {
      // ID 欄位：基於數字長度估算
      const maxId = Math.max(...products.map((p) => p.itemId));
      const idLength = maxId.toString().length;
      maxWidth = Math.max(80, idLength * 12 + 40);
    } else if (columnKey.startsWith("attr-")) {
      // 屬性欄位：遍歷所有產品找出同樣 fieldId 的所有值
      const fieldIdStr = columnKey.split("-")[1];
      const fieldId = parseInt(fieldIdStr); // 轉換為數字以匹配接口定義
      console.log("處理屬性欄位:", fieldIdStr, "轉換為數字:", fieldId);

      // 收集所有產品中該 fieldId 的屬性資訊
      let fieldName = "";
      const allValues: {
        productIndex: number;
        value: string | number | boolean;
        dataType: string;
      }[] = [];

      // 遍歷所有產品，找出所有具有相同 fieldId 的屬性
      products.forEach((product, productIndex) => {
        const attr = product.attributes.find((a) => a.fieldId == fieldId);
        if (attr) {
          // 記錄欄位名稱（第一次遇到時）
          if (!fieldName) {
            fieldName = attr.fieldName;
          }

          // 收集所有非空值
          if (attr.value !== null && attr.value !== undefined) {
            allValues.push({
              productIndex,
              value: attr.value,
              dataType: attr.dataType,
            });
          }
        }
      });

      console.log(`找到 ${allValues.length} 個非空值`, allValues);

      if (fieldName) {
        // 標題寬度估算
        let headerWidth = fieldName.length * 8 + 60;
        console.log("標題寬度估算:", headerWidth);

        // 計算所有值的最大寬度
        let maxContentWidth = 0;
        console.log("開始計算所有值的寬度...");

        allValues.forEach(
          ({ productIndex, value, dataType: valueDataType }) => {
            let contentText = "";

            // 根據資料類型處理，轉換為實際顯示的文字
            switch (valueDataType) {
              case "boolean":
                contentText = value ? "True" : "False";
                break;
              case "picture":
              case "image":
                contentText = "No Image"; // 圖片顯示的預設文字
                break;
              case "number":
                contentText = value.toString();
                break;
              default:
                contentText = String(value);
            }

            const contentLength = contentText.length * 9; // 每字符8像素
            maxContentWidth = Math.max(maxContentWidth, contentLength);

            console.log(
              `產品 ${productIndex + 1}, 內容: "${contentText}", 長度: ${contentLength}px`
            );
          }
        );

        console.log("內容最大寬度估算:", maxContentWidth);
        maxWidth = Math.max(headerWidth, maxContentWidth + 32); // 加上 padding
      } else {
        console.log("找不到該 fieldId 的任何屬性，使用預設寬度");
        maxWidth = 150;
      }
    } else if (columnKey.startsWith("erp-")) {
      // ERP 欄位：遍歷所有產品找出同樣 key 的所有值
      const erpKey = columnKey.split("-")[1];
      console.log("處理ERP欄位:", erpKey);

      // 收集所有產品中該 key 的 ERP 值
      const allErpValues: { productIndex: number; value: string }[] = [];

      products.forEach((product, productIndex) => {
        const erpData = product.erp.find((e) => e.key === erpKey);
        if (erpData && erpData.value !== null && erpData.value !== undefined) {
          allErpValues.push({
            productIndex,
            value: erpData.value,
          });
        }
      });

      console.log(`找到 ${allErpValues.length} 個非空ERP值`, allErpValues);

      if (allErpValues.length > 0) {
        let headerWidth = erpKey.length * 8 + 32;
        let maxContentWidth = 0;

        console.log("開始計算所有ERP值的寬度...");
        allErpValues.forEach(({ productIndex, value }) => {
          const contentText = String(value);
          const contentLength = contentText.length * 8; // 每字符8像素
          maxContentWidth = Math.max(maxContentWidth, contentLength);

          console.log(
            `產品 ${productIndex + 1}, ERP內容: "${contentText}", 長度: ${contentLength}px`
          );
        });

        maxWidth = Math.max(headerWidth, maxContentWidth + 32);
      } else {
        console.log("找不到該 ERP key 的任何值，使用預設寬度");
        maxWidth = 150;
      }
    }

    // 限制寬度範圍
    maxWidth = Math.min(maxWidth, 400);
    maxWidth = Math.max(maxWidth, 100);

    console.log(`設置 ${columnKey} 寬度為:`, maxWidth); // Debug 日誌

    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: maxWidth,
    }));
  };

  // 處理雙擊自動調整寬度
  const handleDoubleClick = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("雙擊調整寬度:", columnKey); // Debug 日誌
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
            const rowBgClass = product.hasArchive ? "bg-red-100" : "bg-white";

            return (
              <React.Fragment key={product.itemId}>
                {/* Checkbox Cell */}
                {showCheckbox && (
                  <div
                    key={`checkbox-${product.itemId}`}
                    className={`sticky-cell sticky border-b border-black p-2 flex items-center justify-center hover:bg-gray-50 z-40 ${rowBgClass}`}
                    style={{
                      left: "0px",
                      position: "sticky",
                      boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                      width: `${getColumnWidth("checkbox")}px`,
                      borderRight: "1px solid black",
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
                  className={`sticky-cell sticky border-b border-black p-2 flex items-center hover:bg-blue-50 z-40 cursor-pointer ${rowBgClass}`}
                  style={{
                    left: showCheckbox
                      ? `${getColumnWidth("checkbox") + 1}px`
                      : "0px",
                    position: "sticky",
                    boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                    width: `${getColumnWidth("id")}px`,
                    borderRight: "1px solid black",
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
                      className={`sticky-cell sticky border-b border-black p-2 flex items-center hover:bg-blue-50 text-black z-40 cursor-pointer ${rowBgClass}`}
                      style={{
                        left: `${leftPosition}px`,
                        position: "sticky",
                        boxShadow:
                          index === 4 ? "2px 0 4px rgba(0,0,0,0.05)" : "none",
                        width: `${getColumnWidth(columnKey)}px`,
                        borderRight: "1px solid black",
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="truncate w-full"
                        style={{ minWidth: "0" }}
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
                      className={`border-r border-b border-black p-2 flex items-center hover:bg-blue-50 text-black cursor-pointer ${rowBgClass}`}
                      style={{
                        width: `${getColumnWidth(columnKey)}px`,
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="truncate w-full"
                        style={{ minWidth: "0" }}
                      >
                        {getDisplayValue(attribute.dataType, attribute.value)}
                      </div>
                    </div>
                  );
                })}

                {/* ERP 數據 */}
                {product.erp.map((erpData, erpIndex) => {
                  const columnKey = `erp-${erpData.key}`;

                  return (
                    <div
                      key={`${product.itemId}-erp-${erpIndex}`}
                      className="bg-blue-50 border-r border-b border-black p-2 flex items-center hover:bg-blue-100 text-black cursor-pointer"
                      style={{
                        width: `${getColumnWidth(columnKey)}px`,
                      }}
                      onDoubleClick={() =>
                        navigate(`/products/${product.itemId}/edit`)
                      }
                    >
                      <div
                        className="truncate w-full"
                        style={{ minWidth: "0" }}
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
    setImageSrc(src);
    setHasError(false);
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
    console.log("ResizeHandle 雙擊事件觸發"); // Debug 日誌
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
