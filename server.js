const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 테스트용 API 1: 서버 작동 확인
app.get('/', (req, res) => {
  res.send('GameDrop 백엔드 서버가 정상적으로 실행 중입니다!');
});

// 🟢 테스트용 API 2: DB 연결 확인
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*');
    if (error) throw error;
    res.json({ message: 'DB 연결 성공!', data: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 실제 기능 1: 회원가입 API
app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ error: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.' });
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .insert([{ email: email, password: password, nickname: nickname }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: '회원가입이 완료되었습니다!', user: data[0] });
  } catch (error) {
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

// 🟢 서버 실행 코드 (항상 파일의 마지막에 위치)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

// 🟢 실제 기능 2: 로그인 API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // DB에서 이메일(또는 닉네임)로 유저 찾기
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 비밀번호 확인 (지금은 단순 비교)
    if (data.password !== password) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 로그인 성공
    res.json({ message: '로그인 성공!', user: data });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});