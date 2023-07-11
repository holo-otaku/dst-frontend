import { createContext, useState, ReactNode, useEffect } from "react";

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string>(
    localStorage.getItem("accessToken") || ""
  );

  useEffect(() => {
    if (accessToken === "") {
      return;
    }

    const [, encryPayload] = accessToken.split(".");
    const payload = JSON.parse(atob(encryPayload)) as Payload;

    if (payload.exp < Date.now() / 1000) {
      logout();
    }
  }, [accessToken]);

  const login = (jwt: string) => {
    setAccessToken(jwt);
    localStorage.setItem("accessToken", jwt);
  };

  const logout = () => {
    setAccessToken("");
    localStorage.removeItem("accessToken");
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
