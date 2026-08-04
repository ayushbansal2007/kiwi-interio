import { refreshAccessToken } from "./authService";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const apiClient = async (
  url: string,
  options: RequestInit = {}
) => {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Access token expire ho gaya
  if (response.status === 401) {
    try {
      const data = await refreshAccessToken();

      if (data.accessToken) {
        accessToken = data.accessToken;
        localStorage.setItem("token", data.accessToken);

        headers.set(
          "Authorization",
          `Bearer ${accessToken}`
        );

        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  }

  return response;
};