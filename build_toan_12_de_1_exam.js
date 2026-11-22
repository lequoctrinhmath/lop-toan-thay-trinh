const fs = require('fs');
const path = require('path');

// Helper: load image as base64 data URI
function imgToDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + buf.toString('base64');
}

// Helper: wrap an image dataURI in an <img> tag inside SVG-compatible HTML
function imgTag(filePath, alt, maxW) {
  const uri = imgToDataUri(filePath);
  const w = maxW || 500;
  return `<img src="${uri}" alt="${alt}" style="max-width:${w}px;display:block;margin:8px auto;" />`;
}

const cropsDir = path.join(__dirname, 'crops');

// =========================================================================
// PHẦN I: 12 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN
// =========================================================================
const mcQuestions = [
  {
    n: 1,
    type: 'mc',
    q: 'Cho mẫu số liệu ghép nhóm có tất cả 7 nhóm (được xếp theo thứ tự không giảm) và có độ rộng bằng nhau, biết rằng nhóm đầu tiên của mẫu là $[5; 7)$. Khi đó, nhóm thứ năm là',
    opts: ['$[9; 11)$', '$[13; 15)$', '$[11; 13)$', '$[15; 17)$'],
    ans: 1,
    svg: ''
  },
  {
    n: 2,
    type: 'mc',
    q: 'Một mẫu số liệu ghép nhóm có độ lệch chuẩn là $1{,}35$. Khi đó, phương sai của mẫu số liệu là',
    opts: ['$1{,}8525$', '$1{,}8252$', '$1{,}8225$', '$1{,}8522$'],
    ans: 2,
    svg: ''
  },
  {
    n: 3,
    type: 'mc',
    q: 'Trong không gian $Oxyz$, cho điểm $A(-1; 2; -1)$ và vectơ $\\vec{u} = 2\\vec{i} + \\vec{j} + 3\\vec{k}$. Gọi điểm $A\'$ là hình chiếu của điểm $A$ lên mặt phẳng $(Oxz)$. Tọa độ của điểm $A\'$ là?',
    opts: ['$(-1; 2; 0)$', '$(-1; 0; -1)$', '$(0; -1; 2)$', '$(0; 2; -1)$'],
    ans: 1,
    svg: ''
  },
  {
    n: 4,
    type: 'mc',
    q: 'Tọa độ của vectơ $\\vec{u}$ là?',
    opts: ['$(1; 3; 2)$', '$(2; 1; 3)$', '$(1; 2; 3)$', '$(2; 0; 3)$'],
    ans: 1,
    svg: ''
  },
  {
    n: 5,
    type: 'mc',
    q: 'Tích vô hướng của hai vectơ $\\overrightarrow{AA\'}$ và $\\vec{u}$ bằng?',
    opts: ['$3$', '$-4$', '$-2$', '$0$'],
    ans: 2,
    svg: ''
  },
  {
    n: 6,
    type: 'mc',
    q: 'Hàm số nào dưới đây có hình dạng đồ thị như hình vẽ bên?',
    opts: [
      '$y = \\dfrac{x^2 + x - 3}{x + 1}$',
      '$y = \\dfrac{2x - 1}{x + 1}$',
      '$y = x^3 + 2x^2 - x - 2$',
      '$y = \\dfrac{1 - 2x}{x + 1}$'
    ],
    ans: 3,
    svg: imgTag(path.join(cropsDir, 'cau_6_p1.png'), 'Đồ thị hàm phân thức bậc nhất trên bậc nhất', 300)
  },
  {
    n: 7,
    type: 'mc',
    q: 'Cho hình hộp $ABCD.EFGH$ (tham khảo hình vẽ bên dưới). Tổng các vectơ $\\overrightarrow{GC} + \\overrightarrow{GH} + \\overrightarrow{GF}$ bằng',
    opts: ['$\\overrightarrow{GA}$', '$\\overrightarrow{GE}$', '$\\overrightarrow{GB}$', '$\\overrightarrow{GD}$'],
    ans: 0,
    svg: imgTag(path.join(cropsDir, 'cau_7_p1.png'), 'Hình hộp ABCD.EFGH', 250)
  },
  {
    n: 8,
    type: 'mc',
    q: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như hình bên dưới. Hàm số đã cho có bao nhiêu điểm cực trị?',
    opts: ['$3$', '$2$', '$4$', '$1$'],
    ans: 1,
    svg: imgTag(path.join(cropsDir, 'cau_8_p2.png'), 'Bảng xét dấu đạo hàm: y\' đổi dấu tại x = -1 và x = 1', 500)
  },
  {
    n: 9,
    type: 'mc',
    q: 'Cho hàm số $y = f(x)$ có đồ thị như hình vẽ. Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và nhỏ nhất của hàm số trên đoạn $[-1; 5]$. Khi đó giá trị $M + m$ là?',
    opts: ['$-2$', '$0$', '$-1$', '$2$'],
    ans: 3,
    svg: imgTag(path.join(cropsDir, 'cau_9_p2.png'), 'Đồ thị hàm số trên [-1;5]: max = 4, min = -2', 300)
  },
  {
    n: 10,
    type: 'mc',
    q: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên, mệnh đề nào dưới đây đúng?',
    opts: [
      'Đồ thị hàm số không có đường tiệm cận đứng.',
      'Đồ thị hàm số có tiệm cận đứng là đường thẳng $x = 3$.',
      'Đồ thị hàm số có tiệm cận ngang là đường thẳng $y = 1$.',
      'Đồ thị hàm số có tiệm cận ngang là đường thẳng $y = 3$.'
    ],
    ans: 3,
    svg: imgTag(path.join(cropsDir, 'cau_10_p2.png'), 'Bảng biến thiên: y\' < 0 mọi nơi, TCĐ x=1, TCN y=3', 350)
  },
  {
    n: 11,
    type: 'mc',
    q: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Hàm số $y = f(x)$ nghịch biến trên khoảng nào dưới đây?',
    opts: ['$(-\\infty; 4)$', '$(-1; 1)$', '$(0; +\\infty)$', '$(1; +\\infty)$'],
    ans: 1,
    svg: imgTag(path.join(cropsDir, 'cau_11_p2.png'), 'Bảng biến thiên: y tăng trên (-∞;-1), giảm trên (-1;1), tăng trên (1;+∞)', 500)
  },
  {
    n: 12,
    type: 'mc',
    q: 'Cho hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ ($a \\neq 0$) có đồ thị như hình vẽ. Hỏi đó là hàm số nào dưới đây?',
    opts: [
      '$y = x^3 - 4x^2 + 5x$',
      '$y = -x^3 - 4x^2 + 2$',
      '$y = x^3 - 3x - 2$',
      '$y = -x^3 - 3x - 2$'
    ],
    ans: 2,
    svg: imgTag(path.join(cropsDir, 'cau_12_p2.png'), 'Đồ thị hàm bậc ba: a>0, cắt Oy tại y=-2', 230)
  }
];

