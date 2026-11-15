const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'; // đổi bằng: ADMIN_PASS=xxx node server.js
const EXAM = 'exam.json', RESULTS = 'results.json';
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(f)); } catch { return d; } };
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 1));

const { spawn } = require('child_process');
const os = require('os');
const MODEL = process.env.MODEL; // tuỳ chọn, vd: MODEL=haiku

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Nội dung câu hỏi' },
          opts: { type: 'array', items: { type: 'string' }, description: '2-4 đáp án, không kèm chữ A/B/C/D' },
          a: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: 'Đáp án đúng' },
          why: { type: 'string', description: 'Lời giải ngắn gọn: vì sao đáp án đúng là đúng và vì sao các đáp án còn lại sai' }
        },
        required: ['q', 'opts', 'a', 'why']
      }
    }
  },
  required: ['title', 'questions']
};

// Gửi chính file PDF cho AI qua `claude -p` (AI tự đọc PDF kể cả công thức, hình; dùng tài khoản Claude Code đã đăng nhập).
// Không dùng text trích sẵn vì mất ký hiệu toán/hình nên AI bỏ sót câu.
function parse(buffer) {
  const dir = fs.mkdtempSync(os.tmpdir() + '/quiz-');
  fs.writeFileSync(dir + '/de.pdf', buffer);
  const prompt =
    'Dùng công cụ Read đọc file de.pdf trong thư mục hiện tại (nếu trên 20 trang thì đọc từng đợt bằng tham số pages) rồi viết thành đề thi trắc nghiệm cho học sinh, giữ nguyên ngôn ngữ của tài liệu. ' +
    'Đọc cả công thức và hình vẽ trong PDF. ' +
    'CHỈ lấy câu trắc nghiệm, bỏ qua hoàn toàn phần tự luận (kể cả khi PDF có). ' +
    'Phải lấy ĐỦ TẤT CẢ câu trắc nghiệm có trong PDF, không được bỏ sót câu nào, kể cả câu có công thức hay hình vẽ; đếm lại số câu trước khi trả kết quả. ' +
    'Câu dựa vào hình thì mô tả hình bằng lời trong nội dung câu hỏi để học sinh làm được mà không cần hình. ' +
    'Nếu PDF đã có câu hỏi thì giữ nguyên câu hỏi và đáp án có sẵn; nếu không có đáp án thì tự giải để chọn đáp án đúng; ' +
    'nếu PDF chỉ là tài liệu kiến thức thì tự soạn câu hỏi bám sát nội dung. Công thức viết dạng text/Unicode dễ đọc (vd: 3/5, √7, ∈ ℚ, 50°). ' +
    'Mỗi câu phải có lời giải ngắn gọn giải thích vì sao đáp án đúng là đúng và vì sao các đáp án khác sai.';
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(SCHEMA), '--tools', 'Read', '--allowedTools', 'Read', '--no-session-persistence'];
  if (MODEL) args.push('--model', MODEL);
  return new Promise((resolve, reject) => {
    const p = spawn('claude', args, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const done = f => v => { clearTimeout(timer); fs.rmSync(dir, { recursive: true, force: true }); f(v); };
    const ok = done(resolve), fail = done(reject);
    const timer = setTimeout(() => { p.kill(); fail(new Error('AI quá thời gian (10 phút)')); }, 600000);
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => err += d);
    p.on('error', fail);
    p.on('close', () => {
      try {
        const j = JSON.parse(out);
        if (j.is_error) throw new Error(j.result);
        const exam = j.structured_output || JSON.parse(j.result);
        const qs = (exam.questions || []).filter(q => q.opts?.length >= 2 && 'ABCD'.includes(q.a));
        ok({ title: exam.title, questions: qs.map((q, i) => ({ n: i + 1, ...q, q: q.q.replace(/^\s*Câu\s*\d+\s*[.:)]\s*/i, '') })) });
      } catch (e) { fail(new Error(e.message + (err ? ' | ' + err.slice(0, 200) : ''))); }
    });
  });
}

const app = express();
app.use(express.json());

