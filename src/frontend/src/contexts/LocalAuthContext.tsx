import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const SESSION_KEY = "tv_session_id";
const NAME_KEY = "tv_name";

interface LocalAuthContextType {
  sessionId: string;
  name: string;
  isAuthenticated: boolean;
  setAuth: (sessionId: string, name: string) => void;
  logout: () => void;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(
  undefined,
);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem(SESSION_KEY) ?? "",
  );
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? "");

  const isAuthenticated = sessionId.length > 0 && name.length > 0;

  const setAuth = useCallback((sid: string, n: string) => {
    localStorage.setItem(SESSION_KEY, sid);
    localStorage.setItem(NAME_KEY, n);
    setSessionId(sid);
    setName(n);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(NAME_KEY);
    setSessionId("");
    setName("");
  }, []);

  return (
    <LocalAuthContext.Provider
      value={{ sessionId, name, isAuthenticated, setAuth, logout }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth(): LocalAuthContextType {
  const ctx = useContext(LocalAuthContext);
  if (!ctx)
    throw new Error("useLocalAuth must be used within LocalAuthProvider");
  return ctx;
}