// =========================================================================
// PHẦN II: 4 CÂU ĐÚNG SAI (mỗi câu 4 ý)
// =========================================================================
const tfQuestions = [
  {
    n: 13,
    type: 'tf',
    q: 'Anh A và chị B tham gia một phiên giao dịch cổ phiếu vào cuối tuần. Biết rằng, giá của một cổ phiếu (tính bằng euro) trong ngày hôm đó (có 8 giờ giao dịch) được mô tả bởi hàm số: $f(t) = 35{,}7 \\cdot \\dfrac{t + 2}{t^2 + 21}$, $t \\in [0; 8]$, trong đó $t$ là thời gian (tính bằng giờ) kể từ khi phiên giao dịch mở cửa.',
    items: [
      { id: 'a', text: 'Giá cổ phiếu sau khi phiên giao dịch vừa mở cửa là $3{,}4$ euro.', ans: true },
      { id: 'b', text: 'Sau $5$ giờ kể từ khi phiên giao dịch mở cửa thì cổ phiếu có giá cao nhất.', ans: false },
      { id: 'c', text: 'Khi phiên giao dịch vừa mở cửa, anh A đã mua $25$ cổ phiếu và sau $2$ giờ kể từ lúc mua anh A bán. Lợi nhuận anh A thu được là $57{,}8$ euro. (kết quả làm tròn đến hàng phần mười)', ans: true },
      { id: 'd', text: 'Nếu chị B mua $100$ cổ phiếu và bán chúng ngay trong ngày thì lợi nhuận tối đa mà chị B thu được là $255$ euro.', ans: true }
    ],
    svg: ''
  },
  {
    n: 14,
    type: 'tf',
    q: 'Cân nặng (đơn vị: kg) của một số lợn con mới sinh thuộc hai giống $A$ và $B$ được cho ở bảng như dưới đây. (các kết quả làm tròn đến hàng phần trăm)',
    items: [
      { id: 'a', text: 'Tứ phân vị thứ nhất của mẫu số liệu lợn con giống $A$ thuộc $[1{,}1; 1{,}2)$.', ans: true },
      { id: 'b', text: 'Tứ phân vị thứ nhất của mẫu số liệu lợn con giống $B$ là $Q_{1B} = 1{,}18$.', ans: true },
      { id: 'c', text: 'Khoảng biến thiên của mẫu số liệu lợn con giống $B$ là $R_B = 0{,}40$.', ans: false },
      { id: 'd', text: 'Giá trị mốt của mẫu số liệu lợn con giống $A$ là $M_{oA} = 1{,}21$.', ans: false }
    ],
    svg: imgTag(path.join(cropsDir, 'cau_2_p3_table.png'), 'Bảng cân nặng lợn con giống A và B', 500)
  },
  {
    n: 15,
    type: 'tf',
    q: 'Cho hàm số $y = ax^3 + bx^2 + cx + d$ có đồ thị như hình vẽ bên.',
    items: [
      { id: 'a', text: 'Hàm số đã cho có hệ số $a > 0$.', ans: true },
      { id: 'b', text: 'Tâm đối xứng của đồ thị hàm số là điểm $I(2; 0)$.', ans: false },
      { id: 'c', text: 'Giá trị cực tiểu của hàm số là $y = 1$.', ans: false },
      { id: 'd', text: 'Giá trị lớn nhất của hàm số trên đoạn $[-2; 1]$ bằng $4$.', ans: true }
    ],
    svg: imgTag(path.join(cropsDir, 'cau_3_p3_graph.png'), 'Đồ thị hàm bậc ba: CĐ(-1;4), CT(1;0)', 280)
  },
  {
    n: 16,
    type: 'tf',
    q: 'Hai chiếc khinh khí cầu được điều khiển cùng bay lên tại một địa điểm. Sau một thời gian bay, chiếc khinh khí cầu $A$ cách mặt đất $5$ km, cách điểm xuất phát $6$ km về phía Đông và $3$ km về phía Nam. Chiếc khinh khí cầu $B$ cách mặt đất $5$ km, cách điểm xuất phát $2$ km về phía Bắc và $4$ km về phía Tây. Gọi $A\'$ và $B\'$ lần lượt là hình chiếu của khinh khí cầu $A$, $B$ xuống mặt phẳng tọa độ $(Oxy)$. Chọn hệ trục tọa độ $Oxyz$ với gốc $O$ đặt tại điểm xuất phát, $Ox$ hướng về phía Nam, $Oy$ hướng về phía Đông và $Oz$ hướng thẳng đứng lên trời.',
    items: [
      { id: 'a', text: 'Tọa độ của chiếc khinh khí cầu $A$, $B$ lần lượt là $A(6; 3; 5)$ và $B(-2; -4; 5)$.', ans: false },
      { id: 'b', text: 'Khinh khí cầu $A$ cách điểm xuất phát một khoảng cách là $8$ km.', ans: false },
      { id: 'c', text: 'Tọa độ hình chiếu khinh khí cầu $A$, $B$ lần lượt là $A\'(3; 6; 0)$ và $B\'(-2; -4; 0)$.', ans: true },
      { id: 'd', text: 'Trên mặt đất, người ta xác định hai vị trí $E$ và $F$ sao cho $EF = 2$ km. Khi đó, tổng độ dài $AE + EF + FB$ nhỏ nhất là $15{,}58$ km. (kết quả làm tròn đến hàng phần trăm)', ans: false }
    ],
    svg: imgTag(path.join(cropsDir, 'cau_4_p3_balloon.png'), 'Hình minh họa khinh khí cầu và hệ tọa độ Oxyz', 600)
  }
];

