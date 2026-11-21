import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { once } from 'node:events';
import { loadEnvFile } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

for (const envPath of ['./.env', '../.env', '../../.env']) {
  try {
    loadEnvFile(fileURLToPath(new URL(envPath, import.meta.url)));
    break;
  } catch {}
}

const { HOMEPX_SOCKS5_SERVER, HOMEPX_SOCKS5_USER, HOMEPX_SOCKS5_PASSWORD } = process.env;
if (!HOMEPX_SOCKS5_SERVER || !HOMEPX_SOCKS5_USER || !HOMEPX_SOCKS5_PASSWORD) {
  throw new Error('Missing HOMEPX_SOCKS5_SERVER, HOMEPX_SOCKS5_USER or HOMEPX_SOCKS5_PASSWORD');
}

const target = 'https://shorten.asia/fyscDRRV';
const curlConfig = [
  `proxy = ${JSON.stringify(`socks5h://${HOMEPX_SOCKS5_SERVER}`)}`,
  `proxy-user = ${JSON.stringify(`${HOMEPX_SOCKS5_USER}:${HOMEPX_SOCKS5_PASSWORD}`)}`,
].join('\n');

const DEVICES = [
  // 1. Facebook In-App (~27.6%) - Dựa theo thống kê click thực tế
  {
    name: 'Facebook In-App (iPhone iOS 18)',
    category: 'Facebook',
    weight: 14,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0.0.45.109;FBBV/654321000;FBDV/iPhone16,1;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBCR/Viettel;FBID/phone;FBLC/vi_VN;FBOP/5]',
    refererGenerator: (t) => `https://l.facebook.com/l.php?u=${encodeURIComponent(t)}&h=AT${Math.random().toString(36).slice(2, 10)}`,
  },
  {
    name: 'Facebook In-App (Android Samsung S24)',
    category: 'Facebook',
    weight: 14,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.63.82;]',
    refererGenerator: () => Math.random() < 0.5 ? 'https://m.facebook.com/' : 'https://www.facebook.com/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Android"',
    mobile: '?1',
  },

  // 2. Chrome Desktop (~26.3%)
  {
    name: 'Chrome Desktop (Windows 11)',
    category: 'Chrome',
    weight: 18,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    refererGenerator: () => Math.random() < 0.6 ? 'https://www.google.com.vn/' : 'https://www.google.com/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Windows"',
    mobile: '?0',
  },
  {
    name: 'Chrome Desktop (macOS Sonoma)',
    category: 'Chrome',
    weight: 8,
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    refererGenerator: () => 'https://www.google.com/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"macOS"',
    mobile: '?0',
  },

  // 3. Mobile Safari (~10.5%)
  {
    name: 'Mobile Safari (iPhone 16 Pro iOS 18)',
    category: 'Mobile Safari',
    weight: 6,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    refererGenerator: () => Math.random() < 0.5 ? 'https://www.google.com.vn/' : null,
  },
  {
    name: 'Mobile Safari (iPhone 15 iOS 17)',
    category: 'Mobile Safari',
    weight: 5,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
    refererGenerator: () => null,
  },

  // 4. Mobile Safari UI/WKWebView (~5.3%) - In-App browsers như Zalo, TikTok
  {
    name: 'WKWebView - Zalo App (iPhone)',
    category: 'Mobile Safari UI/WKWebView',
    weight: 3,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo/24.11.01',
    refererGenerator: () => 'https://chat.zalo.me/',
  },
  {
    name: 'WKWebView - TikTok App (iPhone)',
    category: 'Mobile Safari UI/WKWebView',
    weight: 2,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_35.5.0',
    refererGenerator: () => 'https://www.tiktok.com/',
  },

  // 5. Safari Desktop (~5.3%)
  {
    name: 'Safari Desktop (macOS Sonoma)',
    category: 'Safari',
    weight: 5,
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    refererGenerator: () => Math.random() < 0.5 ? 'https://www.google.com/' : null,
  },

  // 6. Chrome Mobile Android (~3.9%)
  {
    name: 'Chrome Mobile (Samsung Galaxy S24 Ultra)',
    category: 'Chrome Mobile',
    weight: 2,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36',
    refererGenerator: () => 'https://www.google.com.vn/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Android"',
    mobile: '?1',
  },
  {
    name: 'Chrome Mobile (Google Pixel 8 Pro)',
    category: 'Chrome Mobile',
    weight: 2,
    ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36',
    refererGenerator: () => 'https://www.google.com/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Android"',
    mobile: '?1',
  },

  // 7. FacebookBot (~3.9%) - Crawler xem trước liên kết của Facebook
  {
    name: 'FacebookBot Crawler (Preview Bot)',
    category: 'FacebookBot',
    weight: 4,
    ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    refererGenerator: () => null,
  },

  // 8. Chrome Mobile iOS (~1.3%)
  {
    name: 'Chrome Mobile iOS (iPhone CriOS)',
    category: 'Chrome Mobile iOS',
    weight: 1,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
    refererGenerator: () => 'https://www.google.com.vn/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"iOS"',
    mobile: '?1',
  },

  // 9. Other (~15.8%): Cốc Cốc, Edge, Firefox, iPad, Tablet Android
  {
    name: 'Cốc Cốc Browser (Windows)',
    category: 'Other',
    weight: 4,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 CocCoc/131.0.0',
    refererGenerator: () => 'https://coccoc.com/search?query=ila+tieng+anh+cho+be',
    secChUa: '"CocCoc";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Windows"',
    mobile: '?0',
  },
  {
    name: 'Microsoft Edge (Windows 10)',
    category: 'Other',
    weight: 3,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    refererGenerator: () => 'https://www.bing.com/',
    secChUa: '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Windows"',
    mobile: '?0',
  },
  {
    name: 'Mozilla Firefox (Windows)',
    category: 'Other',
    weight: 3,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    refererGenerator: () => 'https://www.google.com/',
  },
  {
    name: 'iPad Pro (iPadOS Safari)',
    category: 'Other',
    weight: 3,
    ua: 'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    refererGenerator: () => null,
  },
  {
    name: 'Tablet Android - Samsung Tab S9 (Chrome)',
    category: 'Other',
    weight: 3,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Safari/537.36',
    refererGenerator: () => 'https://www.google.com.vn/',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    platform: '"Android"',
    mobile: '?0',
  },
];

