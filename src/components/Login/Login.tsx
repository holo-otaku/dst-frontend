import { Container, Form, Button } from "react-bootstrap";
import useAxios from "axios-hooks";
import { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context";
import { get } from "lodash";
import Backdrop from "../Backdrop/Backdrop";
import { DotLoader } from "react-spinners";

interface LoginResponse {
  code: number;
  data: {
    accessToken: string;
  };
  msg: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginError {
  msg: string;
}

const Login: React.FC = () => {
  const [{ data, loading }, doLogin] = useAxios<
    LoginResponse,
    LoginRequest,
    LoginError
  >(
    {
      url: "/login",
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
    { manual: true }
  );
  const { login, isAuthenticated } = useContext(AuthContext);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (usernameRef.current && passwordRef.current) {
      const requestData: LoginRequest = {
        username: get(usernameRef, "current.value", ""),
        password: get(passwordRef, "current.value", ""),
      };

      doLogin({
        data: requestData,
      }).then(
        () => undefined,
        () => undefined
      );
    }
  };

  useEffect(() => {
    if (data) {
      const token = get(data, "data.accessToken", "");
      login(token);
    }
  }, [data, login]);

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <h1>DST System</h1>

      {loading && (
        <Backdrop show={true}>
          <DotLoader color="#36d7b7" />
        </Backdrop>
      )}

      <Form>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            ref={usernameRef}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            ref={passwordRef}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleLogin}>
          Log in
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