// Phục vụ trang chủ: tự động nhận index.html dù nằm ở thư mục public/ hay thư mục gốc
app.get('/', (req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  const pubIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(rootIndex) && fs.existsSync(pubIndex)) {
    const rootStat = fs.statSync(rootIndex);
    const pubStat = fs.statSync(pubIndex);
    return res.sendFile(rootStat.mtimeMs >= pubStat.mtimeMs ? rootIndex : pubIndex);
  }
  if (fs.existsSync(pubIndex)) return res.sendFile(pubIndex);
  if (fs.existsSync(rootIndex)) return res.sendFile(rootIndex);
  res.send('Lớp Toán Thầy Trịnh');
});

app.use(express.static('public'));
app.use(express.static(__dirname));
const up = multer({ limits: { fileSize: 20e6 } });

const needAdmin = (req, res, next) =>
  req.get('x-admin') === ADMIN_PASS ? next() : res.status(401).json({ error: 'Sai mật khẩu giáo viên' });

app.post('/api/upload', needAdmin, up.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa chọn file PDF' });
    
    // Lưu file PDF vào thư mục "Các file để tạo bài thi"
    const uploadDir = path.join(__dirname, '..', 'Các file để tạo bài thi');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, req.file.originalname);
    fs.writeFileSync(targetPath, req.file.buffer);

    // Lưu thông tin file vừa tải lên
    write('latest_upload.json', {
      name: req.file.originalname,
      path: targetPath,
      uploadedAt: new Date().toISOString(),
      customTitle: req.body.title || ''
    });

    res.json({
      saved: true,
      filename: req.file.originalname,
      message: `Đã lưu file "${req.file.originalname}" thành công! Thầy hãy nhắn em trong chat: "Hãy tạo đề từ file tôi vừa upload" để em đọc, vẽ hình và nạp đề ngay cho thầy nhé!`
    });
  } catch (e) { res.status(500).json({ error: 'Lỗi tải lên file: ' + e.message }); }
});

const EXAMS_DIR = path.join(__dirname, 'exams');
if (!fs.existsSync(EXAMS_DIR)) fs.mkdirSync(EXAMS_DIR, { recursive: true });

