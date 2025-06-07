class ApiClient {
  private readonly baseURL: string;

  constructor(
    baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private buildHeaders(
    token: string | null,
    customHeaders?: HeadersInit
  ): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json")
      ? response.json()
      : (response.text() as unknown as T);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers = this.buildHeaders(token, options.headers);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
