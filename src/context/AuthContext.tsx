import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import useAxios from "axios-hooks";
import { get } from "lodash";
import moment from "moment";
import axios, { AxiosError } from "axios";

export interface AuthContextProps {
  accessToken: string;
  login: (jwt: string) => void;
  logout: () => void;
  detectIsNeedToRefresh: () => void;
  isAuthenticated: () => boolean;
  getPayload: () => Payload;
}

export const AuthContext = createContext<AuthContextProps>({
  accessToken: "",
  login: () => undefined,
  logout: () => undefined,
  detectIsNeedToRefresh: () => undefined,
  isAuthenticated: () => false,
  getPayload: () => ({}) as Payload,
});

interface AuthProviderProps {
  children: ReactNode;
}

interface Payload {
  fresh: boolean;
  iat: number;
  jti: string;
  type: string;
  sub: number;
  nbf: number;
  exp: number;
  permissions: string[];
}

interface refreshResponse {
  accessToken: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string>(
    localStorage.getItem("accessToken") || ""
  );

  const [{ loading: refreshLoading }, refresh] = useAxios<refreshResponse>(
    {
      url: "/jwt/refresh",
      method: "POST",
    },
    { manual: true }
  );

  const jwtDecode = (accessToken: string) => {
    const [, encryPayload] = accessToken.split(".");
    const payload = JSON.parse(atob(encryPayload)) as Payload;

    return payload;
  };

  const login = useCallback((jwt: string) => {
    setAccessToken(jwt);
    localStorage.setItem("accessToken", jwt);
    localStorage.setItem(
      "accessTokenExpiration",
      jwtDecode(jwt).exp.toString()
    );
  }, []);

  const logout = useCallback(() => {
    setAccessToken("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenExpiration");
  }, []);

  const detectIsNeedToRefresh = useCallback(async () => {
    if (accessToken === "") return;
    if (refreshLoading) return;
    try {
      // Get the expiration time of the current token from the access token
      const expirationTime = moment(
        parseInt(localStorage.getItem("accessTokenExpiration") || "") * 1000
      );

      // Calculate the time difference between now and the token's expiration time
      const timeDifference = expirationTime.diff(moment(), "minutes");

      // Token expire logout
      if (timeDifference <= 0) {
        logout();
      }

      // If the token will expire within 5 minutes, refresh the token
      if (timeDifference <= 5) {
        // Call refresh API
        const response = await refresh();
        if (response.status === 200) {
          const token = get(response, "data.accessToken", "");
          login(token);
        } else if (response.status === 401) {
          console.log("Token expired");
          logout();
        } else {
          console.log("Failed to refresh token");
          logout();
        }
      }
    } catch (error) {
      console.error("An error occurred while refreshing the token", error);
    }
  }, [accessToken, refreshLoading, refresh, login, logout]);

  useEffect(() => {
    if (!accessToken) return;

    const payload = jwtDecode(accessToken);
    if (payload.exp < Date.now() / 1000) {
      queueMicrotask(() => logout());
    }
  }, [accessToken, logout]);

  const isAuthenticated = () => {
    return !!accessToken;
  };

  const getPayload = () => {
    return accessToken ? jwtDecode(accessToken) : ({} as Payload);
  };

  // 設定 axios 響應攔截器來處理強制登出
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // 檢查響應中是否有 forceLogout 標誌
        if (
          error?.response?.data &&
          typeof error.response.data === "object" &&
          "forceLogout" in error.response.data
        ) {
          console.log("Token has been revoked. Forcing logout...");
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    // 清理函數，移除攔截器
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // 設定 axios authorization header
  useEffect(() => {
    if (isAuthenticated()) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        detectIsNeedToRefresh,
        login,
        logout,
        isAuthenticated,
        getPayload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