// =========================================================================
// PHẦN III: 6 CÂU TRẢ LỜI NGẮN
// =========================================================================
const saQuestions = [
  {
    n: 17,
    type: 'sa',
    q: 'Cho hàm số $y = f(x) = 2x^3 - 3x^2 + x - 1$. Hoành độ điểm uốn của hàm số $f(x)$ là?',
    ans: '0,5',
    unit: '',
    svg: ''
  },
  {
    n: 18,
    type: 'sa',
    q: 'Cho hàm số $y = f(x) = -x + \\dfrac{2}{1 - x}$. Biết rằng đồ thị hàm số nhận điểm $I(a; b)$ là tâm đối xứng. Tính giá trị biểu thức $P = a + b$.',
    ans: '0',
    unit: '',
    svg: ''
  },
  {
    n: 19,
    type: 'sa',
    q: 'Trong không gian $Oxyz$ cho trước (đơn vị đo: ki-lô-mét), một máy bay dân dụng di chuyển với vận tốc và hướng không đổi từ điểm $A(500; 400; 12)$ đến điểm $B(650; 450; 14)$ trong thời gian $10$ phút. Trong $5$ phút tiếp theo, máy bay di chuyển đến điểm $C$ với hướng và vận tốc không đổi so với ban đầu. Máy bay đã di chuyển quãng đường $BC$ là bao nhiêu ki-lô-mét? (làm tròn kết quả đến hàng phần mười)',
    ans: '79,1',
    unit: 'km',
    svg: imgTag(path.join(cropsDir, 'cau_3_p4_plane.png'), 'Máy bay Vietnam Airlines bay từ A qua B đến C', 500)
  },
  {
    n: 20,
    type: 'sa',
    q: 'Thâm niên giảng dạy của một số giáo viên trường THPT $X$ được ghi lại ở bảng sau. Xác định điểm ngưỡng (đơn vị: năm) để đưa ra danh sách $25\\%$ giáo viên có thâm niên cao nhất trong trường. (kết quả làm tròn đến hàng phần mười)',
    ans: '24,1',
    unit: 'năm',
    svg: imgTag(path.join(cropsDir, 'cau_4_p4_table.png'), 'Bảng thâm niên giáo viên: [0;5) 5 người, [5;15) 25, [15;20) 33, [20;30) 29, [30;35) 8, n=100', 600)
  },
  {
    n: 21,
    type: 'sa',
    q: 'Trong không gian $Oxyz$ được thiết lập tại một sân bay, người ta ghi nhận hai máy bay đang bay đến với các vectơ vận tốc $\\vec{u} = (90; -80; -120)$, $\\vec{v} = (60; -50; -60)$. Tính góc giữa hai vectơ vận tốc nói trên. (kết quả làm tròn đến hàng phần mười của độ)',
    ans: '7,5',
    unit: 'độ',
    svg: ''
  },
  {
    n: 22,
    type: 'sa',
    q: 'Để chuẩn bị cho hội chợ "Ý tưởng xanh", bạn Nam dự định làm một chiếc khay trồng rau mầm thủy canh dạng hình chóp cụt đều không có nắp. Từ một tấm vật liệu tái chế hình vuông có cạnh $8$ dm, Nam cắt bỏ bốn phần giống nhau ở bốn góc (biết $D\'E = D\'F = x$ dm, với $0 < x < 2{,}5$), sau đó gấp tạo hình rồi hàn các mép lại để được chiếc khay. Biết đáy khay là hình vuông có cạnh bằng $3$ dm. Hỏi thể tích lớn nhất của chiếc khay bằng bao nhiêu đề-xi-mét? (kết quả làm tròn đến hàng phần mười)',
    ans: '42,3',
    unit: 'dm³',
    svg: imgTag(path.join(cropsDir, 'cau_6_p4_tray.png'), 'Hình khai triển và hình chóp cụt đều của chiếc khay', 600)
  }
];

