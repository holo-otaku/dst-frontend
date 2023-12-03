import React, { createContext, useState, useEffect, ReactNode } from "react";

interface ColorModeContextProps {
  colorMode: string;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextProps>({
  colorMode: "light",
  toggleColorMode: () => undefined,
});

interface ColorModeProviderProps {
  children: ReactNode;
}

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({
  children,
}) => {
  const [colorMode, setColorMode] = useState<string>(
    localStorage.getItem("colorMode") || "light"
  );

  const setHtmlThemeAttribute = (theme: string) => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  };

  useEffect(() => {
    localStorage.setItem("colorMode", colorMode);
    setHtmlThemeAttribute(colorMode);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};
