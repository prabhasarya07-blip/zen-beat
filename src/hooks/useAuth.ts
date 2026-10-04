import { useEffect, useState } from "react";
import { API_URL } from "@/lib/apiConfig";

export interface User {
  id: number;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("moodsync_token");
    const storedUser = localStorage.getItem("moodsync_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("moodsync_token");
        localStorage.removeItem("moodsync_user");
      }
    }
    setIsReady(true);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("moodsync_token", token);
    localStorage.setItem("moodsync_user", JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    localStorage.removeItem("moodsync_token");
    localStorage.removeItem("moodsync_user");
    setUser(null);
  };

  return { user, loading: !isReady, isReady, login, signOut };
}

export { API_URL };