const ACCEPT_LANGUAGES = [
  'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
  'vi-VN,vi;q=0.9',
  'vi,en-US;q=0.9,en;q=0.8',
  'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
];

function getRandomDevice() {
  const totalWeight = DEVICES.reduce((sum, d) => sum + (d.weight || 1), 0);
  let randomVal = Math.random() * totalWeight;
  for (const device of DEVICES) {
    const weight = device.weight || 1;
    if (randomVal < weight) {
      return device;
    }
    randomVal -= weight;
  }
  return DEVICES[0];
}

function buildCurlHeaders(device) {
  const referer = device.refererGenerator ? device.refererGenerator(target) : (device.referer || null);
  const lang = ACCEPT_LANGUAGES[randomInt(0, ACCEPT_LANGUAGES.length)];

  const headers = [
    '-A', device.ua,
    '--compressed',
    '-b', '', // Kích hoạt cookie engine lưu trong RAM xuyên suốt chuỗi redirect
    '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    '-H', `Accept-Language: ${lang}`,
    '-H', 'Upgrade-Insecure-Requests: 1',
    '-H', 'Sec-Fetch-Dest: document',
    '-H', 'Sec-Fetch-Mode: navigate',
    '-H', `Sec-Fetch-Site: ${referer ? 'cross-site' : 'none'}`,
    '-H', 'Sec-Fetch-User: ?1',
    '-H', 'Priority: u=0, i',
  ];

  if (referer) {
    headers.push('-e', referer);
  }

  // Client Hints chỉ gắn cho các trình duyệt Chromium thật sự
  if (device.secChUa) {
    headers.push('-H', `sec-ch-ua: ${device.secChUa}`);
  }
  if (device.platform) {
    headers.push('-H', `sec-ch-ua-platform: ${device.platform}`);
  }
  if (device.mobile) {
    headers.push('-H', `sec-ch-ua-mobile: ${device.mobile}`);
  }

  // ~15% xác suất người dùng bật DNT (Do Not Track)
  if (Math.random() < 0.15) {
    headers.push('-H', 'DNT: 1');
  }

  return { headers, referer, lang };
}

