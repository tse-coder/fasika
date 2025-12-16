import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = "https://fasika-childcare-server.onrender.com";

const client = axios.create({ baseURL: BASE_URL });

// Send cookies by default so backend sessions/cookies work if present
client.defaults.withCredentials = true;

// Simple helper to set Authorization token when needed
export const setAuthToken = (token: string | null) => {
  if (token)
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
};

// Request logging
client.interceptors.request.use((config) => {
  try {
    const { method, url, params, data } = config;
    console.log(`[API] Request -> ${method?.toUpperCase()} ${url}`, {
      params: params ?? undefined,
      body: data ?? undefined,
    });
  } catch (e) {
    // swallow logging errors
  }
  return config;
});

// Response logging
client.interceptors.response.use(
  (response) => {
    try {
      const { status, config } = response;
      console.log(
        `[API] Response <- ${config.method?.toUpperCase()} ${
          config.url
        } [${status}]`
      );
    } catch (e) {}
    return response;
  },
  (error) => {
    try {
      const { config, response } = error;
      if (response) {
        console.error(
          `[API] Error  <- ${config?.method?.toUpperCase()} ${config?.url} [${
            response.status
          }]`,
          response.data
        );
      } else {
        console.error(
          `[API] Network/Error <- ${config?.method?.toUpperCase()} ${
            config?.url
          }`,
          error.message
        );
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);

export const apiGet = async <T>(
  url: string,
  params: Record<string, any> = {}
): Promise<T> => {
  const config: AxiosRequestConfig = { params };
  const res = await client.get<T>(url, config);
  return res.data;
};

export const apiPost = async <T>(
  url: string,
  body: Record<string, any>
): Promise<T> => {
  const res = await client.post<T>(url, body);
  return res.data;
};

export const apiPut = async <T>(
  url: string,
  body: Record<string, any>
): Promise<T> => {
  const res = await client.put<T>(url, body);
  return res.data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const res = await client.delete<T>(url);
  return res.data;
};

export default client;
