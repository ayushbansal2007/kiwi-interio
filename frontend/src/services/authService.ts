const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

const REFRESH_TOKEN_KEY = "refreshToken";

export const storeRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getStoredRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();
  if (data.refreshToken) {
    storeRefreshToken(data.refreshToken);
  }
  return data;
};

export const loginWithGoogle = async (credential: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ credential }),
  });

  const data = await response.json();
  if (data.refreshToken) {
    storeRefreshToken(data.refreshToken);
  }
  return data;
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  number: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (data.refreshToken) {
    storeRefreshToken(data.refreshToken);
  }
  return data;
};

export const refreshAccessToken = async () => {
  const storedRefreshToken = getStoredRefreshToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(
      storedRefreshToken ? { refreshToken: storedRefreshToken } : {}
    ),
  });

  const data = await response.json();
  if (data.refreshToken) {
    storeRefreshToken(data.refreshToken);
  } else if (!response.ok) {
    storeRefreshToken(null);
  }
  return data;
};

export const logoutUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  storeRefreshToken(null);
  return await response.json();
};

export const getProfile = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  return await response.json();
};
