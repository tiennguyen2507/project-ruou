export interface WineCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  country?: string;
  wineType?: string;
  icon?: string;
  banner?: string;
  count?: number;
}

export const countryCategories = [
  {
    id: "vang-y",
    name: "Rượu Vang Ý",
    slug: "vang-y",
    country: "Ý",
    flag: "🇮🇹",
    code: "it",
    regions: ["Puglia", "Toscana", "Abruzzo", "Marche", "Sicily", "Piemonte", "Valpolicella", "Romagna"],
    description: "Những chai vang Ý thượng hạng từ các giống nho danh tiếng Primitivo, Sangiovese, Negroamaro mang đậm hương vị Địa Trung Hải.",
    image: "/images/categories/country-italy.jpg",
  },
  {
    id: "vang-phap",
    name: "Rượu Vang Pháp",
    slug: "vang-phap",
    country: "Pháp",
    flag: "🇫🇷",
    code: "fr",
    regions: ["Bordeaux", "Saint-Émilion", "Haut-Médoc", "Graves", "Champagne", "Alsace", "Languedoc", "Cahors"],
    description: "Cái nôi của văn hóa rượu vang thế giới với các phân hạng Grand Cru danh giá vùng Bordeaux và Champagne nguyên bản.",
    image: "/images/categories/country-france.jpg",
  },
  {
    id: "vang-chile",
    name: "Rượu Vang Chile",
    slug: "vang-chile",
    country: "Chile",
    flag: "🇨🇱",
    code: "cl",
    regions: ["Central Valley", "Rapel Valley", "Limari Valley", "Maipo Valley"],
    description: "Hương vị nồng nàn, cấu trúc đậm đà với giống nho biểu tượng Carmenere và các dòng Icon Wine đẳng cấp thế giới như OSSA, LEYENDA.",
    image: "/images/categories/country-chile.jpg",
  },
  {
    id: "vang-tay-ban-nha",
    name: "Rượu Vang Tây Ban Nha",
    slug: "vang-tay-ban-nha",
    country: "Tây Ban Nha",
    flag: "🇪🇸",
    code: "es",
    regions: ["La Mancha", "Rioja"],
    description: "Đậm đà, quyến rũ với sự kết hợp tuyệt hảo giữa Tempranillo, Cabernet Franc và Syrah vùng La Mancha.",
    image: "/images/categories/country-spain.jpg",
  },
  {
    id: "vang-uc",
    name: "Rượu Vang Úc",
    slug: "vang-uc",
    country: "Úc",
    flag: "🇦🇺",
    code: "au",
    regions: ["South Eastern", "Barossa Valley"],
    description: "Phong cách vang Tân thế giới mạnh mẽ, cay nồng lôi cuốn của giống nho Shiraz trứ danh nước Úc.",
    image: "/images/categories/country-australia.jpg",
  },
];

export const wineTypeCategories = [
  {
    id: "vang-do",
    name: "Rượu Vang Đỏ",
    slug: "vang-do",
    color: "#8B0000",
    desc: "Vang đỏ thượng hạng từ Cabernet Sauvignon, Merlot, Carmenere, Primitivo...",
  },
  {
    id: "vang-trang",
    name: "Rượu Vang Trắng",
    slug: "vang-trang",
    color: "#E2B653",
    desc: "Vang trắng tươi mát từ Chardonnay, Sauvignon Blanc, Riesling, Pinot Grigio...",
  },
  {
    id: "champagne-vang-sui",
    name: "Champagne & Vang Sủi",
    slug: "champagne-vang-sui",
    color: "#D4AF37",
    desc: "Champagne Grand Cru nước Pháp, Prosecco DOC Ý và vang sủi tăm sảng khoái.",
  },
  {
    id: "vang-ngot",
    name: "Rượu Vang Ngọt",
    slug: "vang-ngot",
    color: "#A8325E",
    desc: "Vang đỏ ngọt & vang trắng ngọt dịu dàng, quyến rũ cho bữa tiệc tráng miệng.",
  },
  {
    id: "vang-khong-con",
    name: "Vang Sủi 0% Không Cồn",
    slug: "vang-khong-con",
    color: "#2E7D32",
    desc: "Vang sủi Flori 0.0% sảng khoái, lành mạnh, an toàn tuyệt đối khi lái xe.",
  },
  {
    id: "cocktail-sparkling",
    name: "Cocktail Sparkling",
    slug: "cocktail-sparkling",
    color: "#E91E63",
    desc: "Hương vị trái cây tự nhiên đào, dâu tây, hoa cơm cháy mát lạnh Il Mio Gusto.",
  },
];

export const grapeVarietals = [
  "Carmenere",
  "Cabernet Sauvignon",
  "Merlot",
  "Primitivo",
  "Sangiovese",
  "Zinfandel",
  "Negroamaro",
  "Syrah / Shiraz",
  "Pinot Noir",
  "Chardonnay",
  "Sauvignon Blanc",
  "Riesling",
  "Montepulciano",
  "Malbec",
  "Petit Verdot",
  "Tempranillo",
];

export const priceRanges = [
  { id: "all", label: "Tất cả mức giá", min: 0, max: 100000000 },
  { id: "under-500k", label: "Dưới 500.000 đ", min: 0, max: 500000 },
  { id: "500k-1m", label: "500.000 đ - 1.000.000 đ", min: 500000, max: 1000000 },
  { id: "1m-2m", label: "1.000.000 đ - 2.000.000 đ", min: 1000000, max: 2000000 },
  { id: "over-2m", label: "Trên 2.000.000 đ (Icon Wine & Grand Cru)", min: 2000000, max: 100000000 },
];

export const alcoholRanges = [
  { id: "all", label: "Tất cả nồng độ" },
  { id: "0", label: "0% (Không cồn)" },
  { id: "light", label: "Dưới 12% (Nhẹ nhàng)" },
  { id: "medium", label: "12% - 13.5% (Cân bằng tiêu chuẩn)" },
  { id: "strong", label: "14% - 14.5% (Đậm đà)" },
  { id: "intense", label: "Từ 15% trở lên (Mạnh mẽ, Full-bodied)" },
];

