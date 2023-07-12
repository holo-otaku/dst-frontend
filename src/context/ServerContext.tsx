import { createContext, useState, useEffect, ReactNode } from "react";
import useAxios from "axios-hooks";
import { get } from "lodash";
import axios from "axios";

interface ServerContextProps {
  host: string;
  isHealth: boolean;
  setHost: (host: string) => void;
}

export const ServerContext = createContext<ServerContextProps>({
  host: "",
  isHealth: false,
  setHost: () => {},
});

interface ServerProviderProps {
  children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
  const [host, setHost] = useState("");
  const [{ data }, healthCheck] = useAxios<APIResponse, void>(
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
  }, [host, healthCheck]);

  useEffect(() => {
    const server = localStorage.getItem("server");
    if (server) {
      setHost(server);
      console.log("set host");
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    if (get(data, "code") !== 200) {
      localStorage.removeItem("server");
      setHost("");
    }
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
        setHost: handleSetHost,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
