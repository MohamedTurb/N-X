export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function normalizeApiBaseUrl(raw: string) {
  try {
    const parsed = new URL(raw);

    if (parsed.pathname === "/" || parsed.pathname === "") {
      parsed.pathname = "/api";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return raw.replace(/\/$/, "");
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
);

type RequestJsonOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
};

function joinPath(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function toMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof (payload as { message?: unknown }).message === "string") {
      return (payload as { message: string }).message;
    }

    if ("error" in payload && typeof (payload as { error?: unknown }).error === "string") {
      return (payload as { error: string }).error;
    }
  }

  if (status === 401) {
    return "Unauthorized";
  }

  if (status === 403) {
    return "Forbidden";
  }

  return "Request failed";
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const cache = options.cache ?? "no-store";
  const bodyIsFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(joinPath(path), {
    method,
    headers: {
      ...(options.body !== undefined && !bodyIsFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
    body:
      options.body === undefined
        ? undefined
        : bodyIsFormData
          ? (options.body as BodyInit)
          : JSON.stringify(options.body),
    signal: options.signal,
    cache,
    credentials: options.credentials ?? "include",
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(toMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}