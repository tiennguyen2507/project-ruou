export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
}

export const articlesData: Article[] = [
  {
    id: "art-1",
    slug: "huong-vi-ruou-vang-chile-carmenere-va-nghe-thuat-thuong-thuc",
    title: "Khám Phá Hương Vị Rượu Vang Chile Carmenere - Giống Nho Huyền Thoại Tái Sinh",
    excerpt: "Carmenere từng bị tưởng là đã tuyệt chủng sau đại dịch Phylloxera tại châu Âu, cho đến khi được tìm thấy tại Chile và trở thành quốc hồn quốc túy của xứ sở Nam Mỹ.",
    category: "Kiến thức vang",
    author: "Sommelier Huy Phong",
    date: "15/10/2026",
    readTime: "6 phút đọc",
    image: "/images/articles/carmenere-guide.jpg",
    content: [
      "Carmenere là một trong những giống nho đỏ cổ điển nhất có nguồn gốc từ vùng Médoc, Bordeaux của Pháp. Tuy nhiên, trận dịch rệp rễ nho Phylloxera vào giữa thế kỷ 19 đã gần như xóa sổ hoàn toàn giống nho này trên khắp châu Âu.",
      "Thật kỳ diệu, vào năm 1994, nhà nghiên cứu nho học người Pháp Jean-Michel Boursiquot đã phát hiện ra rằng những cây nho tại thung lũng Rapel và Central Valley của Chile — vốn bị nhầm là Merlot trong suốt hơn một thế kỷ — thực chất chính là Carmenere thuần chủng được đưa từ Bordeaux sang từ những năm 1850.",
      "Rượu vang Carmenere mang sắc đỏ ruby đậm ánh tím quyến rũ. Hương thơm bung tỏa với tầng hương của quả mọng đen, mận chín, việt quất xen lẫn hương ớt chuông nướng, tiêu đen, cacao và hương gỗ sồi đầm ấm.",
      "Để thưởng thức trọn vẹn một chai vang Carmenere hảo hạng như Santa Carolina Reserva de Familia hoặc các dòng Icon Wine như LACRUZ, LEYENDA, nhiệt độ lý tưởng nhất là từ 16 đến 18°C. Hãy cho rượu thở trong bình thở Decanter khoảng 30 phút để các phân tử hương được bung tỏa trọn vẹn nhất.",
      "Carmenere kết hợp hoàn hảo cùng các món thịt đỏ nướng như Bò bít tết sốt tiêu đen, sườn cừu nướng hương thảo, thịt heo quay giòn bì hoặc các món ăn đậm đà gia vị truyền thống Việt Nam."
    ]
  },
  {
    id: "art-2",
    slug: "nhiet-do-phuc-vu-ruou-vang-chuan-sommelier",
    title: "Nhiệt Độ Phục Vụ Rượu Vang Chuẩn Quốc Tế Cho Từng Dòng Vang",
    excerpt: "Nhiệt độ là yếu tố quyết định 50% độ ngon của một chai rượu vang. Uống quá lạnh làm co cụm hương vị, uống quá ấm làm bốc mùi cồn gắt.",
    category: "Cẩm nang thưởng vang",
    author: "Chuyên gia thử nếm",
    date: "28/09/2026",
    readTime: "5 phút đọc",
    image: "/images/articles/wine-temp.jpg",
    content: [
      "Rất nhiều người yêu vang tại Việt Nam có thói quen uống vang đỏ ở nhiệt độ phòng (khoảng 26 - 32°C). Đây là sai lầm phổ biến nhất khiến tannin trở nên gắt và mùi cồn lấn át toàn bộ hương hoa quả tinh tế.",
      "Nhiệt độ chuẩn cho từng loại vang:",
      "1. Champagne & Vang sủi (Prosecco, Cava): 6 - 8°C. Giữ lạnh sâu để bọt khí tăm mịn màng và duy trì độ giòn tươi mát.",
      "2. Vang trắng nhẹ & Vang hồng: 8 - 10°C. Làm nổi bật độ chua thanh thoát của chanh, táo xanh và khoáng chất.",
      "3. Vang trắng đậm (Chardonnay ủ gỗ sồi): 10 - 12°C. Giúp cấu trúc ngậy béo bơ vani mở đều.",
      "4. Vang đỏ vừa (Pinot Noir, Sangiovese): 14 - 16°C.",
      "5. Vang đỏ đậm (Cabernet Sauvignon, Carmenere, Syrah, Primitivo): 16 - 18°C. Đảm bảo tannin tròn mượt và hậu vị bền bỉ.",
      "Mẹo nhỏ: Trước khi dùng vang đỏ, hãy ngâm chai rượu vào xô đá khoảng 10-15 phút hoặc để ngăn mát tủ lạnh 30 phút trước khi mở nút bấc."
    ]
  },
  {
    id: "art-3",
    slug: "bang-gia-ruou-vang-nhap-khau-2026-moi-nhat",
    title: "Cập Nhật Bảng Giá Rượu Vang Nhập Khẩu Chính Hãng 2026 Mới Nhất",
    excerpt: "Công ty Cổ phần Huy Phong công bố bảng giá niêm yết chính thức năm 2026 cho hơn 110 dòng vang Pháp, Ý, Chile, Tây Ban Nha, Úc với mức giá đã bao gồm thuế VAT.",
    category: "Tin tức công ty",
    author: "Ban biên tập Vang Huy Phong",
    date: "01/11/2026",
    readTime: "4 phút đọc",
    image: "/images/articles/price-list-2026.jpg",
    content: [
      "Nhằm minh bạch giá cả và hỗ trợ tối đa cho các đối tác bán buôn, đại lý cũng như khách hàng cá nhân, Vang Huy Phong hân hạnh phát hành Báo giá Rượu vang 2026 có hiệu lực đến 31/03/2027.",
      "Toàn bộ mức giá trong bảng báo giá đều là giá đã bao gồm thuế Giá trị gia tăng (VAT) 10%, cam kết xuất hóa đơn điện tử hợp pháp đầy đủ cho mọi đơn hàng.",
      "Đặc biệt trong năm 2026, Huy Phong triển khai chính sách chiết khấu lũy tiến lên đến 15-25% cho các đơn hàng mua theo thùng (thùng 6 chai) và đơn hàng quà Tết doanh nghiệp.",
      "Quý khách có thể xem trực tuyến hoặc tải bản PDF Báo giá 2026 hoàn chỉnh ngay trên website của chúng tôi."
    ]
  }
];

