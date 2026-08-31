
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser
} from "../services/authService";

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children
}) => {
  const [user, setUser] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "nexa_user"
        );

      return saved
        ? JSON.parse(saved)
        : null;
    });

  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        "nexa_token"
      )
    );

  const [loading, setLoading] =
    useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(
      "nexa_token"
    );

    localStorage.removeItem(
      "nexa_user"
    );

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const restoreSession =
      async () => {
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const result =
            await getCurrentUser();

          setUser(
            result.user
          );

          localStorage.setItem(
            "nexa_user",
            JSON.stringify(
              result.user
            )
          );
        } catch {
          logout();
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, [token, logout]);

  const persistSession = useCallback(
    (authResult) => {
      localStorage.setItem(
        "nexa_token",
        authResult.token
      );

      localStorage.setItem(
        "nexa_user",
        JSON.stringify(
          authResult.user
        )
      );

      setToken(authResult.token);
      setUser(authResult.user);
    },
    []
  );

  const login = useCallback(
    async (credentials) => {
      const result =
        await loginUser(
          credentials
        );

      persistSession(result);

      return result;
    },
    [persistSession]
  );

  const register = useCallback(
    async (credentials) => {
      const result =
        await registerUser(
          credentials
        );

      persistSession(result);

      return result;
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated:
        Boolean(token && user),
      isAdmin:
        user?.role === "admin",
      login,
      register,
      logout
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () =>
  useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth };

