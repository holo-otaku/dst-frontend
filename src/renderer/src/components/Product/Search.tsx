import { useEffect, useState } from "react";
import {
  Stack,
  InputGroup,
  Form,
  Row,
  Col,
  Button,
  Accordion,
} from "react-bootstrap";
import useAxios, { RefetchFunction } from "axios-hooks";
import {
  SeriesDetailResponse,
  SeriesField,
  SeriesFieldDataType,
  SeriesResponse,
} from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { Pagination } from "../Pagination";
import { get, orderBy } from "lodash";
import {
  ProductSearchFilters,
  ProductSearchPayloadField,
  ProductSearchPayloadOperation,
  ProductSearchResponse,
} from "./Interface";
import ProductTable from "./ProductTable";
import {
  FavoriteRecord,
  useFavoriteFilterField,
  usePaginate,
} from "@renderer/hooks";

const MAX_FAVORITE_FIELDS = 3;

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
    void fetchSeries();
    return () => {};
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
}

const Bar = ({
  series,
  searchProduct,
  page,
  limit,
  first,
  onSeriesChange,
  seriesDetail,
}: BarProps) => {
  const [selectedSeries, setSelectedSeries] = useState<number>(1);
  const [searchFields, setSearchFields] = useState<ProductSearchFilters[]>([]);
  const [forceRefresh, setForceRefresh] = useState<number>(1);
  const { seriesFavoriteRecord, updateFavoritesWithIds } =
    useFavoriteFilterField(selectedSeries, get(series, "[0].fields", []));
  const targetSeries = series.find((series) => series.id === selectedSeries);
  const fields = get(targetSeries, "fields", []);

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
      <Form.Select onChange={(e) => handleSelect(e)}>
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

interface SearchBarProps {
  fields: SeriesField[];
  searchFields: ProductSearchFilters[];
  seriesFavoriteRecord: FavoriteRecord[];
  seriesDetail: SeriesDetailResponse["data"];
  handleInput: (data: ProductSearchFilters) => void;
}

const SearchBar = ({
  fields,
  handleInput,
  searchFields,
  seriesFavoriteRecord,
  seriesDetail,
}: SearchBarProps) => {
  const filterFields = fields.filter((field) => field.isFiltered);
  const topLatestLastUsedIds = orderBy(seriesFavoriteRecord, "lastUsed", "desc")
    .slice(0, MAX_FAVORITE_FIELDS)
    .map((record) => record.id);
  const favoriteFields = filterFields.filter((field) =>
    topLatestLastUsedIds.includes(get(field, "id", 0))
  );
  const hideFields = filterFields.filter(
    (field) => !topLatestLastUsedIds.includes(get(field, "id", 0))
  );

  const renderField = (field: SeriesField) => {
    const id = get(field, "id", 0);
    const currentFieldData = get(seriesDetail, "fields", []).find(
      (field) => field.id === id
    );
    const defaultValue = [] as (string | number)[];
    const autoCompleteValues = get(currentFieldData, "values", defaultValue);
    const searchData = searchFields.find(
      (searchField) => searchField.fieldId === id
    );
    const wrap = (children: React.ReactNode) => (
      <Col key={id} xs={12} md={6} lg={4}>
        {children}
      </Col>
    );
    const handleChange = (
      value: string | number | boolean,
      operation?: ProductSearchPayloadOperation
    ) => {
      return handleInput({ fieldId: field.id!, value, operation });
    };

    switch (field.dataType) {
      case SeriesFieldDataType.number:
        return wrap(
          <NumberFilter
            {...{
              title: field.name,
              id: field.id,
              handleChange,
              searchData,
              autoCompleteValues,
            }}
          />
        );
      case SeriesFieldDataType.string:
        return wrap(
          <StringFilter
            {...{
              title: field.name,
              id: field.id,
              handleChange,
              searchData,
              autoCompleteValues,
            }}
          />
        );
      case SeriesFieldDataType.date:
        return wrap(
          <DatetimeFilter
            title={field.name}
            handleChange={handleChange}
            searchData={searchData}
          />
        );
      case SeriesFieldDataType.boolean:
        return wrap(
          <BooleanFilter
            title={field.name}
            handleChange={handleChange}
            searchData={searchData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stack gap={2}>
      <Row className="g-2">{favoriteFields.map(renderField)}</Row>
      {hideFields.length !== 0 && (
        <Accordion>
          <Accordion.Item eventKey={"0"}>
            <Accordion.Header>更多選項</Accordion.Header>
            <Accordion.Body>
              <Row className="g-2">{hideFields.map(renderField)}</Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
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

interface FilterProps {
  title: string;
  id?: number;
  handleChange: (
    value: string | number | boolean,
    operation?: ProductSearchPayloadOperation
  ) => void;
  searchData?: ProductSearchFilters;
  autoCompleteValues?: (string | number)[];
}

const NumberFilter = ({
  title,
  id = 0,
  handleChange,
  searchData,
  autoCompleteValues = [],
}: FilterProps) => {
  const operator = get(
    searchData,
    "operation",
    ProductSearchPayloadOperation.EQUAL
  );
  const value = get(searchData, "value", "") as string;

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleChange(
      value,
      event.currentTarget.value as ProductSearchPayloadOperation
    );
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(event.currentTarget.value);
    handleChange(num, operator);
  };

  const dataListId = `list-${id}`;

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select onChange={handleOperatorChange} value={operator}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">="}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<="}</option>
      </Form.Select>
      <Form.Control
        value={value}
        onChange={handleValueChange}
        type="number"
        step="any"
        list={dataListId}
      />
      <datalist id={dataListId}>
        {autoCompleteValues.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
    </InputGroup>
  );
};

const StringFilter = ({
  title,
  id = 0,
  handleChange,
  searchData,
  autoCompleteValues = [],
}: FilterProps) => {
  const value = get(searchData, "value", "") as string;

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.currentTarget.value);
  };

  const dataListId = `list-${id}`;

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Control
        list={dataListId}
        type="text"
        value={value}
        onChange={handleValueChange}
      />
      <datalist id={dataListId}>
        {autoCompleteValues.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
    </InputGroup>
  );
};

const DatetimeFilter = ({ title, handleChange, searchData }: FilterProps) => {
  const operator = get(
    searchData,
    "operation",
    ProductSearchPayloadOperation.EQUAL
  );
  const value = get(searchData, "value", "") as string;

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleChange(
      value,
      event.currentTarget.value as ProductSearchPayloadOperation
    );
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.currentTarget.value, operator);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select value={operator} onChange={handleOperatorChange}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">="}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<="}</option>
      </Form.Select>
      <Form.Control
        className="w-50"
        type="datetime-local"
        value={value}
        onChange={handleValueChange}
      />
    </InputGroup>
  );
};

const BooleanFilter = ({ title, handleChange, searchData }: FilterProps) => {
  const value = get(searchData, "value", false) as boolean;

  const handleValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(event.currentTarget.value === "true");
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select
        value={value ? "true" : "false"}
        onChange={handleValueChange}
      >
        <option value="true">是</option>
        <option value="false">否</option>
      </Form.Select>
    </InputGroup>
  );
};
