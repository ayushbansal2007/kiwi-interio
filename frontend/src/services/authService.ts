const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

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

  return await response.json();
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return await response.json();
};

export const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return await response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

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