import { useEffect, useState } from "react";
import { Stack, InputGroup, Form, Row, Col, Button } from "react-bootstrap";
import useAxios, { RefetchFunction } from "axios-hooks";
import {
  SeriesField,
  SeriesFieldDataType,
  SeriesResponse,
} from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import Pagination from "react-bootstrap/Pagination";
import { get } from "lodash";
import {
  ProductSearchFilters,
  ProductSearchPayloadField,
  ProductSearchPayloadOperation,
  ProductSearchResponse,
} from "./Interface";
import ProductTable from "./ProductTable";

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
  const [page, setPage] = useState<number>(1);
  const limit = 5;
  const totalPage = Math.ceil(
    get(productSearchResponse, "totalCount", 0) / limit
  );

  useEffect(() => {
    void fetchSeries();
    return () => {};
  }, [fetchSeries]);

  const pageLoading = seriesLoading || productSearchLoading;

  return (
    <Stack gap={2}>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Bar
        series={get(seriesResponse, "data", [])}
        {...{ searchProduct, page, limit, setPage }}
      />
      <hr />
      <ProductTable products={get(productSearchResponse, "data", [])} />
      <Stack direction="horizontal" className="justify-content-center">
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} />
          {Array.from({ length: totalPage }).map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === page}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Last onClick={() => setPage(totalPage)} />
        </Pagination>
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
  setPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  limit: number;
}

const Bar = ({ series, searchProduct, page, limit, setPage }: BarProps) => {
  const [selectedSeries, setSelectedSeries] = useState<number>(
    get(series, "[0].id", 1)
  );

  const [searchFields, setSearchFields] = useState<ProductSearchFilters[]>([]);
  const [forceRefresh, setForceRefresh] = useState<number>(1);
  const targetSeries = series.find((series) => series.id === selectedSeries);
  const fields = get(targetSeries, "fields", []);

  useEffect(() => {
    // 每次系列改變時，清空搜尋欄位，並且直接協助無條件搜尋
    // 不過要確保系列資料已經載入完成
    if (!series.length) return;
    if (!targetSeries) return;
    if (!fields.length) return;

    // 換頁時，不要清空搜尋欄位
    if (fields.length !== 0) {
      handleSearch();
      return;
    }

    setSearchFields([]);
    void searchProduct({
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
  }, [series, selectedSeries, page, forceRefresh]);

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

  const handleSearch = () =>
    searchProduct({
      data: {
        seriesId: selectedSeries,
        filters: searchFields.filter((field) => field.value), // 去除空值
      },
      params: {
        page,
        limit,
      },
    });

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(parseInt(event.target.value));
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
        />
        <ControlBar
          handleSearch={() => {
            // 搜尋按鈕觸發時，直接跳到第一頁
            setPage(1);
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
  handleInput: (data: ProductSearchFilters) => void;
}

const SearchBar = ({ fields, handleInput, searchFields }: SearchBarProps) => {
  const filterFields = fields.filter((field) => field.isFiltered);

  return (
    <Row className="g-2">
      {filterFields.map((field) => {
        const id = get(field, "id", 0);
        const searchData = searchFields.find(
          (searchField) => searchField.fieldId === id
        );
        const wrap = (children: React.ReactNode) => (
          <Col key={id} xs={12} md={6} lg={3}>
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
                title={field.name}
                handleChange={handleChange}
                searchData={searchData}
              />
            );
          case SeriesFieldDataType.string:
            return wrap(
              <StringFilter
                title={field.name}
                handleChange={handleChange}
                searchData={searchData}
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
      })}
    </Row>
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
  handleChange: (
    value: string | number | boolean,
    operation?: ProductSearchPayloadOperation
  ) => void;
  searchData?: ProductSearchFilters;
}

const NumberFilter = ({ title, handleChange, searchData }: FilterProps) => {
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
      />
    </InputGroup>
  );
};

const StringFilter = ({ title, handleChange, searchData }: FilterProps) => {
  const value = get(searchData, "value", "") as string;

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.currentTarget.value);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Control type="text" value={value} onChange={handleValueChange} />
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