// Auto-seed Toán 7 nếu chưa có
const toan7File = path.join(EXAMS_DIR, 'toan-7-gk1.json');
if (!fs.existsSync(toan7File)) {
  write(toan7File, {
 "id": "toan-7-gk1",
 "grade": 7,
 "gradeName": "Khối 7",
 "title": "Ôn tập giữa kì 1 Toán 7 - THCS Nguyễn Huệ",
 "description": "Số hữu tỉ, số thực, góc kề bù & đường thẳng song song (12 câu chuẩn kiến thức)",
 "questions": [
  {
   "n": 1,
   "q": "Khẳng định nào sau đây là đúng?",
   "opts": [
    "4 ∉ ℕ",
    "-2,3 ∈ ℤ",
    "5/4 ∉ ℚ",
    "7 ∈ ℚ"
   ],
   "a": "D",
   "why": "7 là số nguyên, mà mọi số nguyên đều là số hữu tỉ (7 = 7/1) nên 7 ∈ ℚ là khẳng định đúng."
  },
  {
   "n": 2,
   "q": "Tập hợp số hữu tỉ kí hiệu là:",
   "opts": [
    "ℕ",
    "ℤ",
    "ℚ",
    "ℝ"
   ],
   "a": "C",
   "why": "Tập hợp các số hữu tỉ được kí hiệu chuẩn là ℚ."
  },
  {
   "n": 3,
   "q": "Số đối của số hữu tỉ 3,5 là:",
   "opts": [
    "5,3",
    "-3,5",
    "-5,3",
    "3"
   ],
   "a": "B",
   "why": "Hai số đối nhau có tổng bằng 0. Số đối của a là -a, vậy số đối của 3,5 là -3,5."
  },
  {
   "n": 4,
   "q": "Cho các số hữu tỉ: -3/19; 7/19; -9/19; 0. Sắp xếp các số trên theo thứ tự giảm dần là:",
   "opts": [
    "-3/19; -9/19; 0; 7/19",
    "-9/19; -3/19; 0; 7/19",
    "7/19; 0; -3/19; -9/19",
    "7/19; 0; -9/19; -3/19"
   ],
   "a": "C",
   "why": "Vì 7/19 > 0 > -3/19 > -9/19 nên khi sắp xếp giảm dần từ lớn đến bé, thứ tự đúng là 7/19; 0; -3/19; -9/19."
  },
  {
   "n": 5,
   "q": "Căn bậc hai số học của 7 được kí hiệu là:",
   "opts": [
    "7",
    "√7",
    "7²",
    "-√7"
   ],
   "a": "B",
   "why": "Căn bậc hai số học của số dương a được kí hiệu là √a. Vậy với 7 kí hiệu là √7."
  },
  {
   "n": 6,
   "q": "Số nào sau đây là số vô tỉ?",
   "opts": [
    "√6",
    "3/5",
    "0",
    "-1,2"
   ],
   "a": "A",
   "why": "6 không phải là số chính phương nên √6 là số thập phân vô hạn không tuần hoàn (số vô tỉ). Các số còn lại đều là số hữu tỉ."
  },
  {
   "n": 7,
   "q": "Trong các khẳng định sau, khẳng định nào là đúng?",
   "opts": [
    "0,3(29) là số thập phân vô hạn không tuần hoàn",
    "√5 là số hữu tỉ",
    "0,123 là số thập phân vô hạn tuần hoàn",
    "√3 là số vô tỉ"
   ],
   "a": "D",
   "why": "√3 là số vô tỉ vì 3 không phải số chính phương. 0,3(29) là số thập phân vô hạn tuần hoàn chu kỳ 29; √5 là số vô tỉ; 0,123 là số thập phân hữu hạn."
  },
  {
   "n": 8,
   "q": "|+3,21| bằng:",
   "opts": [
    "-3,21",
    "3,21",
    "3",
    "3,12"
   ],
   "a": "B",
   "why": "Giá trị tuyệt đối của một số dương bằng chính nó: |+3,21| = 3,21."
  },
  {
   "n": 9,
   "q": "Điền một cụm từ thích hợp vào chỗ trống: 'Qua một điểm nằm ngoài đường thẳng, … đường thẳng song song với đường thẳng đã cho'.",
   "opts": [
    "chỉ có một",
    "có hai",
    "có ba",
    "có vô số"
   ],
   "a": "A",
   "why": "Theo tiên đề Euclid về đường thẳng song song: Qua một điểm nằm ngoài đường thẳng chỉ có một đường thẳng song song với đường thẳng đã cho."
  },
  {
   "n": 10,
   "q": "Cho đường thẳng xy đi qua điểm O và tia Oa nằm giữa hai tia Ox, Oy. Khẳng định nào sau đây là đúng?",
   "opts": [
    "aOy và xOy là hai góc kề bù",
    "aOy và xOa là hai góc kề bù",
    "xOa và xOy là hai góc kề bù",
    "aOy và xOa là hai góc đối đỉnh"
   ],
   "a": "B",
   "why": "Hai góc aOy và xOa có chung cạnh Oa và hai cạnh Ox, Oy là hai tia đối nhau tạo thành góc bẹt xOy nên chúng là hai góc kề bù."
  },
  {
   "n": 11,
   "q": "Hai đường thẳng mm' và nn' cắt nhau tại O. Góc đối đỉnh với góc m'On là:",
   "opts": [
    "mOn",
    "m'On'",
    "mOn'",
    "mOm'"
   ],
   "a": "C",
   "why": "Tia Om là tia đối của Om', tia On' là tia đối của On, do đó góc đối đỉnh với góc m'On là góc mOn'."
  },
  {
   "n": 12,
   "q": "Biết góc xOm = 100°, Ot là tia phân giác của góc xOm. Số đo của góc tOm bằng bao nhiêu?",
   "opts": [
    "150°",
    "100°",
    "50°",
    "25°"
   ],
   "a": "C",
   "why": "Vì Ot là tia phân giác của góc xOm nên số đo góc tOm = góc xOm / 2 = 100° / 2 = 50°."
  }
 ]
});
}

// Auto-seed Toán 8 từ exam.json nếu chưa có
const toan8File = path.join(EXAMS_DIR, 'toan-8-tu-giac.json');
if (!fs.existsSync(toan8File)) {
  const rootExam = read(EXAM);
  if (rootExam && rootExam.questions) {
    write(toan8File, {
      id: 'toan-8-tu-giac',
      grade: 8,
      gradeName: 'Khối 8',
      title: rootExam.title || 'Đấu trường tư duy trắc nghiệm Toán - Tứ Giác Hình Học 8',
      description: 'Hình thoi & Hình vuông - 40 câu trắc nghiệm kèm hình vẽ chuẩn mực SGK',
      questions: rootExam.questions
    });
  }
}

