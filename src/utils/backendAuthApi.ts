/**
 * Client kết nối tới Node.js / Express Backend Server
 * Tự động quản lý Access Token (15m) và Refresh Token (7d)
 * Tự động gọi /api/auth/refresh khi Access Token hết hạn
 */

const DEFAULT_BACKEND_URL = 'http://localhost:5000';

const ACCESS_TOKEN_KEY = 'formosa_access_token_v1';
const REFRESH_TOKEN_KEY = 'formosa_refresh_token_v1';
const BACKEND_URL_KEY = 'formosa_backend_api_url_v1';

export function getBackendUrl(): string {
  try {
    return localStorage.getItem(BACKEND_URL_KEY) || DEFAULT_BACKEND_URL;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

export function setBackendUrl(url: string) {
  try {
    localStorage.setItem(BACKEND_URL_KEY, url.trim().replace(/\/+$/, ''));
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveTokens(accessToken: string, refreshToken?: string) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // ignore
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Fetch wrapper tự động đính kèm Access Token và tự động refresh token nếu bị 401
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBackendUrl();
  let accessToken = getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // Nếu token hết hạn (401), tự động thử dùng Refresh Token để cấp mới
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await requestNewAccessToken(refreshToken);
      if (refreshed && refreshed.accessToken) {
        saveTokens(refreshed.accessToken);
        // Thử lại request ban đầu với token mới
        headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
        response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearTokens();
      }
    }
  }

  return response;
}

async function requestNewAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
  try {
    const baseUrl = getBackendUrl();
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // offline or error
  }
  return null;
}

/**
 * Đăng ký tài khoản qua Backend Node.js / MySQL
 */
export async function registerWithBackend(
  username: string,
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: boolean; message: string; user?: any }> {
  try {
    const baseUrl = getBackendUrl();
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message || (res.ok ? 'Đăng ký thành công!' : 'Đăng ký thất bại.'),
      user: data.user,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: 'Không thể kết nối tới máy chủ Backend (' + getBackendUrl() + '). Vui lòng kiểm tra xem server Node.js đã chạy chưa.',
    };
  }
}

/**
 * Đăng nhập qua Backend Node.js / MySQL
 */
export async function loginWithBackend(
  loginIdentifier: string,
  password: string
): Promise<{ ok: boolean; message: string; user?: any }> {
  try {
    const baseUrl = getBackendUrl();
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginIdentifier, password }),
    });

    const data = await res.json();
    if (res.ok && data.accessToken) {
      saveTokens(data.accessToken, data.refreshToken);
      return {
        ok: true,
        message: data.message || 'Đăng nhập thành công!',
        user: data.user,
      };
    }

    return {
      ok: false,
      message: data.message || 'Đăng nhập không thành công.',
    };
  } catch (err: any) {
    return {
      ok: false,
      message: 'Không thể kết nối tới máy chủ Backend (' + getBackendUrl() + '). Vui lòng đảm bảo server Node.js đang chạy.',
    };
  }
}

/**
 * Đăng xuất và xóa phiên
 */
export async function logoutFromBackend(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      const baseUrl = getBackendUrl();
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore
    }
  }
  clearTokens();
}

/**
 * Lấy tiến độ học tập từ MySQL qua Protected Endpoint
 */
export async function fetchProgressFromBackend(): Promise<any | null> {
  try {
    const res = await authenticatedFetch('/api/user/progress');
    if (res.ok) {
      const data = await res.json();
      return data.progress;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Lưu tiến độ học tập vào MySQL qua Protected Endpoint
 */
export async function saveProgressToBackend(progressData: any): Promise<boolean> {
  try {
    const res = await authenticatedFetch('/api/user/progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
    return res.ok;
  } catch {
    return false;
  }
}
