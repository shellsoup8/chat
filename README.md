# RETROCHAT 🖥️

레트로 CRT 감성의 실시간 멀티룸 채팅 앱.  
**Next.js 15 + Socket.io + Google OAuth + Passport.js**

```
retrochat-socket/
├── server/   ← Node.js (Express + Socket.io + Passport)
└── client/   ← Next.js 15
```

---

## ⚡ 빠른 시작

### 1단계 — Google OAuth 앱 생성

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs에 추가:
   ```
   http://localhost:4000/auth/google/callback
   ```
5. **Client ID**와 **Client Secret** 복사

---

### 2단계 — 서버 설정

```bash
cd server
cp .env.example .env
```

`.env` 파일에 값 입력:
```env
SESSION_SECRET=랜덤하고-긴-문자열-여기에
GOOGLE_CLIENT_ID=발급받은-클라이언트-ID
GOOGLE_CLIENT_SECRET=발급받은-클라이언트-시크릿
```

```bash
npm install
npm run dev
# → http://localhost:4000 실행
```

---

### 3단계 — 클라이언트 설정

```bash
cd client
cp .env.local.example .env.local
# NEXT_PUBLIC_SERVER_URL=http://localhost:4000 (기본값 그대로 OK)

npm install
npm run dev
# → http://localhost:3000 실행
```

---

## 🗂️ 프로젝트 구조

```
server/src/
├── index.ts          # Express + Socket.io 서버 진입점
├── auth.ts           # Passport Google OAuth 설정
├── messageStore.ts   # 인메모리 메시지 저장소
├── rooms.ts          # 채널 목록 + 색상 유틸
└── types.ts          # 공유 타입 정의

client/
├── app/
│   ├── page.tsx               # 루트 (로그인/룸 리다이렉트)
│   ├── login/page.tsx         # Google 로그인 화면
│   └── room/[id]/page.tsx     # 실시간 채팅 룸
├── lib/
│   ├── socket.ts              # Socket.io 싱글톤 클라이언트
│   ├── api.ts                 # 서버 REST API 헬퍼
│   └── rooms.ts               # 채널 목록
└── types/index.ts
```

---

## ✅ 기능 목록

| 기능 | 설명 |
|------|------|
| Google OAuth | Passport.js + express-session |
| 실시간 채팅 | Socket.io WebSocket |
| 멀티룸 | general / tech / music / random |
| 온라인 인원 수 | 룸별 실시간 카운트 |
| 메시지 히스토리 | 룸 입장 시 최근 100개 수신 |
| 사용자 색상 | 구글 계정 ID 기반 일관된 색상 |
| CRT 효과 | 스캔라인 + 깜빡임 애니메이션 |

---

## 🚀 프로덕션 배포

### 서버 (Railway / Render / EC2)
```bash
cd server && npm run build && npm start
```
환경변수에 `CLIENT_URL`을 실제 클라이언트 도메인으로 변경.  
Google Cloud Console에서 Redirect URI도 프로덕션 URL로 추가.

### 클라이언트 (Vercel)
```bash
cd client && npx vercel --prod
```
Vercel 대시보드에서 `NEXT_PUBLIC_SERVER_URL`을 서버 URL로 설정.

---

## 💡 메시지 영구 저장 (옵션)

현재 `messageStore.ts`는 인메모리 저장이라 서버 재시작 시 초기화됩니다.  
영구 저장이 필요하면 `addMessage` / `getHistory` 함수를 PostgreSQL / Redis로 교체하세요.
