import { useState } from "react";
import { Stack, InputGroup, Form, Row, Col } from "react-bootstrap";
import useAxios from "axios-hooks";
import {
  SeriesField,
  SeriesFieldDataType,
  SeriesResponse,
} from "../Series/Interfaces";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { get } from "lodash";

export const Search = () => {
  const [{ data: seriesResponse, loading: seriesLoading }] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
      },
    });

  const pageLoading = seriesLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Bar series={get(seriesResponse, "data", [])} />
      <hr />
    </Stack>
  );
};

interface BarProps {
  series: SeriesResponse["data"] | [];
}

const Bar = ({ series }: BarProps) => {
  const [selectedSeries, setSelectedSeries] = useState<number>(
    get(series, "[0].id", 1)
  );
  const fields =
    series.find((series) => series.id === selectedSeries)?.fields || [];

  const handleSelect = (event: React.FormEvent<HTMLOptionElement>) => {
    setSelectedSeries(parseInt(event.currentTarget.value));
  };

  return (
    <Stack gap={2}>
      <Form.Select>
        {series.map((series) => (
          <option
            key={series.id}
            value={selectedSeries}
            onChange={(e) => handleSelect(e)}
          >
            {series.name}
          </option>
        ))}
      </Form.Select>
      <SearchBar fields={fields} />
    </Stack>
  );
};

interface SearchBarProps {
  fields: SeriesField[];
}

const SearchBar = ({ fields }: SearchBarProps) => {
  const filterFields = fields.filter((field) => field.isFiltered);

  return (
    <Row className="g-2">
      {filterFields.map((field) => {
        const wrap = (children: React.ReactNode) => (
          <Col key={field.id} xs={12} md={6} lg={3}>
            {children}
          </Col>
        );
        switch (field.dataType) {
          case SeriesFieldDataType.number:
            return wrap(
              <NumberFilter title={field.name} handleChange={() => {}} />
            );
          case SeriesFieldDataType.string:
            return wrap(
              <StringFilter title={field.name} handleChange={() => {}} />
            );
        }
      })}
    </Row>
  );
};

interface FilterProps {
  title: string;
  handleChange: (value: string, operator?: string) => void;
}

const NumberFilter = ({ title, handleChange }: FilterProps) => {
  const [operator, setOperator] = useState<string>("=");
  const [value, setValue] = useState<string>("");

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOperator(event.currentTarget.value);
    handleChange(event.currentTarget.value, operator);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
    handleChange(event.currentTarget.value, operator);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select onChange={handleOperatorChange}>
        <option value="=">=</option>
        <option value=">">{">"}</option>
        <option value="<">{"<"}</option>
      </Form.Select>
      <Form.Control value={value} onChange={handleValueChange} />
    </InputGroup>
  );
};

const StringFilter = ({ title, handleChange }: FilterProps) => {
  const [value, setValue] = useState<string>("");

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
    handleChange(event.currentTarget.value);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Control type="text" value={value} onChange={handleValueChange} />
    </InputGroup>
  );
};
