import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import { Breadcrumb, Container } from "react-bootstrap";

interface IMatchHandle {
  crumb: string | undefined;
}

const MyBreadcrumb = () => {
  const matches = useMatches() as UIMatch<unknown, IMatchHandle>[];
  const navigate = useNavigate();
  const breadcrumbs = matches
    .map((match) => ({
      crumb: match.handle?.crumb,
      path: match.pathname,
    }))
    .filter((data) => data.crumb);

  return (
    <Container className="pt-2">
      <Breadcrumb>
        {breadcrumbs.map((breadcrumb, index) => (
          <Breadcrumb.Item
            key={index}
            active={index === breadcrumbs.length - 1}
            onClick={() => navigate(breadcrumb.path)}
          >
            {breadcrumb.crumb}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </Container>
  );
};

export default MyBreadcrumb;
