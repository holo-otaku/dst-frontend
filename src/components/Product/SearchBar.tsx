import { FavoriteRecord } from "../../hooks";
import {
  SeriesDetailResponse,
  SeriesField,
  SeriesFieldDataType,
} from "../Series/Interfaces";
import {
  BooleanFilter,
  DatetimeFilter,
  NumberFilter,
  StringFilter,
} from "./FilterFields";
import {
  ProductSearchFilters,
  ProductSearchPayloadOperation,
} from "./Interface";
import { get, orderBy } from "lodash";
import { Accordion, Col, Row, Stack } from "react-bootstrap";

interface SearchBarProps {
  fields: SeriesField[];
  searchFields: ProductSearchFilters[];
  seriesFavoriteRecord: FavoriteRecord[];
  seriesDetail: SeriesDetailResponse["data"];
  handleInput: (data: ProductSearchFilters) => void;
}

const MAX_FAVORITE_FIELDS = 3;

export const SearchBar = ({
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