async function requestThroughProxy(url, options) {
  const request = spawn('curl', [
    '-q', '--config', '-', '--silent', '--show-error',
    '--connect-timeout', '8', '--max-time', '20',
    '--noproxy', '', ...options, url,
  ], { stdio: ['pipe', 'pipe', 'ignore'] });

  let output = '';
  request.stdout.setEncoding('utf8');
  request.stdout.on('data', (chunk) => { output += chunk; });
  request.stdin.on('error', () => { });
  const completed = once(request, 'close');
  request.stdin.end(curlConfig + '\n');

  const [code] = await completed;
  return { code, output };
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function logProxyLocation() {
  const { code, output } = await requestThroughProxy(
    'https://ipwho.is/?fields=success,ip,city,country',
    ['--fail'],
  );

  if (code === 0) {
    try {
      const location = JSON.parse(output);
      if (location.success) {
        const details = [location.city, location.country].filter(Boolean).join(', ');
        log(`IP đầu ra: ${location.ip} | Vị trí ước tính: ${details || 'không rõ'}`);
        return;
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }

  log('Không tra được vị trí IP đầu ra');
}

async function checkPage() {
  await logProxyLocation();

  const device = getRandomDevice();
  const { headers, referer, lang } = buildCurlHeaders(device);

  log(`Thiết bị giả lập: [${device.category}] ${device.name}`);
  log(`Nguồn đến (Referer): ${referer || 'Trực tiếp (Direct)'} | Ngôn ngữ: ${lang.split(',')[0]}`);

  // Thêm độ trễ phản xạ tự nhiên (human reaction delay) trước khi click
  const preDelay = randomInt(400, 1200);
  await setTimeout(preDelay);

  const { code, output } = await requestThroughProxy(target, [
    '-L',
    '-D', '-',
    ...headers,
    '-w', '\n---META---\n%{http_code}\n%{url_effective}',
  ]);

  if (code !== 0) {
    log(`HomeProxy: lỗi kết nối (curl ${code})`);
    return false;
  }

  const [content, meta] = output.split('\n---META---\n');
  const [status, effectiveUrl] = (meta || '').trim().split('\n');

  // Kiểm tra header x-redirect-url, meta refresh hoặc Location header trong chuỗi
  const headerMatch = content.match(/x-redirect-url:\s*([^\r\n]+)/i);
  const metaMatch = content.match(/<meta[^>]*http-equiv=['"]?refresh['"]?[^>]*content=['"][^'"]*url=([^'" >]+)/i);
  const locationMatches = [...content.matchAll(/location:\s*([^\r\n]+)/gi)].map(m => m[1].trim());
  const finalLocation = locationMatches.filter(u => u.includes('ila.edu.vn')).pop();

  const finalUrl = headerMatch?.[1]?.trim() || metaMatch?.[1]?.trim() || finalLocation || effectiveUrl || target;

  log(`HomeProxy: HTTP ${status} | URL cuối: ${finalUrl}`);
  return (Number(status) >= 200 && Number(status) < 400) || finalUrl.includes('aff_sid') || finalUrl.includes('ila.edu.vn');
}

if (process.argv.includes('--once')) {
  process.exitCode = await checkPage() ? 0 : 1;
} else {
  while (true) {
    await checkPage();
    const delay = randomInt(120, 201);
    console.log(`Next check in ${delay}s`);
    await setTimeout(delay * 1000);
  }
}
