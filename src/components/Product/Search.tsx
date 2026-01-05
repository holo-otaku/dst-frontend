import { useEffect, useState, useContext } from "react";
import { Stack, Form, Row, Col, Button } from "react-bootstrap";
import useAxios, { RefetchFunction } from "axios-hooks";
import { SeriesResponse, SeriesFieldDataType } from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { Pagination } from "../Pagination";
import { get } from "lodash";
import {
  ProductSearchFilters,
  ProductSearchPayloadField,
  ProductSearchPayloadOperation,
  ProductSearchResponse,
  ProductData,
  ArchiveProductResponse,
  ArchiveProductPayloadField,
} from "./Interface";
import ProductTable from "./ProductTable";
import { SearchBar } from "./SearchBar";
import { useFavoriteFilterField, usePaginate } from "../../hooks";
import { useLocation } from "react-router-dom";
import useDeleteProduct from "../../hooks/useDeleteProduct";
import useCopyProduct from "../../hooks/useCopyProduct";
import { AuthContext } from "../../context";

const pageSizes = [25, 50, 100];

export const Search = () => {
  const { getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();

  const [{ data: seriesResponse, loading: seriesLoading }, fetchSeries] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
        limit: 100,
      },
    });

  const [
    { data: productSearchResponse, loading: productSearchLoading },
    searchProduct,
  ] = useAxios<ProductSearchResponse, ProductSearchPayloadField>(
    {
      url: "/product/search",
      method: "POST",
    },
    {
      manual: true,
    }
  );

  const [{ loading: archiveProductLoading }, archiveProduct] = useAxios<
    ArchiveProductResponse,
    ArchiveProductPayloadField
  >(
    {
      url: "/archive",
      method: "POST",
    },
    {
      manual: true,
    }
  );

  const [pageLimit, setPageLimit] = useState<number>(25);
  const [PaginateState, PaginateAction] = usePaginate({
    total: get(productSearchResponse, "totalCount", 0),
    limit: pageLimit,
  });
  const [sortState, setSortState] = useState<{
    fieldId: number;
    order: "asc" | "desc";
  }>({
    fieldId: -1,
    order: "asc",
  });
  const [selectedSeries, setSelectedSeries] = useState<number>(1);
  const [searchFields, setSearchFields] = useState<ProductSearchFilters[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<
    "deleted" | "archived" | "both" | undefined
  >(undefined);

  const { currentPage, availablePages, limit } = PaginateState;

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    if (productSearchResponse) {
      PaginateAction.changeTotal(productSearchResponse.totalCount);
    }
  }, [productSearchResponse]);

  useEffect(() => {
    setShowCheckbox(false);
    setSelectedIds(new Set());
  }, [selectedSeries]);

  const buildSearchPayload = (fields: SeriesResponse["data"][0]["fields"]) => {
    const filters = searchFields.filter((field) => field.value);
    const normalFilters = filters.filter(
      (filter) => filter.operation !== ProductSearchPayloadOperation.RANGE
    );
    const rangeFilters = filters.filter(
      (filter) => filter.operation === ProductSearchPayloadOperation.RANGE
    );

    const rangeSearchFilter: ProductSearchFilters[] = [];
    rangeFilters.forEach((filter) => {
      const [min, max] = filter.value.toString().split(",");
      rangeSearchFilter.push({
        fieldId: filter.fieldId,
        value: parseFloat(min),
        operation: ProductSearchPayloadOperation.GREATER,
      });
      rangeSearchFilter.push({
        fieldId: filter.fieldId,
        value: parseFloat(max),
        operation: ProductSearchPayloadOperation.LESS,
      });
    });

    const finalFilters = [...normalFilters, ...rangeSearchFilter].map(
      (data) => {
        // 找到對應的欄位資訊
        const field = fields?.find((f) => f.id === data.fieldId);
        const isDateField = field?.dataType === SeriesFieldDataType.date;

        if (
          isDateField &&
          typeof data.value === "string" &&
          data.value.includes("-")
        ) {
          // 日期欄位：將 YYYY-MM-DD 格式轉換為 MM/DD/YY 格式
          const [year, month, day] = data.value.split("-");
          const shortYear = year.slice(-2);
          const formattedDate = `${month}/${day}/${shortYear}`;
          return { ...data, value: formattedDate };
        } else if (data.operation && !isDateField) {
          // 只有非日期欄位才使用 parseFloat
          return { ...data, value: parseFloat(data.value as string) };
        }
        return data;
      }
    );

    const params = {
      page: currentPage,
      limit,
      ...(sortState.fieldId !== -1 && {
        sort: `${sortState.fieldId},${sortState.order}`,
      }),
    };

    return { filters, finalFilters, params };
  };

  const reloadProducts = () => {
    // 重新載入將由 Bar 組件處理
    window.location.reload();
  };

  const toggleCheckbox = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleHeaderCheckbox = () => {
    const currentPageIds = get(productSearchResponse, "data", []).map(
      (p: ProductData) => p.itemId
    );
    const newSet = new Set(selectedIds);
    const isAllSelected = currentPageIds.every((id: number) =>
      selectedIds.has(id)
    );
    if (isAllSelected) {
      currentPageIds.forEach((id: number) => newSet.delete(id));
    } else {
      currentPageIds.forEach((id: number) => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const handleBatchSelect = () => {
    setShowCheckbox(true);
    setSelectedIds(new Set());
  };

  const handleCancel = () => {
    setShowCheckbox(false);
    setSelectedIds(new Set());
  };

  const { loading: deleteProductLoding, deleteProduct: deleteProduct } =
    useDeleteProduct();

  const handleBatchDelete = async (itemIds: number[]) => {
    try {
      await deleteProduct({
        data: { itemId: itemIds },
      });
      reloadProducts();
      setShowCheckbox(false);
      setSelectedIds(new Set());
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const { loading: copyProductLoading, copyProduct: copyProduct } =
    useCopyProduct();

  const handleBatchCopy = async (itemIds: number[]) => {
    try {
      await copyProduct({
        data: { itemIds: itemIds },
      });
      reloadProducts();
      setShowCheckbox(false);
      setSelectedIds(new Set());
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleBatchArchive = async (itemIds: number[]) => {
    try {
      await archiveProduct({
        data: { itemIds: itemIds },
      });
      reloadProducts();
      setShowCheckbox(false);
      setSelectedIds(new Set());
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const pageLoading =
    seriesLoading ||
    productSearchLoading ||
    archiveProductLoading ||
    copyProductLoading ||
    deleteProductLoding;

  // 權限檢查
  const canCreate = permissions.includes("product.create");
  const canDelete = permissions.includes("product.delete");
  const canArchive = permissions.includes("archive.create");
  const canBatchSelect = canCreate || canDelete || canArchive;

  return (
    <Stack gap={2}>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Bar
        series={get(seriesResponse, "data", [])}
        {...{
          searchProduct,
          page: currentPage,
          limit,
          first: PaginateAction.first,
          setLimit: setPageLimit,
          setPage: PaginateAction.setCurrentPage,
          sortState,
          setSortState,
          selectedSeries,
          setSelectedSeries,
          searchFields,
          setSearchFields,
          buildSearchPayload,
          status,
          setStatus,
        }}
      />
      <hr />
      <Stack
        direction="horizontal"
        style={{
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {!showCheckbox ? (
            canBatchSelect && (
              <Button variant="primary" onClick={handleBatchSelect}>
                批次選擇
              </Button>
            )
          ) : (
            <>
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (selectedIds.size === 0) return alert("請先選擇項目");
                    if (
                      !window.confirm(
                        `確定要複製 ${selectedIds.size} 筆資料嗎？`
                      )
                    )
                      return;
                    const success = await handleBatchCopy(
                      Array.from(selectedIds)
                    );
                    if (success) alert(`已複製 ${selectedIds.size} 筆資料`);
                    else alert("複製失敗！");
                  }}
                >
                  複製 ({selectedIds.size})
                </Button>
              )}
              {canArchive && (
                <Button
                  variant="warning"
                  onClick={async () => {
                    if (selectedIds.size === 0) return alert("請先選擇項目");
                    if (
                      !window.confirm(
                        `確定要封存 ${selectedIds.size} 筆資料嗎？`
                      )
                    )
                      return;
                    const success = await handleBatchArchive(
                      Array.from(selectedIds)
                    );
                    if (success) alert(`已封存 ${selectedIds.size} 筆資料`);
                    else alert("封存失敗！");
                  }}
                >
                  封存 ({selectedIds.size})
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (selectedIds.size === 0) return alert("請先選擇項目");
                    if (
                      !window.confirm(
                        `確定要刪除 ${selectedIds.size} 筆資料嗎？`
                      )
                    )
                      return;
                    const success = await handleBatchDelete(
                      Array.from(selectedIds)
                    );
                    if (success) alert("刪除成功！");
                    else alert("刪除失敗！");
                  }}
                >
                  刪除 ({selectedIds.size})
                </Button>
              )}
              <Button variant="secondary" onClick={handleCancel}>
                取消
              </Button>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Form.Select
            size="sm"
            onChange={(e) =>
              setPageLimit(parseInt(e.target.value || `${pageSizes[0]}`))
            }
          >
            <option>每頁數量</option>
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Form.Select>
        </div>
      </Stack>
      <ProductTable
        products={get(productSearchResponse, "data", [])}
        sortState={sortState}
        setSortState={setSortState}
        showCheckbox={showCheckbox}
        selectedIds={selectedIds}
        toggleCheckbox={toggleCheckbox}
        handleHeaderCheckbox={handleHeaderCheckbox}
      />
      <Stack direction="horizontal" className="justify-content-center">
        <Pagination
          {...{
            currentPage,
            availablePages,
            ...PaginateAction,
          }}
        />
      </Stack>
    </Stack>
  );
};

interface BarProps {
  series: SeriesResponse["data"];
  searchProduct: RefetchFunction<
    ProductSearchPayloadField,
    ProductSearchResponse
  >;
  first: () => void;
  page: number;
  limit: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  sortState: { fieldId: number; order: "asc" | "desc" };
  setSortState: (sortState: { fieldId: number; order: "asc" | "desc" }) => void;
  selectedSeries: number;
  setSelectedSeries: (seriesId: number) => void;
  searchFields: ProductSearchFilters[];
  setSearchFields: (fields: ProductSearchFilters[]) => void;
  buildSearchPayload: (fields: SeriesResponse["data"][0]["fields"]) => {
    filters: ProductSearchFilters[];
    finalFilters: ProductSearchFilters[];
    params: {
      page: number;
      limit: number;
      sort?: string;
    };
  };
  status?: "deleted" | "archived" | "both";
  setStatus: (status?: "deleted" | "archived" | "both") => void;
}

const Bar = ({
  series,
  searchProduct,
  page,
  limit,
  first,
  setLimit,
  setPage,
  sortState,
  setSortState,
  selectedSeries,
  setSelectedSeries,
  searchFields,
  setSearchFields,
  buildSearchPayload,
  status,
  setStatus,
}: BarProps) => {
  const [forceRefresh, setForceRefresh] = useState<number>(1);
  const { seriesFavoriteRecord, updateFavoritesWithIds } =
    useFavoriteFilterField(selectedSeries, get(series, "[0].fields", []));
  const targetSeries = series.find((series) => series.id === selectedSeries);
  const fields = get(targetSeries, "fields", []);
  const { snapshot, restore } = useHistorySearch();
  const location = useLocation();

  const [, exportProduct] = useAxios<Blob, ProductSearchPayloadField>(
    {
      url: "/product/export",
      method: "POST",
      responseType: "blob",
    },
    {
      manual: true,
    }
  );

  const handleExport = async () => {
    const { finalFilters } = buildSearchPayload(fields);
    try {
      const response = await exportProduct({
        data: {
          seriesId: selectedSeries,
          filters: finalFilters,
          ...(status === "deleted" && { isDeleted: true }),
          ...(status === "archived" && { isArchived: true }),
          ...(status === "both" && { isDeleted: 2, isArchived: 2 }),
        },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // 使用電腦時間格式化檔名
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const fileName = `products-${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("匯出失敗！");
    }
  };

  useEffect(() => {
    if (!series.length) return;
    if (!targetSeries) {
      setSelectedSeries(get(series, "[0].id", 1));
      return;
    }
    if (!fields.length) return;
    handleSearch();
  }, [series, selectedSeries, page, forceRefresh, limit, sortState, status]);

  useEffect(() => {
    const { selectedSeries, limit, page, searchFields, status } = restore();
    if (selectedSeries) setSelectedSeries(selectedSeries);
    if (limit && pageSizes.includes(limit)) setLimit(limit);
    if (page) setPage(page);
    if (searchFields) setSearchFields(searchFields);
    if (status) setStatus(status);
  }, [location]);

  const handleInput = (data: ProductSearchFilters) => {
    const { fieldId, value, operation } = data;
    let isNewField = true;
    const newSearchFields = searchFields.map((field) => {
      if (field.fieldId === fieldId) {
        isNewField = false;
        return operation ? { ...field, value, operation } : { ...field, value };
      }
      return field;
    });
    if (isNewField) {
      newSearchFields.push(
        operation ? { fieldId, value, operation } : { fieldId, value }
      );
    }
    setSearchFields(newSearchFields);
  };
  const handleSearch = () => {
    const { filters, finalFilters, params } = buildSearchPayload(fields);

    updateFavoritesWithIds(filters.map((filter) => filter.fieldId));
    snapshot({
      selectedSeries,
      searchFields: filters,
      page,
      limit,
      status,
    });

    searchProduct({
      data: {
        seriesId: selectedSeries,
        filters: finalFilters,
        ...(status === "deleted" && { isDeleted: true }),
        ...(status === "archived" && { isArchived: true }),
        ...(status === "both" && { isDeleted: 2, isArchived: 2 }),
      },
      params,
    });
  };

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(parseInt(event.target.value));
    setSearchFields([]);
    first();
    setSortState({ fieldId: -1, order: "asc" });
  };

  const handleClear = () => {
    setSearchFields([]);
    setStatus(undefined);
    setForceRefresh((prev) => prev + 1);
  };

  return (
    <Stack gap={2}>
      <Row className="justify-content-between align-items-center">
        <Col xs="auto" className="d-flex gap-2">
          <Form.Select value={selectedSeries} onChange={(e) => handleSelect(e)}>
            {series.map((series) => (
              <option key={series.id} value={series.id}>
                {series.name}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            value={status === undefined ? "all" : status}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setStatus(undefined);
              } else {
                setStatus(value as "deleted" | "archived" | "both");
              }
            }}
          >
            <option value="all">正常產品</option>
            <option value="deleted">已刪除</option>
            <option value="archived">已封存</option>
            <option value="both">全部(含封存/刪除)</option>
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleExport} size="sm">
            匯出 Excel
          </Button>
        </Col>
      </Row>
      <Form>
        <SearchBar
          fields={fields}
          searchFields={searchFields}
          handleInput={handleInput}
          seriesFavoriteRecord={seriesFavoriteRecord}
        />
        <ControlBar
          handleSearch={() => {
            first();
            handleSearch();
          }}
          handleClear={handleClear}
        />
      </Form>
    </Stack>
  );
};

interface ControlBarProps {
  handleSearch: () => void;
  handleClear: () => void;
}

const ControlBar = ({ handleSearch, handleClear }: ControlBarProps) => {
  return (
    <Row className="g-2 my-2 justify-content-end">
      <Col xs="auto">
        <Button
          type="submit"
          onClick={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          搜尋
        </Button>
      </Col>
      <Col xs="auto">
        <Button type="reset" onClick={handleClear}>
          清空
        </Button>
      </Col>
    </Row>
  );
};

const useHistorySearch = () => {
  const { sessionStorage } = window;
  const SESSION_STORAGE_KEY = "ONE_TIME_SEARCH_FIELDS";

  interface Snapshot {
    selectedSeries: number;
    searchFields: ProductSearchFilters[];
    page: number;
    limit: number;
    status?: "deleted" | "archived" | "both";
  }

  const snapshot = ({
    selectedSeries,
    searchFields,
    page,
    limit,
    status,
  }: Snapshot) => {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        selectedSeries,
        searchFields,
        page,
        limit,
        status,
      })
    );
  };

  const restore = (): Snapshot => {
    const snapshot = JSON.parse(
      sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}"
    ) as Snapshot;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return snapshot;
  };

  return { snapshot, restore };
};

export default Search;
