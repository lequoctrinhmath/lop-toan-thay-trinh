const fs = require('fs');
const path = require('path');

const examData = {
  "id": "toan-7-tam-giac",
  "grade": 7,
  "gradeName": "Khối 7",
  "title": "Đề ôn tập Tổng ba góc & Hai tam giác bằng nhau – Toán 7",
  "description": "Bộ đề ôn HK1: Đầy đủ 3 phần chuẩn format mới (Trắc nghiệm 4 lựa chọn, Trắc nghiệm Đúng/Sai, Trả lời ngắn) kèm hình vẽ & lời giải chi tiết",
  "questions": [
    // PHẦN I: Trắc nghiệm 4 lựa chọn (Câu 1 - 12)
    {
      "n": 1,
      "type": "mc",
      "q": "Tổng ba góc trong một tam giác bằng:",
      "svg": "",
      "opts": ["$90^\\circ$", "$100^\\circ$", "$120^\\circ$", "$180^\\circ$"],
      "a": "D",
      "why": "Theo định lí tổng ba góc trong một tam giác: Trong một tam giác, tổng số đo ba góc luôn bằng $180^\\circ$."
    },
    {
      "n": 2,
      "type": "mc",
      "q": "Cho tam giác $ABC$, khi đó tổng $\\widehat{A} + \\widehat{B} + \\widehat{C}$ bằng:",
      "svg": "",
      "opts": ["$60^\\circ$", "$90^\\circ$", "$120^\\circ$", "$180^\\circ$"],
      "a": "D",
      "why": "Tổng ba góc của tam giác $ABC$ luôn là $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ$."
    },
    {
      "n": 3,
      "type": "mc",
      "q": "Cho tam giác $ABC$ vuông tại $A$. Khi đó:",
      "svg": "",
      "opts": [
        "$\\widehat{B} + \\widehat{C} = 90^\\circ$",
        "$\\widehat{B} + \\widehat{C} = 180^\\circ$",
        "$\\widehat{B} + \\widehat{C} = 100^\\circ$",
        "$\\widehat{B} + \\widehat{C} = 60^\\circ$"
      ],
      "a": "A",
      "why": "Trong tam giác vuông, hai góc nhọn phụ nhau: $\\widehat{B} + \\widehat{C} = 180^\\circ - \\widehat{A} = 180^\\circ - 90^\\circ = 90^\\circ$."
    },
    {
      "n": 4,
      "type": "mc",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} + \\widehat{C} = 90^\\circ$. Khi đó $\\triangle ABC$ là:",
      "svg": "",
      "opts": [
        "Tam giác vuông tại $A$",
        "Tam giác vuông tại $B$",
        "Tam giác nhọn",
        "Tam giác tù"
      ],
      "a": "B",
      "why": "Ta có $\\widehat{B} = 180^\\circ - (\\widehat{A} + \\widehat{C}) = 180^\\circ - 90^\\circ = 90^\\circ$. Vậy $\\triangle ABC$ vuông tại $B$."
    },
    {
      "n": 5,
      "type": "mc",
      "q": "Cho hình vẽ bên dưới. Số đo góc $x$ là:",
      "svg": `<svg viewBox="0 0 240 160" width="240" height="160" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans',sans-serif;">
  <polygon points="120,30 40,130 200,130" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <!-- Top angle arc 82 deg -->
  <path d="M 106 48 A 20 20 0 0 0 134 48" fill="none" stroke="#dc2626" stroke-width="1.5"/>
  <text x="110" y="68" font-size="11" font-weight="bold" fill="#dc2626">82°</text>
  <!-- Labels -->
  <text x="116" y="22" font-size="13" font-weight="bold" fill="#0f172a">A</text>
  <text x="24" y="136" font-size="13" font-weight="bold" fill="#0f172a">B</text>
  <text x="206" y="136" font-size="13" font-weight="bold" fill="#0f172a">C</text>
  <text x="60" y="124" font-size="12" font-weight="bold" fill="#2563eb">x</text>
  <text x="175" y="124" font-size="12" font-weight="bold" fill="#2563eb">x</text>
</svg>`,
      "opts": ["$98^\\circ$", "$49^\\circ$", "$54^\\circ$", "$44^\\circ$"],
      "a": "B",
      "why": "Tổng ba góc của tam giác bằng $180^\\circ \\Rightarrow 82^\\circ + x + x = 180^\\circ \\Rightarrow 2x = 98^\\circ \\Rightarrow x = 49^\\circ$."
    },
    {
      "n": 6,
      "type": "mc",
      "q": "Cho hình vẽ bên dưới. Số đo góc ngoài $x$ bằng:",
      "svg": `<svg viewBox="0 0 260 160" width="260" height="160" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans',sans-serif;">
  <!-- Triangle ABC right at A -->
  <polygon points="110,40 40,120 180,120" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <!-- Extended ray BC -->
  <line x1="180" y1="120" x2="240" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- Right angle at A -->
  <polyline points="100,51 111,61 121,50" fill="none" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Angle B = 50 deg -->
  <text x="56" y="114" font-size="11" font-weight="bold" fill="#2563eb">50°</text>
  <!-- Exterior angle x at C -->
  <path d="M 195 120 A 15 15 0 0 0 170 108" fill="none" stroke="#dc2626" stroke-width="1.5"/>
  <text x="195" y="112" font-size="12" font-weight="bold" fill="#dc2626">x</text>
  <!-- Labels -->
  <text x="108" y="28" font-size="13" font-weight="bold" fill="#0f172a">A</text>
  <text x="24" y="126" font-size="13" font-weight="bold" fill="#0f172a">B</text>
  <text x="174" y="138" font-size="13" font-weight="bold" fill="#0f172a">C</text>
</svg>`,
      "opts": ["$90^\\circ$", "$100^\\circ$", "$120^\\circ$", "$140^\\circ$"],
      "a": "D",
      "why": "Góc ngoài tại đỉnh $C$ bằng tổng hai góc trong không kề với nó: $x = \\widehat{A} + \\widehat{B} = 90^\\circ + 50^\\circ = 140^\\circ$."
    },
    {
      "n": 7,
      "type": "mc",
      "q": "Cho $\\triangle ABC$ có 3 góc bằng nhau. Số đo mỗi góc là:",
      "svg": "",
      "opts": ["$30^\\circ$", "$40^\\circ$", "$50^\\circ$", "$60^\\circ$"],
      "a": "D",
      "why": "Vì ba góc bằng nhau và có tổng bằng $180^\\circ$ nên số đo mỗi góc là: $\\frac{180^\\circ}{3} = 60^\\circ$."
    },
    {
      "n": 8,
      "type": "mc",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 100^\\circ$, $\\widehat{B} - \\widehat{C} = 40^\\circ$. Số đo góc $\\widehat{B}$ và $\\widehat{C}$ lần lượt là:",
      "svg": "",
      "opts": [
        "$\\widehat{B} = 60^\\circ, \\widehat{C} = 20^\\circ$",
        "$\\widehat{B} = 20^\\circ, \\widehat{C} = 60^\\circ$",
        "$\\widehat{B} = 70^\\circ, \\widehat{C} = 20^\\circ$",
        "$\\widehat{B} = 80^\\circ, \\widehat{C} = 30^\\circ$"
      ],
      "a": "A",
      "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - \\widehat{A} = 180^\\circ - 100^\\circ = 80^\\circ$. Kết hợp $\\widehat{B} - \\widehat{C} = 40^\\circ \\Rightarrow \\widehat{B} = \\frac{80^\\circ + 40^\\circ}{2} = 60^\\circ$ và $\\widehat{C} = 80^\\circ - 60^\\circ = 20^\\circ$."
    },
    {
      "n": 9,
      "type": "mc",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 60^\\circ$, $\\widehat{B} = \\frac{1}{3}\\widehat{C}$. Số đo góc $B$ là:",
      "svg": "",
      "opts": ["$90^\\circ$", "$60^\\circ$", "$40^\\circ$", "$30^\\circ$"],
      "a": "D",
      "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - 60^\\circ = 120^\\circ$. Do $\\widehat{C} = 3\\widehat{B}$ nên $\\widehat{B} + 3\\widehat{B} = 120^\\circ \\Rightarrow 4\\widehat{B} = 120^\\circ \\Rightarrow \\widehat{B} = 30^\\circ$."
    },
    {
      "n": 10,
      "type": "mc",
      "q": "Cho hình vẽ bên dưới. Số đo góc $x$ bằng:",
      "svg": `<svg viewBox="0 0 240 200" width="240" height="200" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans',sans-serif;">
  <!-- Triangle ABC -->
  <polygon points="120,25 30,170 210,170" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
  <!-- Altitude BE: B(30,170) to E on AC -->
  <line x1="30" y1="170" x2="165" y2="97" stroke="#2563eb" stroke-width="1.5"/>
  <!-- Altitude CF: C(210,170) to F on AB -->
  <line x1="210" y1="170" x2="75" y2="97" stroke="#2563eb" stroke-width="1.5"/>
  <!-- Right angle marks -->
  <rect x="156" y="93" width="8" height="8" fill="none" stroke="#2563eb" transform="rotate(-30 156 93)"/>
  <rect x="75" y="93" width="8" height="8" fill="none" stroke="#2563eb" transform="rotate(30 75 93)"/>
  <!-- Angle A = 60 deg -->
  <text x="114" y="55" font-size="11" font-weight="bold" fill="#dc2626">60°</text>
  <!-- Intersection I and angle x -->
  <circle cx="120" cy="120" r="3" fill="#dc2626"/>
  <text x="122" y="112" font-size="11" font-weight="bold" fill="#dc2626">x</text>
  <text x="116" y="136" font-size="11" fill="#475569">I</text>
  <!-- Labels -->
  <text x="116" y="18" font-size="13" font-weight="bold" fill="#0f172a">A</text>
  <text x="16" y="180" font-size="13" font-weight="bold" fill="#0f172a">B</text>
  <text x="216" y="180" font-size="13" font-weight="bold" fill="#0f172a">C</text>
  <text x="172" y="96" font-size="12" font-weight="bold" fill="#2563eb">E</text>
  <text x="58" y="96" font-size="12" font-weight="bold" fill="#2563eb">F</text>
</svg>`,
      "opts": ["$40^\\circ$", "$50^\\circ$", "$60^\\circ$", "$70^\\circ$"],
      "a": "C",
      "why": "Trong tứ giác $AEIF$, tổng 4 góc bằng $360^\\circ \\Rightarrow \\widehat{FIE} = 360^\\circ - (60^\\circ + 90^\\circ + 90^\\circ) = 120^\\circ$. Góc $x$ kề bù với $\\widehat{FIE}$ nên $x = 180^\\circ - 120^\\circ = 60^\\circ$."
    },
    {
      "n": 11,
      "type": "mc",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 30^\\circ$, $\\widehat{B} - \\widehat{C} = 30^\\circ$. Tam giác $ABC$ là:",
      "svg": "",
      "opts": [
        "Tam giác vuông tại $B$",
        "Tam giác vuông tại $C$",
        "Tam giác nhọn",
        "Tam giác tù"
      ],
      "a": "A",
      "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - 30^\\circ = 150^\\circ$. Vì $\\widehat{B} - \\widehat{C} = 30^\\circ$ nên $\\widehat{B} = \\frac{150^\\circ + 30^\\circ}{2} = 90^\\circ$. Do đó tam giác $ABC$ vuông tại $B$."
    },
    {
      "n": 12,
      "type": "mc",
      "q": "Cho tam giác $ABC$ vuông tại $A$, tia phân giác góc $B$ cắt $AC$ tại $D$. Biết $\\widehat{ABC} = 60^\\circ$. Số đo góc $\\widehat{BDC}$ là:",
      "svg": "",
      "opts": ["$100^\\circ$", "$120^\\circ$", "$160^\\circ$", "$90^\\circ$"],
      "a": "B",
      "why": "Vì $BD$ là phân giác của $\\widehat{ABC} = 60^\\circ$ nên $\\widehat{ABD} = 30^\\circ$. Trong tam giác vuông $ABD$ có $\\widehat{ADB} = 90^\\circ - 30^\\circ = 60^\\circ$. Suy ra $\\widehat{BDC} = 180^\\circ - 60^\\circ = 120^\\circ$."
    },

    // PHẦN II: Trắc nghiệm Đúng / Sai (Câu 13, 14)
    {
      "n": 13,
      "type": "tf",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 90^\\circ$, $\\widehat{C} = 50^\\circ$. Tia phân giác của góc $B$ cắt $AC$ tại $D$ (như hình vẽ bên dưới). Các khẳng định sau là Đúng hay Sai?",
      "svg": `<svg viewBox="0 0 240 160" width="240" height="160" xmlns="http://www.w3.org/2000/svg" style="font-family:'Plus Jakarta Sans',sans-serif;">
  <!-- Triangle ABC: A(110,35), C(40,135), B(195,135) -->
  <polygon points="110,35 40,135 195,135" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
  <!-- Angle bisector BD: from B(195,135) to D on AC -->
  <line x1="195" y1="135" x2="70" y2="92" stroke="#2563eb" stroke-width="1.5"/>
  <!-- Right angle mark at A -->
  <polyline points="102,46 112,54 120,43" fill="none" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Labels -->
  <text x="108" y="22" font-size="13" font-weight="bold" fill="#0f172a">A</text>
  <text x="24" y="142" font-size="13" font-weight="bold" fill="#0f172a">C</text>
  <text x="202" y="142" font-size="13" font-weight="bold" fill="#0f172a">B</text>
  <text x="56" y="90" font-size="13" font-weight="bold" fill="#2563eb">D</text>
  <text x="102" y="48" font-size="10" fill="#475569">90°</text>
</svg>`,
      "items": [
        {
          "id": "a",
          "text": "$\\widehat{ABC} = 40^\\circ$.",
          "a": "Đ",
          "why": "Tam giác $ABC$ vuông tại $A$ nên $\\widehat{ABC} = 90^\\circ - \\widehat{C} = 90^\\circ - 50^\\circ = 40^\\circ$."
        },
        {
          "id": "b",
          "text": "$\\widehat{ABD} = \\widehat{DBC} = 20^\\circ$.",
          "a": "Đ",
          "why": "Vì $BD$ là tia phân giác của $\\widehat{ABC} = 40^\\circ$ nên $\\widehat{ABD} = \\widehat{DBC} = 20^\\circ$."
        },
        {
          "id": "c",
          "text": "$\\widehat{ADB} < \\widehat{ACB}$.",
          "a": "S",
          "why": "Trong $\\triangle ABD$ vuông tại $A$: $\\widehat{ADB} = 90^\\circ - 20^\\circ = 70^\\circ$, mà $\\widehat{ACB} = 50^\\circ$ nên $\\widehat{ADB} > \\widehat{ACB}$."
        },
        {
          "id": "d",
          "text": "$\\widehat{BDC}$ là góc tù.",
          "a": "Đ",
          "why": "Ta có $\\widehat{BDC} = 180^\\circ - \\widehat{ADB} = 180^\\circ - 70^\\circ = 110^\\circ > 90^\\circ$, do đó $\\widehat{BDC}$ là góc tù."
        }
      ],
      "why": "Xét tam giác vuông $ABC$ có $\\widehat{C} = 50^\\circ \\Rightarrow \\widehat{B} = 40^\\circ$. Tia phân giác chia góc $B$ thành 2 góc $20^\\circ$. Góc $\\widehat{ADB} = 70^\\circ$ và góc $\\widehat{BDC} = 110^\\circ$."
    },
    {
      "n": 14,
      "type": "tf",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 80^\\circ$ và $\\widehat{B} - \\widehat{C} = 20^\\circ$. Gọi $AD$ là phân giác của góc $A$. Các khẳng định sau là Đúng hay Sai?",
      "svg": "",
      "items": [
        {
          "id": "a",
          "text": "$\\widehat{B} = 50^\\circ$.",
          "a": "S",
          "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - 80^\\circ = 100^\\circ$. Vì $\\widehat{B} - \\widehat{C} = 20^\\circ$ nên $\\widehat{B} = \\frac{100^\\circ + 20^\\circ}{2} = 60^\\circ$ (không phải $50^\\circ$)."
        },
        {
          "id": "b",
          "text": "$\\widehat{C} = 40^\\circ$.",
          "a": "Đ",
          "why": "$\\widehat{C} = 100^\\circ - 60^\\circ = 40^\\circ$."
        },
        {
          "id": "c",
          "text": "$\\widehat{BAD} = 40^\\circ$.",
          "a": "Đ",
          "why": "Vì $AD$ là tia phân giác của $\\widehat{A} = 80^\\circ$ nên $\\widehat{BAD} = \\frac{80^\\circ}{2} = 40^\\circ$."
        },
        {
          "id": "d",
          "text": "$\\widehat{ADB} = 90^\\circ$.",
          "a": "S",
          "why": "Trong $\\triangle ABD$: $\\widehat{ADB} = 180^\\circ - (\\widehat{BAD} + \\widehat{B}) = 180^\\circ - (40^\\circ + 60^\\circ) = 80^\\circ \\ne 90^\\circ$."
        }
      ],
      "why": "Tổng $\\widehat{B} + \\widehat{C} = 100^\\circ$ kết hợp $\\widehat{B} - \\widehat{C} = 20^\\circ$ suy ra $\\widehat{B} = 60^\\circ, \\widehat{C} = 40^\\circ$. Tia phân giác $AD$ chia góc $A$ thành 2 góc $40^\\circ$."
    },

    // PHẦN III: Trắc nghiệm Trả lời ngắn (Câu 15 - 18)
    {
      "n": 15,
      "type": "sa",
      "q": "Cho tam giác $ABC$ có $\\widehat{BAC} = 60^\\circ$. Tia phân giác của góc $B$ cắt $AC$ ở $D$. Tia phân giác của góc $C$ cắt $AB$ ở $E$; $BD$ và $CE$ cắt nhau ở $M$. Hỏi số đo của góc $\\widehat{EMD}$ bằng bao nhiêu độ?",
      "unit": "độ",
      "svg": "",
      "a": "120",
      "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - 60^\\circ = 120^\\circ$. Vì $BD, CE$ là phân giác nên $\\widehat{MBC} + \\widehat{MCB} = \\frac{\\widehat{B} + \\widehat{C}}{2} = 60^\\circ$. Trong $\\triangle BMC$: $\\widehat{BMC} = 180^\\circ - 60^\\circ = 120^\\circ$. Vì $\\widehat{EMD}$ và $\\widehat{BMC}$ là hai góc đối đỉnh nên $\\widehat{EMD} = 120^\\circ$."
    },
    {
      "n": 16,
      "type": "sa",
      "q": "Cho $\\triangle ABC$ có $\\widehat{A} = 65^\\circ$ và $\\widehat{B} - \\widehat{C} = 35^\\circ$. Hỏi số đo góc $\\widehat{B}$ bằng bao nhiêu độ?",
      "unit": "độ",
      "svg": "",
      "a": "75",
      "why": "Ta có $\\widehat{B} + \\widehat{C} = 180^\\circ - 65^\\circ = 115^\\circ$. Kết hợp $\\widehat{B} - \\widehat{C} = 35^\\circ$, suy ra: $\\widehat{B} = \\frac{115^\\circ + 35^\\circ}{2} = 75^\\circ$."
    },
    {
      "n": 17,
      "type": "sa",
      "q": "Tam giác đều có ba góc bằng nhau, mỗi góc bằng bao nhiêu độ?",
      "unit": "độ",
      "svg": "",
      "a": "60",
      "why": "Tam giác đều có 3 góc bằng nhau và tổng bằng $180^\\circ$, nên số đo mỗi góc là $\\frac{180^\\circ}{3} = 60^\\circ$."
    },
    {
      "n": 18,
      "type": "sa",
      "q": "Cho $\\triangle ABC$ có số đo các góc $\\widehat{A}, \\widehat{B}, \\widehat{C}$ lần lượt tỉ lệ với $2, 3, 4$. Hỏi số đo góc lớn nhất của tam giác bằng bao nhiêu độ?",
      "unit": "độ",
      "svg": "",
      "a": "80",
      "why": "Theo tính chất dãy tỉ số bằng nhau: $\\frac{\\widehat{A}}{2} = \\frac{\\widehat{B}}{3} = \\frac{\\widehat{C}}{4} = \\frac{\\widehat{A} + \\widehat{B} + \\widehat{C}}{2 + 3 + 4} = \\frac{180^\\circ}{9} = 20^\\circ$. Góc lớn nhất là $\\widehat{C} = 4 \\times 20^\\circ = 80^\\circ$."
    }
  ]
};

const examDir = path.join(__dirname, 'pdf-quiz', 'exams');
if (!fs.existsSync(examDir)) fs.mkdirSync(examDir, { recursive: true });

const filePath1 = path.join(examDir, 'toan-7-tam-giac.json');
const filePath2 = path.join(__dirname, 'pdf-quiz', 'toan-7-tam-giac.json');

fs.writeFileSync(filePath1, JSON.stringify(examData, null, 2), 'utf-8');
fs.writeFileSync(filePath2, JSON.stringify(examData, null, 2), 'utf-8');

console.log('Exam toan-7-tam-giac created successfully!');
console.log('Total questions:', examData.questions.length);
