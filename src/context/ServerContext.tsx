import { createContext, useState, useEffect, ReactNode } from "react";
import useAxios from "axios-hooks";
import { get } from "lodash";
import axios from "axios";

interface ServerContextProps {
  host: string;
  isHealth: boolean;
  healthChecking: boolean;
  setHost: (host: string) => void;
}

export const ServerContext = createContext<ServerContextProps>({
  host: "",
  isHealth: false,
  healthChecking: false,
  setHost: () => {},
});

interface ServerProviderProps {
  children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
  const server = localStorage.getItem("server");
  const [host, setHost] = useState(server || "");
  const [{ data, loading: healthChecking }, healthCheck] = useAxios<
    APIResponse,
    void
  >(
    {
      url: "/health",
      method: "GET",
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    if (host === "") return;

    axios.defaults.baseURL = host;
    localStorage.setItem("server", host);
    void healthCheck();

    return () => {};
  }, [host, healthCheck]);

  useEffect(() => {
    if (!data) return;

    if (get(data, "code") !== 200) {
      localStorage.removeItem("server");
      setHost("");
    }

    return () => {};
  }, [data]);

  const handleSetHost = (server: string) => {
    const host = server.startsWith("http") ? server : `http://${server}`;
    setHost(host);
  };

  const isHealth = get(data, "code") === 200;

  return (
    <ServerContext.Provider
      value={{
        host,
        isHealth,
        healthChecking,
        setHost: handleSetHost,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
