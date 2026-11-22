import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { once } from 'node:events';

export class ProxySeedingDto {
  @ApiPropertyOptional({
    description:
      'SOCKS5 proxy URL (vd: socks5h://user:password@host:port hoặc socks5://host:port). Nếu bỏ trống sẽ lấy từ cấu hình môi trường (HOMEPX_* hoặc PROXY_SEEDING_PROXY).',
    example: 'socks5h://elenaharr289:mdu0nja4mta4@180.93.1.107:1080',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  proxy?: string;

  @ApiPropertyOptional({
    description:
      'URL cần kiểm tra chuyển hướng (redirect) qua proxy. Mặc định là link rút gọn affiliate cấu hình trong PROXY_SEEDING_URL hoặc https://shorten.asia/fyscDRRV.',
    example: 'https://shorten.asia/fyscDRRV',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;
}

export interface ProxyLocationInfo {
  success: boolean;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  details?: string;
  message?: string;
}

export interface DeviceInfo {
  name: string;
  category: string;
  ua: string;
}

export interface ProxySeedingResult {
  success: boolean;
  status: number;
  targetUrl: string;
  finalUrl: string;
  redirectUrl: string;
  proxyLocation: ProxyLocationInfo | null;
  device?: DeviceInfo;
  referer?: string;
  meta: {
    effectiveUrl: string;
    redirectType: 'x-redirect-url' | 'meta-refresh' | 'http-location' | 'direct';
    totalRedirects: number;
  };
  timestamp: string;
}

export const DEVICES = [
  // 1. Facebook In-App (~27.6%) - Thống kê click thực tế
  {
    name: 'Facebook In-App (iPhone iOS 18)',
    category: 'Facebook',
    weight: 14,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0.0.45.109;FBBV/654321000;FBDV/iPhone16,1;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBCR/Viettel;FBID/phone;FBLC/vi_VN;FBOP/5]',
    refererGenerator: (t: string) =>
      `https://l.facebook.com/l.php?u=${encodeURIComponent(t)}&h=AT${Math.random().toString(36).slice(2, 10)}`,
  },
  {
    name: 'Facebook In-App (Android Samsung S24)',
    category: 'Facebook',
    weight: 14,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.63.82;]',
    refererGenerator: () =>
      Math.random() < 0.5 ? 'https://m.facebook.com/' : 'https://www.facebook.com/',
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
    refererGenerator: () =>
      Math.random() < 0.6 ? 'https://www.google.com.vn/' : 'https://www.google.com/',
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
    refererGenerator: () =>
      Math.random() < 0.5 ? 'https://www.google.com.vn/' : null,
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
    refererGenerator: () =>
      Math.random() < 0.5 ? 'https://www.google.com/' : null,
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

  // 7. FacebookBot (~3.9%)
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
    refererGenerator: () =>
      'https://coccoc.com/search?query=ila+tieng+anh+cho+be',
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

export const ACCEPT_LANGUAGES = [
  'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
  'vi-VN,vi;q=0.9',
  'vi,en-US;q=0.9,en;q=0.8',
  'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
];

@Injectable()
export class ProxySeedingService {
  private readonly logger = new Logger(ProxySeedingService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Kiểm tra proxy và chuyển hướng URL:
   * 1. Tra cứu vị trí IP đầu ra của proxy qua ipwho.is
   * 2. Gửi request qua proxy với giả lập trình duyệt, lấy URL cuối cùng sau redirect
   */
  async check(input: ProxySeedingDto = {}): Promise<ProxySeedingResult> {
    const curlConfig = this.resolveProxyCurlConfig(input.proxy);
    const targetUrl = this.resolveTargetUrl(input.url);

    // 1. Kiểm tra vị trí proxy
    const proxyLocation = await this.getProxyLocation(curlConfig);

    // 2. Kiểm tra chuỗi chuyển hướng
    const redirectResult = await this.checkUrlRedirect(curlConfig, targetUrl);

    return {
      success: redirectResult.success,
      status: redirectResult.status,
      targetUrl,
      finalUrl: redirectResult.finalUrl,
      redirectUrl: redirectResult.finalUrl,
      proxyLocation,
      device: redirectResult.device,
      referer: redirectResult.referer,
      meta: redirectResult.meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tạo curl configuration cho SOCKS5 proxy
   */
  private resolveProxyCurlConfig(customProxy?: string): string {
    let proxyStr = customProxy?.trim();

    if (!proxyStr) {
      // Thử đọc từ PROXY_SEEDING_PROXY hoặc HOMEPX_*
      const envProxy = this.config.get<string>('PROXY_SEEDING_PROXY');
      if (envProxy) {
        proxyStr = envProxy.trim();
      } else {
        const server = this.config.get<string>('HOMEPX_SOCKS5_SERVER');
        const user = this.config.get<string>('HOMEPX_SOCKS5_USER');
        const pass = this.config.get<string>('HOMEPX_SOCKS5_PASSWORD');
        if (server && user && pass) {
          return [
            `proxy = ${JSON.stringify(`socks5h://${server}`)}`,
            `proxy-user = ${JSON.stringify(`${user}:${pass}`)}`,
          ].join('\n');
        }
      }
    }

    if (!proxyStr) {
      throw new ServiceUnavailableException(
        'SOCKS5 proxy is not configured (missing proxy parameter or HOMEPX_* / PROXY_SEEDING_PROXY env variables)',
      );
    }

    // Đảm bảo định dạng scheme socks5 / socks5h
    if (!proxyStr.includes('://')) {
      proxyStr = `socks5h://${proxyStr}`;
    }

    const parsed = URL.canParse(proxyStr) ? new URL(proxyStr) : null;
    if (!parsed || !['socks5:', 'socks5h:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new BadRequestException(
        'Invalid proxy URL. Supported protocols: socks5:// or socks5h://',
      );
    }

    const lines: string[] = [
      `proxy = ${JSON.stringify(`${parsed.protocol}//${parsed.host}`)}`,
    ];
    if (parsed.username || parsed.password) {
      const u = decodeURIComponent(parsed.username || '');
      const p = decodeURIComponent(parsed.password || '');
      lines.push(`proxy-user = ${JSON.stringify(`${u}:${p}`)}`);
    }

    return lines.join('\n');
  }

  /**
   * Xác định URL đích cần kiểm tra
   */
  private resolveTargetUrl(customUrl?: string): string {
    const rawUrl =
      customUrl?.trim() ||
      this.config.get<string>('PROXY_SEEDING_URL') ||
      'https://shorten.asia/fyscDRRV';

    const parsed = URL.canParse(rawUrl) ? new URL(rawUrl) : null;
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new BadRequestException('Invalid target URL. Must be http or https.');
    }

    // Chống SSRF vào mạng nội bộ loopback / private IP cơ bản nếu truyền custom
    if (
      ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname) ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.startsWith('172.16.')
    ) {
      throw new BadRequestException('Internal/private destinations are not allowed.');
    }

    return parsed.href;
  }

  /**
   * Tra cứu vị trí IP đầu ra của proxy thông qua ipwho.is
   */
  private async getProxyLocation(curlConfig: string): Promise<ProxyLocationInfo | null> {
    const { code, output } = await this.executeCurl(
      curlConfig,
      'https://ipwho.is/?fields=success,message,ip,city,region,country,country_code',
      ['--fail', '--connect-timeout', '8', '--max-time', '15'],
    );

    if (code === 0 && output) {
      try {
        const json = JSON.parse(output);
        if (json.success) {
          const details = [json.city, json.country].filter(Boolean).join(', ');
          return {
            success: true,
            ip: json.ip,
            city: json.city,
            region: json.region,
            country: json.country,
            countryCode: json.country_code,
            details: details || 'không rõ',
          };
        }
        return {
          success: false,
          message: json.message || 'Không tra cứu được thông tin IP',
        };
      } catch {
        this.logger.warn(`Failed to parse ipwho.is response: ${output}`);
      }
    }

    return {
      success: false,
      message: `Tra cứu vị trí proxy không thành công (curl code ${code})`,
    };
  }

  /**
   * Thực hiện request qua proxy, giả lập thiết bị thật và trích xuất URL sau redirect
   */
  private async checkUrlRedirect(curlConfig: string, targetUrl: string) {
    const device = this.getRandomDevice();
    const { headers, referer } = this.buildCurlHeaders(device, targetUrl);

    const { code, output } = await this.executeCurl(
      curlConfig,
      targetUrl,
      [
        '-L',
        '-D', '-',
        '--connect-timeout', '10',
        '--max-time', '30',
        ...headers,
        '-w', '\n---META---\n%{http_code}\n%{url_effective}',
      ],
    );

    if (code !== 0 && !output) {
      throw new BadGatewayException(`Proxy connection failed (curl exit code ${code})`);
    }

    const [content, meta] = (output || '').split('\n---META---\n');
    const [statusCodeStr, effectiveUrl] = (meta || '').trim().split('\n');
    const status = Number(statusCodeStr) || 200;

    // 1. Header x-redirect-url (AccessTrade, deep_link, ad-networks)
    const headerMatch = content.match(/x-redirect-url:\s*([^\r\n]+)/i);

    // 2. Thẻ HTML meta refresh
    const metaMatch = content.match(
      /<meta[^>]*http-equiv=['"]?refresh['"]?[^>]*content=['"][^'"]*url=([^'" >]+)/i,
    );

    // 3. Location headers trong chuỗi chuyển hướng
    const locationMatches = [...content.matchAll(/location:\s*([^\r\n]+)/gi)].map(
      (m) => m[1].trim(),
    );
    const finalLocation = locationMatches
      .filter((u) => u.includes('aff_sid') || !u.includes('shorten.asia'))
      .pop();

    let finalUrl =
      headerMatch?.[1]?.trim() ||
      metaMatch?.[1]?.trim() ||
      finalLocation ||
      effectiveUrl ||
      targetUrl;

    // Chuẩn hóa ký tự entity HTML
    finalUrl = finalUrl.replace(/&amp;/g, '&');

    const redirectType = headerMatch
      ? 'x-redirect-url'
      : metaMatch
        ? 'meta-refresh'
        : locationMatches.length > 0
          ? 'http-location'
          : 'direct';

    const isSuccess =
      (status >= 200 && status < 400) ||
      finalUrl.includes('aff_sid') ||
      finalUrl !== targetUrl;

    return {
      success: isSuccess,
      status,
      finalUrl,
      device: {
        name: device.name,
        category: device.category,
        ua: device.ua,
      },
      referer: referer || 'Direct',
      meta: {
        effectiveUrl: effectiveUrl || targetUrl,
        redirectType: redirectType as 'x-redirect-url' | 'meta-refresh' | 'http-location' | 'direct',
        totalRedirects: locationMatches.length,
      },
    };
  }

  /**
   * Chọn thiết bị ngẫu nhiên có trọng số
   */
  private getRandomDevice() {
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

  /**
   * Xây dựng bộ headers HTTP chân thực
   */
  private buildCurlHeaders(device: (typeof DEVICES)[number], target: string) {
    const referer = device.refererGenerator
      ? device.refererGenerator(target)
      : null;
    const lang = ACCEPT_LANGUAGES[randomInt(0, ACCEPT_LANGUAGES.length)];

    const headers: string[] = [
      '-A',
      device.ua,
      '--compressed',
      '-b',
      '', // Bật cookie engine lưu trong RAM cho chuỗi redirect
      '-H',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      '-H',
      `Accept-Language: ${lang}`,
      '-H',
      'Upgrade-Insecure-Requests: 1',
      '-H',
      'Sec-Fetch-Dest: document',
      '-H',
      'Sec-Fetch-Mode: navigate',
      '-H',
      `Sec-Fetch-Site: ${referer ? 'cross-site' : 'none'}`,
      '-H',
      'Sec-Fetch-User: ?1',
      '-H',
      'Priority: u=0, i',
    ];

    if (referer) {
      headers.push('-e', referer);
    }

    if ('secChUa' in device && device.secChUa) {
      headers.push('-H', `sec-ch-ua: ${device.secChUa}`);
    }
    if ('platform' in device && device.platform) {
      headers.push('-H', `sec-ch-ua-platform: ${device.platform}`);
    }
    if ('mobile' in device && device.mobile) {
      headers.push('-H', `sec-ch-ua-mobile: ${device.mobile}`);
    }

    // ~15% người dùng bật Do Not Track
    if (Math.random() < 0.15) {
      headers.push('-H', 'DNT: 1');
    }

    return { headers, referer, lang };
  }

  /**
   * Thực thi curl child_process với cấu hình proxy qua stdin
   */
  private async executeCurl(
    curlConfig: string,
    url: string,
    options: string[],
  ): Promise<{ code: number | null; output: string }> {
    const request = spawn(
      'curl',
      ['-q', '--config', '-', '--silent', '--show-error', '--noproxy', '', ...options, url],
      { stdio: ['pipe', 'pipe', 'ignore'] },
    );

    let output = '';
    request.stdout.setEncoding('utf8');
    request.stdout.on('data', (chunk: string) => {
      output += chunk;
    });

    request.stdin.on('error', () => {});
    const completed = once(request, 'close');
    request.stdin.end(curlConfig + '\n');

    const [code] = await completed;
    return { code: typeof code === 'number' ? code : null, output };
  }
}
