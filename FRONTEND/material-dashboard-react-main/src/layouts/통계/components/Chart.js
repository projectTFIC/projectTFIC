// 다크 배경용 네온-파스텔 팔레트 + 공용 유틸

// 의미 고정 색상(유형)
const FIXED = {
  // 안전장비 미착용 = 네온 핑크
  "안전장비 미착용": "#FF5C8A",
  // ACC 감지 = 스카이 블루
  "ACC 감지": "#3DB3F7",
  // 중장비 출입 = 앰버
  "중장비 출입": "#F6C85F",
};

// 구역/기타 라벨용 팔레트(다크 배경 대비 ↑)
const PALETTE = [
  "#22D3EE", // cyan-400
  "#A78BFA", // violet-400
  "#34D399", // emerald-400
  "#F472B6", // pink-400
  "#F59E0B", // amber-500
  "#60A5FA", // blue-400
  "#10B981", // emerald-500
  "#F87171", // rose-400
  "#C084FC", // violet-300
  "#FBBF24", // amber-400
  "#2DD4BF", // teal-400
  "#93C5FD", // blue-300
];

// 라벨 정규화
export const normalizeLabel = (s = "") => {
  let t = String(s).trim();
  t = t.replace(/\s*\d{6,}.*$/, "").trim(); // "사고 감지 250811..." 꼬리 제거
  if (t.startsWith("안전장비 미착용")) return "안전장비 미착용";
  if (t.startsWith("중장비 출입")) return "중장비 출입";
  if (t.startsWith("사고 감지") || t === "ACC 감지") return "ACC 감지";
  return t;
};

// 안정 해시
const idxFromHash = (label) => {
  let hash = 0;
  const str = String(label);
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

// 전역 캐시(라벨→색) + 중복 회피
const cache = new Map();
const used = new Set();

const pickColor = (base) => {
  let i = base % PALETTE.length;
  for (let k = 0; k < PALETTE.length; k++) {
    const c = PALETTE[i];
    if (!used.has(c)) return c;
    i = (i + 1) % PALETTE.length;
  }
  return PALETTE[base % PALETTE.length];
};

export const colorOf = (raw) => {
  const label = normalizeLabel(raw);
  if (FIXED[label]) return FIXED[label];
  if (cache.has(label)) return cache.get(label);
  const color = pickColor(idxFromHash(label));
  cache.set(label, color);
  used.add(color);
  return color;
};

const hexToRgba = (hex, a = 0.35) => {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};

export const fillOf = (raw, alpha = 0.35) => hexToRgba(colorOf(raw), alpha);

// 필요시 초기화용
export const __resetColorCache = () => {
  cache.clear();
  used.clear();
};
