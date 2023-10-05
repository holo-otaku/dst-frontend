import { useEffect, useState } from "react";
import { Stack, Form, Row, Col, Button } from "react-bootstrap";
import useAxios, { RefetchFunction } from "axios-hooks";
import { SeriesDetailResponse, SeriesResponse } from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { Pagination } from "../Pagination";
import { get } from "lodash";
import {
  ProductSearchFilters,
  ProductSearchPayloadField,
  ProductSearchResponse,
} from "./Interface";
import ProductTable from "./ProductTable";
import { SearchBar } from "./SearchBar";
import { useFavoriteFilterField, usePaginate } from "@renderer/hooks";
import { useLocation } from "react-router-dom";

const pageSizes = [25, 50, 100];

export const Search = () => {
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
  const [
    { data: seriesDetailResponse, loading: seriesDetailLoading },
    fetchSeriesDetail,
  ] = useAxios<SeriesDetailResponse>(
    {
      method: "GET",
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

  const { currentPage, availablePages, limit } = PaginateState;

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    if (productSearchResponse) {
      PaginateAction.changeTotal(productSearchResponse.totalCount);
    }
  }, [productSearchResponse]);

  const onSeriesChange = (seriesId: number) =>
    fetchSeriesDetail({
      url: `/series/${seriesId}`,
    });

  const pageLoading =
    seriesLoading || productSearchLoading || seriesDetailLoading;

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
          onSeriesChange,
          seriesDetail: get(seriesDetailResponse, "data"),
          setLimit: setPageLimit,
          setPage: PaginateAction.setCurrentPage,
        }}
      />
      <hr />
      <Stack direction="horizontal" style={{ flexGrow: 1 }}>
        <div style={{ marginLeft: "auto" }}>
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
      <ProductTable products={get(productSearchResponse, "data", [])} />
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
  onSeriesChange: (seriesId: number) => void;
  seriesDetail?: SeriesDetailResponse["data"];
  first: () => void;
  page: number;
  limit: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
}

const Bar = ({
  series,
  searchProduct,
  page,
  limit,
  first,
  onSeriesChange,
  seriesDetail,
  setLimit,
  setPage,
}: BarProps) => {
  const [selectedSeries, setSelectedSeries] = useState<number>(1);
  const [searchFields, setSearchFields] = useState<ProductSearchFilters[]>([]);
  const [forceRefresh, setForceRefresh] = useState<number>(1);
  const { seriesFavoriteRecord, updateFavoritesWithIds } =
    useFavoriteFilterField(selectedSeries, get(series, "[0].fields", []));
  const targetSeries = series.find((series) => series.id === selectedSeries);
  const fields = get(targetSeries, "fields", []);
  const { snapshot, restore } = useHistorySearch();
  const location = useLocation();

  useEffect(() => {
    // 每次系列改變時，清空搜尋欄位，並且直接協助無條件搜尋
    // 不過要確保系列資料已經載入完成
    if (!series.length) return;
    if (!targetSeries) {
      // 初次載入時，targetSeries 會是 undefined
      // 協助更新 selectedSeries
      setSelectedSeries(get(series, "[0].id", 1));
      return;
    }
    if (!fields.length) return;
    onSeriesChange(selectedSeries);

    // 換頁時，不要清空搜尋欄位
    if (fields.length !== 0) {
      handleSearch();
      return;
    }

    setSearchFields([]);
    searchProduct({
      data: {
        seriesId: selectedSeries,
        filters: [],
      },
      params: {
        page,
        limit,
      },
    });
    return () => {};
  }, [series, selectedSeries, page, forceRefresh, limit]);

  useEffect(() => {
    const { selectedSeries, limit, page, searchFields } = restore();

    if (selectedSeries) {
      setSelectedSeries(selectedSeries);
    }

    if (limit && pageSizes.includes(limit)) {
      setLimit(limit);
    }

    if (page) {
      setPage(page);
    }

    if (searchFields) {
      setSearchFields(searchFields);
    }
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
    // 去除空值
    const filters = searchFields.filter((field) => field.value);
    // 更新最愛欄位
    updateFavoritesWithIds(filters.map((filter) => filter.fieldId));
    // 儲存搜尋欄位
    snapshot({
      selectedSeries,
      searchFields: filters,
      page,
      limit,
    });

    searchProduct({
      data: {
        seriesId: selectedSeries,
        filters,
      },
      params: {
        page,
        limit,
      },
    });
  };

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(parseInt(event.target.value));
    setSearchFields([]);
    first();
  };

  const handleClear = () => {
    setSearchFields([]);
    setForceRefresh((prev) => prev + 1);
  };

  return (
    <Stack gap={2}>
      <Form.Select value={selectedSeries} onChange={(e) => handleSelect(e)}>
        {series.map((series) => (
          <option key={series.id} value={series.id}>
            {series.name}
          </option>
        ))}
      </Form.Select>
      <Form>
        <SearchBar
          fields={fields}
          searchFields={searchFields}
          handleInput={handleInput}
          seriesFavoriteRecord={seriesFavoriteRecord}
          seriesDetail={seriesDetail!}
        />
        <ControlBar
          handleSearch={() => {
            // 搜尋按鈕觸發時，直接跳到第一頁
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

/**
 * 處理搜尋欄位的邏輯，在使用者進入編輯頁面前，會先將搜尋欄位的資料存到 sessionStorage
 * 以及他的瀏覽頁數，這樣使用者在編輯完後，可以回到原本的頁數
 */
const useHistorySearch = () => {
  const { sessionStorage } = window;
  const SESSION_STORAGE_KEY = "ONE_TIME_SEARCH_FIELDS";

  interface Snapshot {
    selectedSeries: number;
    searchFields: ProductSearchFilters[];
    page: number;
    limit: number;
  }

  const snapshot = ({
    selectedSeries,
    searchFields,
    page,
    limit,
  }: Snapshot) => {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        selectedSeries,
        searchFields,
        page,
        limit,
      })
    );
  };

  const restore = (): Snapshot => {
    const snapshot = JSON.parse(
      sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}"
    );
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return snapshot;
  };

  return { snapshot, restore };
};
