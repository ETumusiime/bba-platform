export function saveToken(token) {
  try {
    localStorage.setItem("bba_token", token);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem("bba_token");
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("bba_token");
  } catch {}
}

export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}