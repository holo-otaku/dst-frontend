import { Pagination } from "react-bootstrap";

export interface PaginationProps {
  currentPage: number;
  availablePages: Array<number | "...">;
  goto: (page: number) => void;
  first: () => void;
  previous: () => void;
  next: () => void;
  last: () => void;
}

const MyPagination = ({
  currentPage,
  availablePages,
  goto,
  first,
  previous,
  next,
  last,
}: PaginationProps) => (
  <Pagination>
    <Pagination.First onClick={first} />
    <Pagination.Prev onClick={previous} />
    {availablePages.map((page, index) => {
      if (page === "...") {
        return <Pagination.Ellipsis key={index} />;
      }

      return (
        <Pagination.Item
          key={index}
          active={page === currentPage}
          onClick={() => goto(page as number)}
        >
          {page}
        </Pagination.Item>
      );
    })}
    <Pagination.Next onClick={next} />
    <Pagination.Last onClick={last} />
  </Pagination>
);

export { MyPagination as Pagination };