// =========================================================================
// BUILD EXAM
// =========================================================================
const allQuestions = [...mcQuestions, ...tfQuestions, ...saQuestions];

const exam = {
  id: 'toan-12-ck1-de-tham-khao-1',
  grade: 12,
  gradeName: 'Khối 12',
  title: 'Đề tham khảo Kiểm tra cuối kỳ 1 Toán 12 – Đề số 1 (Mã đề 1234)',
  description: 'Đề tham khảo kiểm tra cuối HK1 Toán 12 năm học 2026–2027 chuẩn cấu trúc 3 phần mới của Bộ GD&ĐT: 12 câu trắc nghiệm nhiều lựa chọn, 4 câu Đúng/Sai và 6 câu Trả lời ngắn kèm hình vẽ & lời giải chi tiết',
  questions: allQuestions.map(q => {
    const base = { n: q.n, type: q.type, q: { q: q.q }, svg: q.svg || '' };

    if (q.type === 'mc') {
      base.q.opts = q.opts;
      base.q.ans = q.ans;
    } else if (q.type === 'tf') {
      base.q.items = q.items.map(it => ({ id: it.id, text: it.text }));
      base.q.ans = {};
      q.items.forEach(it => { base.q.ans[it.id] = it.ans; });
    } else if (q.type === 'sa') {
      base.q.ans = q.ans;
      base.q.unit = q.unit || '';
    }

    return base;
  })
};

