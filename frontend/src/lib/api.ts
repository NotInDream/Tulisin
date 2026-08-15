const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}api/v1${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Permintaan gagal (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${BASE_URL}api/v1${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Permintaan gagal (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function assetUrl(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, "")}`;
}