function getAllExamsMeta() {
  const list = [];
  if (fs.existsSync(EXAMS_DIR)) {
    const files = fs.readdirSync(EXAMS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = read(path.join(EXAMS_DIR, f));
      if (data && data.title && data.questions) {
        list.push({
          id: data.id || f.replace('.json', ''),
          grade: data.grade || 8,
          gradeName: data.gradeName || `Khối ${data.grade || 8}`,
          title: data.title,
          description: data.description || '',
          count: data.questions.length
        });
      }
    }
  }

  // Quét thêm các file toan-*.json ở thư mục gốc (phòng trường hợp thầy tải trực tiếp lên GitHub root)
  try {
    const rootFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('toan-') && f.endsWith('.json'));
    for (const f of rootFiles) {
      const data = read(path.join(__dirname, f));
      if (data && data.title && data.questions && !list.find(item => item.id === (data.id || f.replace('.json', '')))) {
        list.push({
          id: data.id || f.replace('.json', ''),
          grade: data.grade || 7,
          gradeName: data.gradeName || `Khối ${data.grade || 7}`,
          title: data.title,
          description: data.description || '',
          count: data.questions.length
        });
      }
    }
  } catch (e) {}

  // Đảm bảo bài kiểm tra Khối 8 (Tứ giác) từ exam.json luôn có mặt nếu chưa có
  if (!list.find(item => item.id === 'toan-8-tu-giac' || item.grade === 8)) {
    const e = read(EXAM);
    if (e && e.title) {
      list.push({
        id: 'toan-8-tu-giac',
        grade: 8,
        gradeName: 'Khối 8',
        title: e.title || 'Đấu trường tư duy trắc nghiệm Toán - Tứ Giác Hình Học 8',
        description: 'Hình thoi & Hình vuông - 40 câu trắc nghiệm kèm hình vẽ chuẩn mực SGK',
        count: e.questions ? e.questions.length : 0
      });
    }
  }

  return list.sort((a, b) => a.grade - b.grade);
}

function getExamById(id) {
  if (id) {
    const directRoot = path.join(__dirname, `${id}.json`);
    if (fs.existsSync(directRoot)) return read(directRoot);
    if (fs.existsSync(EXAMS_DIR)) {
      const directPath = path.join(EXAMS_DIR, `${id}.json`);
      if (fs.existsSync(directPath)) return read(directPath);
      const files = fs.readdirSync(EXAMS_DIR).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const data = read(path.join(EXAMS_DIR, f));
        if (data && data.id === id) return data;
      }
    }
  }
  const toan8 = path.join(EXAMS_DIR, 'toan-8-tu-giac.json');
  if (fs.existsSync(toan8)) return read(toan8);
  return read(EXAM);
}

app.get('/api/exams', (_, res) => {
  res.json(getAllExamsMeta());
});

app.get('/api/exam', (req, res) => {
  const e = getExamById(req.query.id);
  if (!e) return res.status(404).json({ error: 'Chưa có đề thi' });
  res.json({
    id: e.id,
    grade: e.grade,
    gradeName: e.gradeName || `Khối ${e.grade}`,
    title: e.title,
    description: e.description || '',
    questions: (e.questions || []).map(q => ({
      n: q.n,
      type: q.type || 'mc',
      q: q.q,
      opts: q.opts || [],
      items: (q.items || []).map(it => ({ id: it.id, text: it.text })),
      unit: q.unit || '',
      svg: q.svg || ''
    }))
  });
});