// Validate
const mcCount = exam.questions.filter(q => q.type === 'mc').length;
const tfCount = exam.questions.filter(q => q.type === 'tf').length;
const saCount = exam.questions.filter(q => q.type === 'sa').length;

console.log(`Exam ${exam.id} created successfully!`);
console.log(`Total questions: ${exam.questions.length}`);
console.log(`MC: ${mcCount}, TF: ${tfCount}, SA: ${saCount}`);

// Check no raw HTML in q.q or opts (excluding svg field)
let htmlIssues = 0;
exam.questions.forEach(q => {
  if (/<[a-z][\s\S]*>/i.test(q.q.q)) htmlIssues++;
  (q.q.opts || []).forEach(o => { if (/<[a-z][\s\S]*>/i.test(o)) htmlIssues++; });
  (q.q.items || []).forEach(it => { if (/<[a-z][\s\S]*>/i.test(it.text)) htmlIssues++; });
});
console.log(`HTML tags in question text/opts/items: ${htmlIssues}`);

// Write to both locations
const json = JSON.stringify(exam, null, 2);
const examsDir = path.join(__dirname, 'pdf-quiz', 'exams');
if (!fs.existsSync(examsDir)) fs.mkdirSync(examsDir, { recursive: true });

fs.writeFileSync(path.join(examsDir, exam.id + '.json'), json, 'utf8');
fs.writeFileSync(path.join(__dirname, 'pdf-quiz', exam.id + '.json'), json, 'utf8');
console.log(`Written to pdf-quiz/exams/${exam.id}.json`);
console.log(`Written to pdf-quiz/${exam.id}.json`);
console.log(`File size: ${json.length} bytes`);
