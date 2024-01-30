import { Container, Form, Button } from "react-bootstrap";
import useAxios from "axios-hooks";
import { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context";
import { get } from "lodash";
import Backdrop from "../Backdrop/Backdrop";
import { DotLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

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

const Login = () => {
  const navigate = useNavigate();
  const [{ data, loading, error }, doLogin] = useAxios<
    LoginResponse,
    LoginRequest,
    APIResponse
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

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (usernameRef.current && passwordRef.current) {
      const requestData: LoginRequest = {
        username: get(usernameRef, "current.value", ""),
        password: get(passwordRef, "current.value", ""),
      };

      void doLogin({
        data: requestData,
      });
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
      navigate("/series");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      alert(`登入失敗: ${error.response?.data.msg}`);
    }
  }, [error]);
  console.log(import.meta.env.VITE_API_HOST);

  const pageLoading = loading;

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <h1>DST System</h1>
      <Backdrop show={pageLoading}>
        <DotLoader color="#36d7b7" />
      </Backdrop>
      <Form>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>使用者名稱</Form.Label>
          <Form.Control type="text" ref={usernameRef} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>密碼</Form.Label>
          <Form.Control type="password" ref={passwordRef} />
        </Form.Group>

        <Button variant="primary" type="submit" onClick={handleLogin}>
          登入
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
