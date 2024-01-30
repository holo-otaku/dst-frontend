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

export interface AuthContextProps {
  accessToken: string;
  login: (jwt: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getPayload: () => Payload;
}

export const AuthContext = createContext<AuthContextProps>({
  accessToken: "",
  login: () => undefined,
  logout: () => undefined,
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

  const refreshInterval = 60 * 10 * 1000; // set interval to wait for the next check, in milliseconds
  const refreshToken = useCallback(async () => {
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
    } finally {
      setTimeout(refreshToken, refreshInterval);
    }
  }, []);

  const jwtDecode = (accessToken: string) => {
    const [, encryPayload] = accessToken.split(".");
    const payload = JSON.parse(atob(encryPayload)) as Payload;

    return payload;
  };

  useEffect(() => {
    // Call refreshToken immediately on component mount
    void refreshToken();
    return () => {};
  }, []);

  useEffect(() => {
    if (accessToken === "") {
      return;
    }

    const payload = jwtDecode(accessToken);

    if (payload.exp < Date.now() / 1000) {
      logout();
    }
  }, [accessToken]);

  const login = (jwt: string) => {
    setAccessToken(jwt);
    localStorage.setItem("accessToken", jwt);
    localStorage.setItem(
      "accessTokenExpiration",
      jwtDecode(jwt).exp.toString()
    );
  };

  const logout = () => {
    setAccessToken("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenExpiration");
  };

  const isAuthenticated = () => {
    return !!accessToken;
  };

  const getPayload = () => {
    return accessToken ? jwtDecode(accessToken) : ({} as Payload);
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, isAuthenticated, getPayload }}
    >
      {children}
    </AuthContext.Provider>
  );
};
