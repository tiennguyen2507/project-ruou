/**
 * Chuyển đổi định dạng proxy thô (như HomeProxy: IP:PORT:USER:PASS)
 * sang URL SOCKS5 chuẩn: socks5://USER:PASS@IP:PORT
 */
export function convertRawProxyToSocks5(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  // Nếu đã có protocol (socks5://, socks5h://, http://,...) thì giữ nguyên
  if (/^[a-zA-Z0-9+-]+:\/\//.test(trimmed)) {
    return trimmed;
  }

  // Định dạng USER:PASS@HOST:PORT (thiếu protocol)
  if (trimmed.includes("@")) {
    return `socks5://${trimmed}`;
  }

  const parts = trimmed.split(":");

  // 1. Định dạng phổ biến HomeProxy / ProxyNo1: IP:PORT:USER:PASS
  // Ví dụ: 180.93.2.112:1080:sophiewells642:nzezmduymzawnq==
  if (parts.length >= 4) {
    const maybePort = parts[1].trim();
    // Kiểm tra parts[1] có phải là port số
    if (/^\d+$/.test(maybePort)) {
      const host = parts[0].trim();
      const port = maybePort;
      const user = parts[2].trim();
      const pass = parts.slice(3).join(":").trim();
      if (host && port && user && pass) {
        return `socks5://${user}:${pass}@${host}:${port}`;
      }
    }

    // 2. Định dạng đảo ngược USER:PASS:IP:PORT
    const lastPort = parts[parts.length - 1].trim();
    const lastHost = parts[parts.length - 2].trim();
    if (/^\d+$/.test(lastPort) && (/^[\d.]+$/.test(lastHost) || lastHost.includes("."))) {
      const user = parts[0].trim();
      const pass = parts.slice(1, parts.length - 2).join(":").trim();
      if (user && pass && lastHost && lastPort) {
        return `socks5://${user}:${pass}@${lastHost}:${lastPort}`;
      }
    }
  }

  // 3. Định dạng chỉ có IP:PORT (không user/pass)
  if (parts.length === 2 && /^\d+$/.test(parts[1].trim())) {
    return `socks5://${parts[0].trim()}:${parts[1].trim()}`;
  }

  return trimmed;
}
