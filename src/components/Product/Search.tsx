import { useState, useEffect } from "react";
import { Stack, InputGroup, Form, Row, Col, Button } from "react-bootstrap";
import useAxios, { RefetchFunction } from "axios-hooks";
import {
  SeriesField,
  SeriesFieldDataType,
  SeriesResponse,
} from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { get } from "lodash";
import {
  ProductSearchPayloadField,
  ProductSearchPayloadOperation,
  ProductSearchResponse,
} from "./Interface";
import ProductTable from "./ProductTable";

export const Search = () => {
  const [{ data: seriesResponse, loading: seriesLoading }] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
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
    },
  );

  useEffect(() => {
    if (!seriesResponse) return;
    const seriesId = seriesResponse.data[0].id;
    const payload: ProductSearchPayloadField = {
      seriesId: seriesId,
      filters: [],
    };
    void searchProduct({
      data: payload,
    });
  }, [seriesResponse, searchProduct]);

  const pageLoading = seriesLoading || productSearchLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Bar
        series={get(seriesResponse, "data", [])}
        searchProduct={searchProduct}
      />
      <hr />
      <ProductTable products={get(productSearchResponse, "data", [])} />
    </Stack>
  );
};

interface BarProps {
  series: SeriesResponse["data"];
  searchProduct: RefetchFunction<
    ProductSearchPayloadField,
    ProductSearchResponse
  >;
}

const Bar = ({ series, searchProduct }: BarProps) => {
  const [selectedSeries, setSelectedSeries] = useState<number>(
    get(series, "[0].id", 1),
  );

  const [searchFields, setSearchFields] = useState<ProductSearchPayloadField[]>(
    [],
  );

  useEffect(() => {
    void searchProduct({
      data: {
        seriesId: selectedSeries,
        filters: [],
      },
    });
  }, [selectedSeries, searchProduct]);

  const handleInput = (data: ProductSearchPayloadField) => {
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
        operation ? { fieldId, value, operation } : { fieldId, value },
      );
    }

    setSearchFields(newSearchFields);
  };

  const targetSeries = series.find((series) => series.id === selectedSeries);
  const fields = get(targetSeries, "fields", []);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(parseInt(event.target.value));
  };

  const handleClear = () => {
    setSearchFields([]);
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
          handleSearch={() => void searchProduct({ data: searchFields })}
          handleClear={handleClear}
        />
      </Form>
    </Stack>
  );
};

interface SearchBarProps {
  fields: SeriesField[];
  searchFields: ProductSearchPayloadField[];
  handleInput: (data: ProductSearchPayloadField) => void;
}

const SearchBar = ({ fields, handleInput, searchFields }: SearchBarProps) => {
  const filterFields = fields.filter((field) => field.isFiltered);

  return (
    <Row className="g-2">
      {filterFields.map((field) => {
        const id = get(field, "id", 0);
        const searchData = searchFields.find(
          (searchField) => searchField.fieldId === id,
        );
        const wrap = (children: React.ReactNode) => (
          <Col key={id} xs={12} md={6} lg={3}>
            {children}
          </Col>
        );
        const handleChange = (
          value: string | number,
          operation?: ProductSearchPayloadOperation,
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
              />,
            );
          case SeriesFieldDataType.string:
            return wrap(
              <StringFilter
                title={field.name}
                handleChange={handleChange}
                searchData={searchData}
              />,
            );
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
    value: string | number,
    operation?: ProductSearchPayloadOperation,
  ) => void;
  searchData?: ProductSearchPayloadField;
}

const NumberFilter = ({ title, handleChange, searchData }: FilterProps) => {
  const operator = get(
    searchData,
    "operation",
    ProductSearchPayloadOperation.EQUAL,
  );
  const value = get(searchData, "value", "") as string;

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    handleChange(
      value,
      event.currentTarget.value as ProductSearchPayloadOperation,
    );
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(parseInt(event.currentTarget.value), operator);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select onChange={handleOperatorChange}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">"}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<"}</option>
      </Form.Select>
      <Form.Control value={value} onChange={handleValueChange} type="number" />
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
