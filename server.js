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
app.use(express.static('public'));
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
  if (list.length === 0) {
    const e = read(EXAM);
    if (e && e.title) {
      list.push({
        id: 'default',
        grade: 8,
        gradeName: 'Khối 8',
        title: e.title,
        description: '',
        count: e.questions ? e.questions.length : 0
      });
    }
  }
  return list.sort((a, b) => a.grade - b.grade);
}

function getExamById(id) {
  if (id && fs.existsSync(EXAMS_DIR)) {
    const directPath = path.join(EXAMS_DIR, `${id}.json`);
    if (fs.existsSync(directPath)) return read(directPath);
    const files = fs.readdirSync(EXAMS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = read(path.join(EXAMS_DIR, f));
      if (data && data.id === id) return data;
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
    questions: (e.questions || []).map(({ n, q, opts, svg }) => ({ n, q, opts, svg: svg || '' }))
  });
});

app.post('/api/submit', (req, res) => {
  const { examId, name, cls, answers } = req.body || {};
  const e = getExamById(examId);
  if (!e) return res.status(404).json({ error: 'Không tìm thấy đề thi' });
  if (!name || !cls) return res.status(400).json({ error: 'Thiếu họ tên / lớp' });
  const score = (e.questions || []).filter(q => (answers || {})[q.n] === q.a).length;
  const all = read(RESULTS, []);
  all.push({
    examId: e.id || examId || '',
    examTitle: e.title,
    grade: e.grade || 8,
    gradeName: e.gradeName || `Khối ${e.grade || 8}`,
    name,
    cls,
    score,
    total: e.questions.length,
    at: new Date().toISOString()
  });
  write(RESULTS, all);
  res.json({
    score,
    total: e.questions.length,
    review: (e.questions || []).map(q => ({ n: q.n, a: q.a, why: q.why || '' }))
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
