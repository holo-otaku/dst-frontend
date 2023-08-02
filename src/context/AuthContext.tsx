import { createContext, useState, ReactNode, useEffect } from "react";
import useAxios from "axios-hooks";
import { get } from "lodash";
import moment from 'moment';

export interface AuthContextProps {
  accessToken: string;
  login: (jwt: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  accessToken: "",
  login: () => undefined,
  logout: () => undefined,
  isAuthenticated: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

interface Payload {
  exp: number;
}

interface refreshResponse {
  accessToken: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string>(
    localStorage.getItem("accessToken") || ""
  );

  const [, refresh] = useAxios<refreshResponse>(
    {
      url: "/jwt/refresh",
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
    { manual: true }
  );

  const refreshInterval = 5000; // set interval to wait for the next check, in milliseconds
  let timeoutId: number | null = null;

  const refreshToken = async () => {
    if (accessToken === "")
      return
    try {
      // Get the expiration time of the current token from the access token
      const expirationTime = moment(parseInt(localStorage.getItem("accessTokenExpiration") || '') * 1000);

      // Calculate the time difference between now and the token's expiration time
      const timeDifference = expirationTime.diff(moment(), "minutes");

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
        }
        else {
          console.log("Failed to refresh token");
        }
      }
    } catch (error) {
      console.error("An error occurred while refreshing the token", error);
    } finally {
      // Only schedule the next refresh if the previous one was successful
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(refreshToken, refreshInterval);
    }
  };

  const jwtDecode = (accessToken: string) => {
    const [, encryPayload] = accessToken.split(".");
    const payload = JSON.parse(atob(encryPayload)) as Payload;

    return payload
  }

  useEffect(() => {
    // Call refreshToken immediately on component mount
    void refreshToken();
  });

  useEffect(() => {
    if (accessToken === "") {
      return;
    }

    const payload = jwtDecode(accessToken)

    if (payload.exp < Date.now() / 1000) {
      logout();
    }
  }, [accessToken]);

  const login = (jwt: string) => {
    setAccessToken(jwt);
    localStorage.setItem("accessToken", jwt);
    localStorage.setItem("accessTokenExpiration", jwtDecode(jwt).exp.toString());
  };

  const logout = () => {
    setAccessToken("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenExpiration");
  };

  const isAuthenticated = () => {
    return !!accessToken;
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