app.post('/api/submit', (req, res) => {
  const { examId, name, cls, answers } = req.body || {};
  const e = getExamById(examId);
  if (!e) return res.status(404).json({ error: 'Không tìm thấy đề thi' });
  if (!name || !cls) return res.status(400).json({ error: 'Thiếu họ tên / lớp' });

  const norm = s => String(s || '').trim().replace(/,/g, '.').toLowerCase();

  let earnedScore = 0;
  const review = (e.questions || []).map(q => {
    const type = q.type || 'mc';
    const userAns = (answers || {})[q.n];
    let isCorrect = false;

    if (type === 'tf') {
      const items = q.items || [];
      const itemResults = items.map(it => {
        const userChoice = (userAns || {})[it.id] || '';
        const itCorrect = String(userChoice).toUpperCase() === String(it.a).toUpperCase();
        return {
          id: it.id,
          text: it.text,
          userChoice,
          correctAnswer: it.a,
          isCorrect: itCorrect,
          why: it.why || ''
        };
      });
      const correctCount = itemResults.filter(it => it.isCorrect).length;
      let qPoints = 0;
      if (items.length === 4) {
        if (correctCount === 4) qPoints = 1.0;
        else if (correctCount === 3) qPoints = 0.5;
        else if (correctCount === 2) qPoints = 0.25;
        else if (correctCount === 1) qPoints = 0.1;
      } else {
        qPoints = items.length > 0 ? (correctCount / items.length) : 0;
      }
      earnedScore += qPoints;
      isCorrect = correctCount === items.length;

      return {
        n: q.n,
        type: 'tf',
        isCorrect,
        points: qPoints,
        itemResults,
        why: q.why || ''
      };
    } else if (type === 'sa') {
      const uNorm = norm(userAns);
      const cNorm = norm(q.a);
      if (uNorm && cNorm) {
        if (uNorm === cNorm) {
          isCorrect = true;
        } else {
          const uNum = parseFloat(uNorm);
          const cNum = parseFloat(cNorm);
          if (!isNaN(uNum) && !isNaN(cNum) && Math.abs(uNum - cNum) < 0.001) {
            isCorrect = true;
          }
        }
      }
      if (isCorrect) earnedScore += 1;
      return {
        n: q.n,
        type: 'sa',
        userChoice: userAns || '',
        a: q.a,
        isCorrect,
        why: q.why || ''
      };
    } else {
      isCorrect = String(userAns || '').toUpperCase() === String(q.a || '').toUpperCase();
      if (isCorrect) earnedScore += 1;
      return {
        n: q.n,
        type: 'mc',
        userChoice: userAns || '',
        a: q.a,
        isCorrect,
        why: q.why || ''
      };
    }
  });

  const finalScore = Math.round(earnedScore * 10) / 10;
  const total = e.questions.length;

  const all = read(RESULTS, []);
  all.push({
    examId: e.id || examId || '',
    examTitle: e.title,
    grade: e.grade || 8,
    gradeName: e.gradeName || `Khối ${e.grade || 8}`,
    name,
    cls,
    score: finalScore,
    total,
    at: new Date().toISOString()
  });
  write(RESULTS, all);

  res.json({
    score: finalScore,
    total,
    review
  });
});

app.get('/api/results', needAdmin, (_, res) => res.json(read(RESULTS, [])));

app.post('/api/results/clear', needAdmin, (_, res) => {
  write(RESULTS, []);
  res.json({ ok: true, message: 'Đã xóa toàn bộ kết quả' });
});

app.delete('/api/results/:idx', needAdmin, (req, res) => {
  const all = read(RESULTS, []);
  const idx = parseInt(req.params.idx, 10);
  if (!isNaN(idx) && idx >= 0 && idx < all.length) {
    all.splice(idx, 1);
    write(RESULTS, all);
    return res.json({ ok: true });
  }
  res.status(400).json({ error: 'Không tìm thấy dòng kết quả cần xóa' });
});

app.delete('/api/exams/:id', needAdmin, (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Thiếu mã bài thi' });

  let deleted = false;
  if (fs.existsSync(EXAMS_DIR)) {
    const directPath = path.join(EXAMS_DIR, `${id}.json`);
    if (fs.existsSync(directPath)) {
      try { fs.unlinkSync(directPath); deleted = true; } catch (e) {}
    } else {
      const files = fs.readdirSync(EXAMS_DIR).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const filePath = path.join(EXAMS_DIR, f);
        const data = read(filePath);
        if (data && data.id === id) {
          try { fs.unlinkSync(filePath); deleted = true; } catch (e) {}
          break;
        }
      }
    }
  }

  if (deleted) {
    return res.json({ ok: true, message: 'Đã xóa bài kiểm tra thành công!' });
  }
  res.status(404).json({ error: 'Không tìm thấy bài kiểm tra để xóa' });
});

app.listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000)));
