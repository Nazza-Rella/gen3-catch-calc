(() => {
'use strict';

const D = window.DATA;
const A = window.ASSETS;
const SP = D.species;
const $ = (id) => document.getElementById(id);
const fl = Math.floor;

// ---------------------------------------------------------------- 定義
const GAMES = [
  { id: 'R', name: 'ルビー', color: '#c8323c', set: 'em', back: 'brendan_rs', tb: 'em', def: 383 },
  { id: 'S', name: 'サファイア', color: '#2f5fc4', set: 'em', back: 'may_rs', tb: 'em', def: 382 },
  { id: 'E', name: 'エメラルド', color: '#27925a', set: 'em', back: 'brendan', tb: 'em', def: 384 },
  { id: 'FR', name: 'ファイアレッド', color: '#df5a26', set: 'fr', back: 'red', tb: 'fr', def: 150 },
  { id: 'LG', name: 'リーフグリーン', color: '#4f9f38', set: 'fr', back: 'leaf', tb: 'fr', def: 150 },
  { id: 'CO', name: 'コロシアム', color: '#6a4bb3', gc: true, def: 248 },
  { id: 'XD', name: 'XD', color: '#3a2a68', gc: true, def: 249 },
  { id: 'ALL', name: '全ポケモン', color: '#46a352', set: 'em', back: 'wally', tb: 'em', def: 386, all: true },
];
const GAME = Object.fromEntries(GAMES.map((g) => [g.id, g]));

const BALLS = [
  { id: 'master', name: 'マスター' }, { id: 'ultra', name: 'ハイパー' }, { id: 'great', name: 'スーパー' },
  { id: 'poke', name: 'モンスター' }, { id: 'safari', name: 'サファリ' }, { id: 'net', name: 'ネット' },
  { id: 'dive', name: 'ダイブ' }, { id: 'nest', name: 'ネスト' }, { id: 'repeat', name: 'リピート' },
  { id: 'timer', name: 'タイマー' }, { id: 'luxury', name: 'ゴージャス' }, { id: 'premier', name: 'プレミア' },
];
const BALL = Object.fromEntries(BALLS.map((b) => [b.id, b]));

const STATUS = [
  { id: 'none', name: 'なし', color: '#8b968d', mul: '×1' },
  { id: 'slp', name: 'ねむり', color: '#8a8698', mul: '×2' },
  { id: 'frz', name: 'こおり', color: '#4f9fd8', mul: '×2' },
  { id: 'par', name: 'まひ', color: '#c29a12', mul: '×1.5' },
  { id: 'psn', name: 'どく', color: '#a34db3', mul: '×1.5' },
  { id: 'brn', name: 'やけど', color: '#e0643c', mul: '×1.5' },
];
const STAT = Object.fromEntries(STATUS.map((s) => [s.id, s]));

const TYPE_COLOR = {
  'ノーマル': '#9a9a72', 'ほのお': '#e87a2e', 'みず': '#5f86e0', 'でんき': '#d8b21c', 'くさ': '#62ad44', 'こおり': '#6cbcbc',
  'かくとう': '#b8322a', 'どく': '#9a409a', 'じめん': '#c8a652', 'ひこう': '#8f7fdc', 'エスパー': '#e6537c', 'むし': '#98a820',
  'いわ': '#a8923a', 'ゴースト': '#6a5494', 'ドラゴン': '#6a3ae8', 'あく': '#6a5444', 'はがね': '#9a9ab6', '？？？': '#68a090',
};

const METHOD = {
  land: 'くさむら', cave: 'どうくつ', building: 'たてもの', surf: 'なみのり', dive: 'ダイビング（すいちゅう）', rock: 'いわくだき',
  old: 'ボロのつりざお', good: 'いいつりざお', super: 'すごいつりざお',
};

const ICON = {
  land: '<path d="M5 20c1-6 1-10-1-14M10 20c0-5 1-9 4-13M15 20c0-4-1-7-3-9M19 20c0-5 1-8 2-10" stroke-linecap="round"/>',
  cave: '<path d="M3 20c0-9 4-15 9-15s9 6 9 15M8 20c0-4 2-7 4-7s4 3 4 7" stroke-linejoin="round"/>',
  building: '<path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" stroke-linejoin="round"/>',
  surf: '<path d="M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 19c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M12 10c0-3 2-6 5-6" stroke-linecap="round"/>',
  dive: '<circle cx="8" cy="15" r="3.5"/><circle cx="15" cy="9" r="2.5"/><circle cx="16.5" cy="17" r="1.8"/><circle cx="10" cy="5" r="1.5"/>',
  rock: '<path d="M3 19l3-8 5-4 6 2 4 10z" stroke-linejoin="round"/><path d="M11 7l1 5 5 1" />',
  rod: '<path d="M4 20L18 4M18 4v11" stroke-linecap="round"/><circle cx="18" cy="17" r="2"/>',
  static: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" stroke-linejoin="round"/>',
  roam: '<path d="M4 18c3-1 4-4 8-4s5 3 8 4" stroke-linecap="round"/><circle cx="7" cy="8" r="1.8"/><circle cx="12" cy="6" r="1.8"/><circle cx="17" cy="8" r="1.8"/>',
  shadow: '<path d="M12 21c-4 0-7-3-7-7 0-4 3-5 4-9 2 2 2 4 2 5 1-1 2-3 2-5 3 2 6 6 6 9 0 4-3 7-7 7z" stroke-linejoin="round"/>',
  spot: '<path d="M4 12h16l-2 7H6z" stroke-linejoin="round"/><circle cx="9" cy="9" r="1.6"/><circle cx="13" cy="8" r="1.6"/><circle cx="16" cy="10" r="1.4"/>',
  free: '<path d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2.2M12 18h.01" stroke-linecap="round"/>',
};
ICON.near = '<path d="M7 20l2-5-2-3 2-5M15 20l1-4 3-2-1-4" stroke-linecap="round"/><circle cx="10" cy="4" r="1.6"/><circle cx="18" cy="6" r="1.6"/>';
ICON.pkbl = '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5M12 12v9" stroke-linejoin="round"/>';
ICON.bait = '<path d="M12 7c3-3 8-1 8 4 0 5-4 9-8 9s-8-4-8-9c0-5 5-7 8-4z M12 7c0-2 1-3 3-4" stroke-linejoin="round"/>';
ICON.undo = '<path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2" stroke-linecap="round" stroke-linejoin="round"/>';
ICON.reset = '<path d="M4 12a8 8 0 1 0 3-6.3M4 4v4h4" stroke-linecap="round" stroke-linejoin="round"/>';
ICON.tower = '<path d="M8 21V8l4-5 4 5v13M6 21h12M10 12h4M10 16h4" stroke-linejoin="round"/>';
ICON.sky = '<path d="M6 16a4 4 0 0 1 .5-8A5 5 0 0 1 16 7a4 4 0 0 1 2 8z" stroke-linejoin="round"/>';
ICON.sand = '<path d="M3 18c3-3 6-3 9 0s6 3 9 0M5 12l2-2M11 10l2-2M17 12l2-2" stroke-linecap="round"/>';

// 全ポケモンで選べる場所（アイコン, 名前, 補足, 背景）
const ALL_PLACES = [
  ['tower', 'タワー', '', 'tower', {}],
  ['land', 'くさむら', '', 'tall_grass', {}],
  ['land', 'ながいくさむら', '', 'long_grass', {}],
  ['sand', 'さばく', '', 'sand', {}],
  ['cave', 'どうくつ', '', 'cave', {}],
  ['rock', 'やま', '', 'rock', {}],
  ['building', 'たてもの', '', 'building', {}],
  ['surf', 'うみ', 'なみのり・つり', 'water', {}],
  ['surf', 'いけ・かわ', 'なみのり・つり', 'pond_water', {}],
  ['dive', 'すいちゅう', 'ダイブボール3.5倍', 'underwater', { underwater: true }],
  ['land', 'サファリゾーン', 'サファリボールのみ', 'tall_grass', { safari: true }],
  ['sky', 'そらのはしら', '', 'sky', {}],
];

const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${ICON[k]}</svg>`;

// ---------------------------------------------------------------- 状態
const st = {
  game: 'E', free: false, dex: 384, entry: 0, level: 70, iv: 31, hpFrac: 0, status: 'slp', ball: 'ultra',
  turn: 1, repeat: false, shiny: false, acts: [], balls: 30, pkbl: 'curious', intl: false,
};
const tally = { n: 0, ok: 0 };

// ---------------------------------------------------------------- 出現条件
function entriesFor(gid, dex, free) {
  const g = D.games[gid];
  const game = GAME[gid];
  const out = [];
  if (free) {
    if (game.gc) {
      out.push({ kind: 'shadow', title: 'ダークポケモンとして', sub: '種族の捕獲率・レベル自由', min: 1, max: 100, bg: 'stadium', free: true });
      if (gid === 'XD') out.push({ kind: 'spot', title: 'やせいのポケモンとして', sub: 'レベル自由', min: 1, max: 100, bg: 'rock', free: true });
    } else if (game.all) {
      for (const [icon, title, sub, bg, extra] of ALL_PLACES) out.push({ kind: 'free', method: icon, title, sub, min: 1, max: 100, bg, free: true, ...extra });
    } else {
      const land = game.set === 'em' ? 'tall_grass' : 'grass';
      out.push({ kind: 'free', method: 'land', title: 'ふつうの場所', sub: '陸・水上・つり', min: 1, max: 100, bg: land, free: true });
      if (game.set === 'em') out.push({ kind: 'free', method: 'dive', title: 'すいちゅう', sub: 'ダイビング中', min: 1, max: 100, bg: 'underwater', underwater: true, free: true });
      out.push({ kind: 'free', method: 'land', title: 'サファリゾーン', sub: 'サファリボールのみ', min: 1, max: 100, bg: land, safari: true, free: true });
    }
    return out;
  }
  if (game.gc) {
    for (const s of g.shadow) {
      if (s.dex !== dex) continue;
      out.push({ kind: 'shadow', title: s.place, sub: s.ereader ? 'ダークポケモン（カードｅ）' : 'ダークポケモン', min: s.lv, max: s.lv, rate: s.rate,
        auto: !!s.auto, phenac: !!s.phenac, ereader: !!s.ereader, bg: 'stadium', phenacXD: gid === 'XD' && s.place === 'フェナススタジアム' });
    }
    for (const sp of g.spots || []) {
      for (const m of sp.mons) {
        if (m[0] === dex) out.push({ kind: 'spot', title: sp.name, sub: 'やせい（ポケスナック）', min: m[1], max: m[2], pct: m[3], bg: sp.bg });
      }
    }
    return out;
  }
  for (const l of g.locs) {
    for (const m of l.mons) {
      if (m[0] !== dex) continue;
      out.push({ kind: 'wild', method: l.method, title: l.name, sub: METHOD[l.method] + (l.safari ? '・サファリ' : ''), min: m[1], max: m[2], pct: m[3],
        bg: l.bg, safari: l.safari, underwater: l.underwater });
    }
  }
  for (const s of g.statics || []) {
    if (s.dex !== dex) continue;
    out.push({ kind: s.roam ? 'roam' : 'static', title: s.place, sub: s.roam ? 'はいかい' : (s.note || ''), min: s.lv, max: s.lv, bg: s.bg, roam: !!s.roam });
  }
  return out;
}

const speciesCache = {};
function speciesFor(gid) {
  if (speciesCache[gid]) return speciesCache[gid];
  if (GAME[gid].all) return (speciesCache[gid] = Array.from({ length: 386 }, (_, i) => i + 1));
  const set = new Set();
  const g = D.games[gid];
  if (GAME[gid].gc) {
    g.shadow.forEach((s) => set.add(s.dex));
    (g.spots || []).forEach((sp) => sp.mons.forEach((m) => set.add(m[0])));
  } else {
    g.locs.forEach((l) => l.mons.forEach((m) => set.add(m[0])));
    (g.statics || []).forEach((s) => set.add(s.dex));
  }
  return (speciesCache[gid] = [...set].sort((a, b) => a - b));
}

// ---------------------------------------------------------------- 計算
function maxHP(dex, lv, iv) {
  if (dex === 292) return 1;
  return fl((2 * SP[dex].hp + iv) * lv / 100) + lv + 10;
}
function curHP(M) {
  return Math.max(1, Math.min(M, Math.round(st.hpFrac * M)));
}
function isqrt(n) { return fl(Math.sqrt(n)); }

// ---------------------------------------------------------------- サファリ
// RSE はちかづく/ポロック、FRLG はいし/エサ。数値は pret の battle_main.c・battle_util.c・battle_ai_script_commands.c のまま
const PKBL_REACT = { curious: 'きょうみ', enthralled: 'むちゅう', ignored: 'むし' };
const PKBL_TABLE = [
  { curious: 0, enthralled: 0, ignored: 0 }, { curious: 3, enthralled: 5, ignored: 0 },
  { curious: 2, enthralled: 3, ignored: 0 }, { curious: 1, enthralled: 2, ignored: 0 },
];
const NEAR_CATCH = [4, 3, 2, 1];
const SAFARI_ACT = { ball: 'ボール', rock: 'いし', bait: 'エサ', near: 'ちかづく', pkbl: 'ポロック' };

function safariBase(dex) {
  const f0 = fl(SP[dex].rate * 100 / 1275);
  if (GAME[st.game].set === 'em') return { f0, e0: 3 };
  let e0 = fl(SP[dex].sf * 100 / 1275);
  if (e0 <= 1) e0 = 2;
  return { f0, e0 };
}
function rseNear(s) {
  s.f = Math.min(20, s.f + NEAR_CATCH[s.n]);
  s.e = Math.min(20, s.e + 4);
  if (s.n < 3) s.n++;
}
function rsePkbl(s, react) {
  if (s.p < 3) s.p++;
  if (s.e > 1) {
    const t = PKBL_TABLE[s.p][react];
    // 同じ値だと 0 になるのはゲームのバグ（ポロックを投げ続けると逃げなくなる）
    if (s.e < t) s.e = 1;
    else s.e -= t;
  }
}
function frFlee(e, r, b) {
  if (r) return Math.min(e * 2, 20) * 5;
  if (b) return Math.max(fl(e / 4), 1) * 5;
  return e * 5;
}

function safariInfo(dex) {
  const { f0, e0 } = safariBase(dex);
  const em = GAME[st.game].set === 'em';
  const s = { f: f0, e: e0, n: 0, p: 0 };
  const log = [];
  for (const a of st.acts) {
    if (em && a === 'near') rseNear(s);
    else if (em && a === 'pkbl') rsePkbl(s, st.pkbl);
    else if (a === 'rock') s.f = Math.min(20, s.f << 1);
    else if (a === 'bait') { s.f >>= 1; if (s.f <= 2) s.f = 3; }
    log.push({ a, f: s.f, e: s.e });
  }
  const last = st.acts[st.acts.length - 1];
  const flee = em ? Math.min(100, s.e * 5) : frFlee(e0, last === 'rock', last === 'bait');
  return { f0, e0, f: s.f, e: s.e, flee, log, rate: fl(s.f * 1275 / 100) & 255 };
}

// サファリボール1個の捕獲率（HPまんタン・状態なし）
function safariPc(f) {
  const rate = fl(f * 1275 / 100) & 255;
  const a = fl(fl(rate * 15 / 10) / 3);
  if (a > 254) return 1;
  if (!a) return 0;
  const b = fl(1048560 / isqrt(isqrt(fl(16711680 / a))));
  return (Math.min(b, 65536) / 65536) ** 4;
}

// 最善の動きを総当たりで求める（のこりボールごとに価値反復）。
// 相手が逃げるかどうかはターンのはじめ、こちらが行動する前の状態で決まる
const solveCache = new Map();
function solveSafari(dex, balls) {
  const em = GAME[st.game].set === 'em';
  const key = [em, dex, balls, st.pkbl].join('|');
  if (solveCache.has(key)) return solveCache.get(key);
  const { f0, e0 } = safariBase(dex);
  const pc = Array.from({ length: 21 }, (_, f) => safariPc(f));
  let N, start, enc, dec, flee, trans, acts;
  if (em) {
    acts = ['ball', 'near', 'pkbl'];
    N = 21 * 21 * 4 * 4;
    enc = (s) => ((s.f * 21 + s.e) * 4 + s.n) * 4 + s.p;
    dec = (i) => ({ p: i % 4, n: fl(i / 4) % 4, e: fl(i / 16) % 21, f: fl(i / 336) });
    flee = (s) => Math.min(100, s.e * 5) / 100;
    trans = (s, a) => {
      const t = { ...s };
      if (a === 'near') rseNear(t);
      else if (a === 'pkbl') rsePkbl(t, st.pkbl);
      return [[enc(t), 1]];
    };
    start = enc({ f: f0, e: e0, n: 0, p: 0 });
  } else {
    acts = ['ball', 'rock', 'bait'];
    N = 21 * 7 * 7;
    enc = (s) => (s.f * 7 + s.r) * 7 + s.b;
    dec = (i) => ({ b: i % 7, r: fl(i / 7) % 7, f: fl(i / 49) });
    flee = (s) => frFlee(e0, s.r, s.b) / 100;
    const watch = (t) => {
      if (t.r) { t.r--; if (!t.r) t.f = f0; }
      else if (t.b) t.b--;
      return t;
    };
    trans = (s, a) => {
      if (a === 'ball') return [[enc(watch({ ...s })), 1]];
      const out = [];
      for (let k = 2; k <= 6; k++) {
        const t = { ...s };
        if (a === 'rock') { t.b = 0; t.r = Math.min(6, t.r + k); t.f = Math.min(20, t.f << 1); }
        else { t.r = 0; t.b = Math.min(6, t.b + k); t.f >>= 1; if (t.f <= 2) t.f = 3; }
        out.push([enc(watch(t)), 0.2]);
      }
      return out;
    };
    start = enc({ f: f0, r: 0, b: 0 });
  }
  const S = Array.from({ length: N }, (_, i) => dec(i));
  const pf = S.map(flee);
  const T = S.map((s) => acts.map((a) => trans(s, a)));
  let prev = new Float64Array(N);
  const policy = [];
  for (let bl = 1; bl <= balls; bl++) {
    const cur = new Float64Array(N);
    const pol = new Uint8Array(N);
    for (let it = 0; it < 400; it++) {
      let delta = 0;
      for (let i = 0; i < N; i++) {
        const f = S[i].f;
        let best = pc[f] + (1 - pc[f]) * (1 - pf[i]) * prev[T[i][0][0][0]];
        let ba = 0;
        for (let a = 1; a < acts.length; a++) {
          let v = 0;
          for (const [j, w] of T[i][a]) v += w * cur[j];
          v *= 1 - pf[i];
          if (v > best + 1e-13) { best = v; ba = a; }
        }
        delta = Math.max(delta, Math.abs(best - cur[i]));
        cur[i] = best;
        pol[i] = ba;
      }
      if (delta < 1e-12) break;
    }
    policy.push(pol);
    prev = cur;
  }
  // ボールだけ投げ続けた場合
  const q = pc[f0], pf0 = pf[start];
  let only = 0, keep = 1;
  for (let i = 0; i < balls; i++) { only += keep * q; keep *= (1 - q) * (1 - pf0); }
  // 最善手の流れ（いし・エサの持続ターンは真ん中の4ターンで代表）
  const path = [];
  let s = start, bl = balls;
  for (let step = 0; step < 14 && bl > 0; step++) {
    const a = acts[policy[bl - 1][s]];
    path.push(a);
    const next = T[s][acts.indexOf(a)];
    s = next.length > 1 ? next[2][0] : next[0][0];
    if (a === 'ball') bl--;
  }
  const res = { best: prev[start], only, path, acts };
  solveCache.set(key, res);
  return res;
}

function ctxNow() {
  const entry = curEntry();
  const dex = st.dex;
  const M = maxHP(dex, st.level, st.iv);
  const H = entry.safari ? M : curHP(M);
  const status = entry.safari ? 'none' : st.status;
  let rate = entry.rate != null ? entry.rate : SP[dex].rate;
  let safari = null;
  if (entry.safari) {
    safari = safariInfo(dex);
    rate = safari.rate;
  }
  return { entry, dex, M, H, status, rate, safari, game: st.game };
}

// ボールの倍率（10倍値）と使えるかどうか
function ballInfo(id, c) {
  const g = GAME[c.game];
  const e = c.entry;
  const types = SP[c.dex].types;
  if (g.gc && id === 'safari') return null;
  if (e.safari && id !== 'safari') return { off: 'サファリゾーンではサファリボールしか投げられません' };
  if (!e.safari && id === 'safari') return { off: 'サファリゾーンの中でしか使えません' };
  switch (id) {
    case 'master': return { master: true, why: '必ず捕まる' };
    case 'ultra': return { m: 20 };
    case 'great': return { m: 15 };
    case 'poke': return { m: 10 };
    case 'safari': return { m: 15 };
    case 'net': {
      const wat = types.includes('みず');
      const bug = types.includes('むし');
      // 日本版コロシアムだけ判定が逆（みずを2回調べて分岐も逆）。英語版・欧州版は正しい
      if (c.game === 'CO' && !st.intl) return { m: wat ? 10 : 30 };
      return { m: wat || bug ? 30 : 10, why: wat || bug ? 'みず・むしタイプ' : 'みず・むしタイプではない' };
    }
    case 'dive': {
      if (c.game === 'CO') return { m: e.phenac ? 35 : 10, why: e.phenac ? 'フェナススタジアムは水中扱い' : '水中扱いの場所ではない' };
      if (c.game === 'XD') return { m: 10, why: e.phenacXD ? '水中扱いだが、この時点ではダイブボールを入手できない' : '水中扱いの場所ではない' };
      if (g.set === 'fr') return { m: 10, why: 'FRLGには水中マップがない' };
      return { m: e.underwater ? 35 : 10, why: e.underwater ? 'すいちゅう' : 'すいちゅうではない' };
    }
    case 'nest': {
      const m = st.level < 40 ? Math.max(10, 40 - st.level) : 10;
      return { m, why: 'Lv' + st.level };
    }
    case 'repeat': {
      if (g.gc && e.kind === 'shadow') return { m: 10, why: 'ダークポケモンは実質1倍' };
      return { m: st.repeat ? 30 : 10, why: st.repeat ? 'つかまえたことがある' : 'つかまえたことがない' };
    }
    case 'timer': {
      const m = Math.min(40, 10 + (st.turn - 1));
      return { m, why: st.turn + 'ターン目' };
    }
    default: return { m: 10 };
  }
}

function calc(c, ballId) {
  const bi = ballInfo(ballId, c);
  const r = { bi, c };
  if (!bi || bi.off) return null;
  if (c.entry.auto) { r.p = 1; r.auto = true; r.p1 = 1; return r; }
  if (bi.master) { r.p = 1; r.master = true; r.p1 = 1; return r; }
  const { rate, M, H } = c;
  r.a1 = fl(rate * bi.m / 10);
  r.a2 = fl(r.a1 * (3 * M - 2 * H) / (3 * M));
  const s = c.status;
  if (s === 'slp' || s === 'frz') r.a3 = r.a2 * 2, r.smul = '×2';
  else if (s !== 'none') r.a3 = fl(r.a2 * 15 / 10), r.smul = '×1.5';
  else r.a3 = r.a2, r.smul = '×1';
  if (r.a3 > 254) { r.p = 1; r.sure = true; r.p1 = 1; return r; }
  if (r.a3 === 0) { r.p = 0; r.p1 = 0; r.zero = true; return r; }
  r.q = fl(16711680 / r.a3);
  r.s1 = isqrt(r.q);
  r.s2 = isqrt(r.s1);
  r.b = fl(1048560 / r.s2);
  r.p1 = Math.min(r.b, 65536) / 65536;
  r.p = r.p1 ** 4;
  return r;
}

// 投げた数ごとの累積確率。タイマーボールは1ターンに1球として倍率が上がる
function series(c, ballId) {
  const base = calc(c, ballId);
  if (!base) return null;
  const timer = ballId === 'timer';
  const pAt = (k) => {
    if (!timer) return base.p;
    const save = st.turn;
    st.turn = save + k;
    const r = calc(c, ballId);
    st.turn = save;
    return r.p;
  };
  const cum = [];
  let surv = 1, exp = 0, k = 0;
  const need = { 50: null, 90: null, 99: null };
  const LIMIT = 400;
  for (; k < LIMIT; k++) {
    const p = pAt(k);
    exp += surv;
    surv *= 1 - p;
    cum.push(1 - surv);
    for (const P of [50, 90, 99]) if (need[P] == null && 1 - surv >= P / 100 - 1e-12) need[P] = k + 1;
    if (surv < 1e-12) break;
  }
  if (surv >= 1e-12) {
    const p = pAt(LIMIT + 100);
    if (p > 0) {
      exp += surv / p;
      for (const P of [50, 90, 99]) {
        if (need[P] == null) need[P] = LIMIT + Math.ceil(Math.log((1 - P / 100) / surv) / Math.log(1 - p));
      }
    } else {
      exp = Infinity;
    }
  }
  return { base, cum, exp, need, timer };
}

// ---------------------------------------------------------------- 画像
function loadImg(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
}
function imgData(img) {
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d');
  x.drawImage(img, 0, 0);
  return { w: img.width, d: x.getImageData(0, 0, img.width, img.height).data };
}
const parsePal = (hex) => Array.from({ length: 16 }, (_, i) => [0, 2, 4].map((o) => parseInt(hex.substr(i * 6 + o, 2), 16)));

let ATLAS = null, ICONS = null, FONT = null, FONT_N = null, FONT_B = null, FONT_FR = null;
const IMG = {};
const cache = new Map();

function indexed(src, size, sx, sy, pal) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const x = cv.getContext('2d');
  const out = x.createImageData(size, size);
  const opaque = [];
  for (let y = 0; y < size; y++) {
    for (let xx = 0; xx < size; xx++) {
      const v = (src.d[((sy + y) * src.w + sx + xx) * 4] + 8) >> 4;
      if (!v) continue;
      const o = (y * size + xx) * 4;
      const c = pal[v];
      out.data[o] = c[0]; out.data[o + 1] = c[1]; out.data[o + 2] = c[2]; out.data[o + 3] = 255;
      opaque.push(xx, y);
    }
  }
  x.putImageData(out, 0, 0);
  cv.opaque = opaque;
  return cv;
}
function sprite(dex, frame, shiny) {
  const k = `s${dex}_${frame}_${shiny ? 1 : 0}`;
  if (!cache.has(k)) {
    const i = (dex - 1) * 2 + frame;
    cache.set(k, indexed(ATLAS, 64, (i % 32) * 64, fl(i / 32) * 64, parsePal(D.palettes[dex][shiny ? 1 : 0])));
  }
  return cache.get(k);
}
function silhouette(dex, frame, color) {
  const k = `h${dex}_${frame}_${color}`;
  if (!cache.has(k)) {
    const src = sprite(dex, frame, false);
    const cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const x = cv.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, 64, 64);
    cache.set(k, cv);
  }
  return cache.get(k);
}
function icon(dex) {
  const k = `i${dex}`;
  if (!cache.has(k)) {
    const i = dex - 1;
    cache.set(k, indexed(ICONS, 32, (i % 32) * 32, fl(i / 32) * 32, parsePal(D.iconPalettes[SP[dex].ip])));
  }
  return cache.get(k);
}
function iconURL(dex) {
  const k = `u${dex}`;
  if (!cache.has(k)) cache.set(k, icon(dex).toDataURL());
  return cache.get(k);
}

// ---------------------------------------------------------------- 戦闘画面
const cv = $('scene');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const scene = { introT0: 0, anim: null, particles: [], resultHold: 0 };

function fitScreen() {
  const w = $('screen').clientWidth;
  $('screenInner').style.transform = `scale(${w / 240})`;
}
new ResizeObserver(fitScreen).observe($('screen'));

const rnd = (i) => { let x = (i * 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };

function bands(cols, y0, y1) {
  const h = (y1 - y0) / cols.length;
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, Math.round(y0 + i * h), 240, Math.ceil(h) + 1); });
}
function ring(x, y, rx, ry, fill, edge, glow) {
  if (glow) { ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(x, y, rx + 5, ry + 3, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = edge; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y + 1, rx - 2, ry - 2, 0, 0, Math.PI * 2); ctx.fill();
}

function drawOrreBg(kind, t) {
  const g = ctx;
  if (kind === 'stadium') {
    bands(['#07040f', '#0c0719', '#120a25', '#1a0f33', '#241543', '#2f1b55'], 0, 36);
    for (let i = 0; i < 40; i++) {
      const tw = (Math.sin(t / 400 + i * 1.7) + 1) / 2;
      g.fillStyle = `rgba(210,200,255,${0.25 + 0.6 * tw * rnd(i + 99)})`;
      g.fillRect(fl(rnd(i) * 240), fl(rnd(i + 7) * 26), 1, 1);
    }
    // 観客席
    const top = (x) => Math.round(36 - 14 * (1 - ((x - 120) / 120) ** 2));
    g.fillStyle = '#0d0818';
    g.beginPath(); g.moveTo(0, 36); g.quadraticCurveTo(120, 8, 240, 36); g.lineTo(240, 60); g.lineTo(0, 60); g.fill();
    const crowd = ['#2a2048', '#3a2d63', '#4a3a7a', '#241b3e', '#5a478f'];
    for (let y = 24; y < 58; y += 2) {
      for (let x = 0; x < 240; x += 2) {
        if (y < top(x) + 2) continue;
        const k = rnd(x * 131 + y);
        if (k < 0.7) { g.fillStyle = crowd[fl(k * 7) % crowd.length]; g.fillRect(x, y, 1, 1); }
      }
    }
    for (let i = 0; i < 3; i++) {
      const k = fl(t / 90) * 7 + i * 31;
      if (rnd(k) < 0.35) {
        const x = fl(rnd(k + 1) * 240);
        g.fillStyle = '#fff';
        g.fillRect(x, top(x) + 3 + fl(rnd(k + 2) * (56 - top(x) - 3)), 1, 1);
      }
    }
    g.fillStyle = '#7b62e0';
    for (let x = 0; x < 240; x++) g.fillRect(x, top(x), 1, 1);
    g.fillStyle = '#b39cff'; g.fillRect(0, 58, 240, 1);
    g.fillStyle = '#4b37a0'; g.fillRect(0, 59, 240, 1);
    // 照明塔
    for (const x of [14, 226]) {
      g.fillStyle = '#1b1230'; g.fillRect(x - 1, 6, 3, 30);
      g.fillStyle = '#fff4c8'; g.fillRect(x - 4, 4, 9, 3);
      g.fillStyle = '#ffd86a'; g.fillRect(x - 4, 7, 9, 1);
    }
    // 床
    bands(['#1b1432', '#171129', '#130e22', '#100b1c', '#0c0816', '#090611'], 60, 112);
    g.strokeStyle = 'rgba(120,96,220,.35)';
    g.lineWidth = 1;
    for (let k = 1; k < 9; k++) {
      const y = Math.round(60 + k * k * 0.75) + 0.5;
      g.beginPath(); g.moveTo(0, y); g.lineTo(240, y); g.stroke();
    }
    for (let k = -8; k <= 8; k++) {
      g.beginPath(); g.moveTo(120 + k * 10 + 0.5, 60); g.lineTo(120 + k * 48 + 0.5, 112); g.stroke();
    }
    // スポットライト
    g.save();
    g.globalCompositeOperation = 'lighter';
    const a = 0.07 + 0.03 * Math.sin(t / 700);
    for (const sx of [14, 226]) {
      g.fillStyle = `rgba(190,170,255,${a})`;
      g.beginPath(); g.moveTo(sx - 3, 6); g.lineTo(sx + 3, 6); g.lineTo(220, 68); g.lineTo(132, 68); g.fill();
    }
    g.restore();
    const pulse = 0.5 + 0.5 * Math.sin(t / 380);
    const glow = `rgba(150,110,255,${0.12 + 0.12 * pulse})`;
    ring(176, 64, 46, 12, '#1d1538', '#9b7bff', glow);
    g.strokeStyle = '#4c3a99';
    g.beginPath(); g.ellipse(176, 65, 30, 6.5, 0, 0, Math.PI * 2); g.stroke();
    ring(58, 110, 66, 16, '#1d1538', '#9b7bff', glow);
    return;
  }
  if (kind === 'rock') {
    bands(['#f7dcaa', '#f3c98c', '#ecb472', '#e29c5a', '#d68748'], 0, 56);
    g.fillStyle = '#fff1c9'; g.beginPath(); g.arc(196, 16, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b8703f';
    g.beginPath(); g.moveTo(0, 56); g.lineTo(0, 30); g.lineTo(26, 26); g.lineTo(30, 36); g.lineTo(58, 36); g.lineTo(66, 56); g.fill();
    g.beginPath(); g.moveTo(140, 56); g.lineTo(150, 24); g.lineTo(186, 20); g.lineTo(192, 32); g.lineTo(240, 30); g.lineTo(240, 56); g.fill();
    g.fillStyle = '#d98f55'; g.fillRect(0, 30, 26, 2); g.fillRect(150, 24, 36, 2); g.fillRect(192, 32, 48, 1);
    bands(['#d9a466', '#cd9657', '#c0884b', '#b27b41', '#a36e38'], 56, 112);
    for (let i = 0; i < 160; i++) { g.fillStyle = rnd(i) < 0.5 ? '#9b6a36' : '#e6b87a'; g.fillRect(fl(rnd(i + 3) * 240), 58 + fl(rnd(i + 5) * 54), 1, 1); }
    ring(176, 64, 46, 12, '#c28d52', '#8f6234');
    ring(58, 110, 66, 16, '#c28d52', '#8f6234');
    return;
  }
  if (kind === 'oasis') {
    bands(['#7fcbee', '#98d6f1', '#b2e1f3', '#cbebf3', '#e2f4f1'], 0, 52);
    for (const [x, h] of [[24, 30], [206, 34], [226, 26]]) {
      g.fillStyle = '#7a5a36'; g.fillRect(x, 52 - h, 2, h);
      g.fillStyle = '#3f8f45';
      for (const k of [-1, 1]) {
        g.beginPath(); g.moveTo(x + 1, 52 - h); g.quadraticCurveTo(x + 1 + k * 10, 48 - h, x + 1 + k * 14, 58 - h); g.lineTo(x + 1 + k * 10, 55 - h); g.fill();
      }
    }
    bands(['#83c25f', '#76b653', '#69a948', '#5d9c3f', '#528f37'], 52, 112);
    g.fillStyle = '#4aaad8'; g.beginPath(); g.ellipse(42, 70, 46, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#bfe8f6'; g.fillRect(24, 68, 14, 1); g.fillRect(50, 71, 10, 1);
    ring(176, 64, 46, 12, '#9ad27a', '#4f8f38');
    ring(58, 110, 66, 16, '#9ad27a', '#4f8f38');
    return;
  }
  // 洞窟
  bands(['#120e0c', '#1a1411', '#221a15', '#2b2119', '#34281e'], 0, 56);
  g.fillStyle = '#0a0807';
  for (let i = 0; i < 12; i++) { const x = i * 21 + fl(rnd(i) * 8); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 12, 0); g.lineTo(x + 6, 10 + fl(rnd(i + 9) * 16)); g.fill(); }
  for (let i = 0; i < 14; i++) {
    const tw = (Math.sin(t / 500 + i) + 1) / 2;
    g.fillStyle = `rgba(120,230,255,${0.35 + 0.5 * tw})`;
    g.fillRect(fl(rnd(i + 50) * 240), 20 + fl(rnd(i + 60) * 34), 1, 2);
  }
  bands(['#3b3027', '#352b23', '#2f261f', '#29211b', '#231c17'], 56, 112);
  for (let i = 0; i < 120; i++) { g.fillStyle = rnd(i) < 0.5 ? '#1c1612' : '#4d4034'; g.fillRect(fl(rnd(i + 3) * 240), 58 + fl(rnd(i + 5) * 54), 1, 1); }
  ring(176, 64, 46, 12, '#55483b', '#2c241d', 'rgba(120,230,255,.08)');
  ring(58, 110, 66, 16, '#55483b', '#2c241d', 'rgba(120,230,255,.08)');
}

function enemyPos() {
  const s = SP[st.dex];
  return { x: 176, y: 40 + s.y - s.e };
}

function drawAura(dex, frame, x, y, t) {
  const pulse = 0.5 + 0.5 * Math.sin(t / 260);
  const dark = silhouette(dex, frame, '#0b0414');
  const purple = silhouette(dex, frame, '#6b2fc4');
  ctx.save();
  ctx.globalAlpha = 0.3 + 0.15 * pulse;
  for (let r = 1; r <= 6; r++) {
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4 + t / 1400;
      ctx.drawImage(dark, x + Math.round(Math.cos(ang) * r), y + Math.round(Math.sin(ang) * r) - (r > 2 ? r - 2 : 0));
    }
  }
  ctx.globalAlpha = 0.35 + 0.2 * pulse;
  for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4;
    ctx.drawImage(purple, x + Math.round(Math.cos(ang) * 2), y + Math.round(Math.sin(ang) * 2));
  }
  ctx.restore();
}

function updateParticles(dex, frame, x, y, dt) {
  const src = sprite(dex, frame, false).opaque;
  const P = scene.particles;
  for (let n = 0; n < 2 && src.length && P.length < 70; n++) {
    const i = fl(Math.random() * (src.length / 2)) * 2;
    P.push({ x: x + src[i], y: y + src[i + 1], vy: -(8 + Math.random() * 14), vx: (Math.random() - 0.5) * 6, life: 0, max: 700 + Math.random() * 700, s: Math.random() < 0.3 ? 2 : Math.random() < 0.5 ? 1 : 3 });
  }
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i];
    p.life += dt;
    if (p.life > p.max) { P.splice(i, 1); continue; }
    p.x += p.vx * dt / 1000;
    p.y += p.vy * dt / 1000;
  }
}
function drawParticles() {
  for (const p of scene.particles) {
    const a = 1 - p.life / p.max;
    ctx.fillStyle = p.s === 2 ? `rgba(130,70,220,${0.6 * a})` : `rgba(8,2,18,${0.9 * a})`;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s + 1, p.s + 1);
  }
}

// ---------------------------------------------------------------- 投げたボールの動き（GBA。battle_anim_throw.c を1コマ=1/60秒でなぞる）
// 投げた時に最後までのコマを全部計算しておき、描画はその表を引くだけにする
const G3F = 1000 / 60;
const G3_FADE = Object.fromEntries(Object.entries({
  poke: [31, 22, 30], great: [16, 23, 30], safari: [23, 30, 20], ultra: [31, 31, 15], master: [23, 20, 28], net: [21, 31, 25],
  dive: [12, 25, 30], nest: [30, 27, 10], repeat: [31, 24, 16], timer: [29, 30, 30], luxury: [31, 17, 10], premier: [31, 9, 10],
}).map(([k, c]) => [k, `rgb(${c.map((v) => Math.round(v * 255 / 31)).join(',')})`]));
const CAPTURE_STARS = [[10, 2, -3], [15, 0, -4], [-10, 2, -4]];
// ボールが開いた時の粒（AnimateBallOpenParticles。ボールごとに飛び方と絵が決まっている）
// 返り値は開いた瞬間からのコマごとの [x, y, 絵の番号, 左右反転] の並び
const PTC_ANIM = { poke: 0, great: 0, safari: 0, ultra: 5, master: 1, net: 2, dive: 2, nest: 3, repeat: 5, timer: 5, luxury: 4, premier: 4 };
const PTC_FUNC = { poke: 'poke', great: 'great', safari: 'fan4', ultra: 'fan10', master: 'master', net: 'fan4', dive: 'dive', nest: 'fan10',
  repeat: 'repeat', timer: 'timer', luxury: 'great', premier: 'premier' };
function ptcFrame(anim, age) {
  if (anim === 0) { const seq = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 0], [1, 0]]; return seq[age % 6]; }
  if (anim === 4) return [fl(age / 4) % 2 ? 7 : 6, 0];
  return [[0, 3, 4, 5, 0, 7][anim], 0];
}
function ballParticles(ball, x, y) {
  const SIN = D.sine;
  const Sin = (i, a) => (a * SIN[i & 255]) >> 8;
  const Cos = (i, a) => (a * SIN[(i & 255) + 64]) >> 8;
  const anim = PTC_ANIM[ball] ?? 0, kind = PTC_FUNC[ball] || 'poke';
  const sprites = [];
  const fan = (n, step, d4, d5, d6) => { for (let i = 0; i < n; i++) sprites.push({ type: 'fan', d0: i * step, d1: 0, d2: 0, d3: 0, d4, d5, d6, age: 0, x2: 0, y2: 0 }); };
  const out = [];
  for (let f = 0; f < 70; f++) {
    // 粒を作る処理（毎コマ動くタスク）
    if (kind === 'poke' && f < 16) sprites.push({ type: 'poke', d0: (f % 8) * 32, d1: 0, first: true, age: 0, x2: 0, y2: 0 });
    if (kind === 'great' && (f === 0 || f === 9)) fan(8, 32, 8, 2, 2);
    if (f === 0) {
      if (kind === 'fan4') fan(8, 32, 4, 1, 1);
      if (kind === 'fan10') fan(10, 25, 5, 1, 1);
      if (kind === 'timer') fan(8, 32, 10, 2, 1);
      if (kind === 'dive') fan(8, 32, 10, 1, 2);
      if (kind === 'master') { fan(8, 32, 8, 2, 1); fan(8, 32, 8, 1, 2); }
      if (kind === 'repeat') for (let i = 0; i < 12; i++) sprites.push({ type: 'repeat', d0: i * 21, d1: 0, d2: 0, d3: 0, age: 0, x2: 0, y2: 0 });
      if (kind === 'premier') for (let i = 0; i < 8; i++) sprites.push({ type: 'premier', d0: i * 32, d1: 0, d2: 0, d3: 0, age: 0, x2: 0, y2: 0 });
    }
    // 粒ごとの動き
    const list = [];
    for (const sp of sprites) {
      if (sp.dead) continue;
      if (sp.type === 'poke') {
        if (sp.first) sp.first = false;
        else {
          sp.x2 = Sin(sp.d0, sp.d1); sp.y2 = Cos(sp.d0, sp.d1);
          sp.d1 += 2;
          if (sp.d1 === 50) sp.dead = true;
        }
      } else if (sp.type === 'fan') {
        sp.x2 = Sin(sp.d0, sp.d1); sp.y2 = Cos(sp.d0, sp.d2);
        sp.d0 = (sp.d0 + sp.d4) & 0xff; sp.d1 += sp.d5; sp.d2 += sp.d6;
        if (++sp.d3 === 51) sp.dead = true;
      } else {
        sp.x2 = Sin(sp.d0, sp.d1);
        sp.y2 = Cos(sp.d0, Sin(sp.type === 'repeat' ? sp.d0 : sp.d0 & 0x3f, sp.d2));
        sp.d0 = (sp.d0 + (sp.type === 'repeat' ? 6 : 10)) & 0xff; sp.d1++; sp.d2++;
        if (++sp.d3 === 51) sp.dead = true;
      }
      if (!sp.dead) list.push([x + sp.x2, y + sp.y2, ...ptcFrame(anim, sp.age)]);
      sp.age++;
    }
    out.push(list);
    if (f > 16 && !list.length) break;
  }
  return out;
}

function gen3Plan(visual, caught, sx, sy, monY, ball, rs) {
  const SIN = D.sine;
  const Sin = (i, a) => (a * SIN[i & 255]) >> 8;
  const Cos = (i, a) => (a * SIN[(i & 255) + 64]) >> 8;
  const F = [], ev = {};
  let bx = sx, by = sy, x2 = 0, y2 = 0, bf = 0, rotU = 0, bvis = true, dark = 0;
  let mScale = 1, mDy = 0, mVis = true, tint = 0, white = 0, stars = null;
  const push = () => F.push({ bx: bx + x2, by: by + y2, bf, rot: -rotU * Math.PI * 2 / 65536, bvis, dark, mScale, mDy, mVis, tint, white, stars });
  push();
  // 手元から相手の基準位置(176, 40-16)へ 34 コマ。まっすぐ進みながら高さ 40 の弧
  const dxv = 176 - sx, dyv = 24 - sy;
  let xd = Math.trunc((Math.abs(dxv) << 8) / 34) & 0xffff, yd = Math.trunc((Math.abs(dyv) << 8) / 34) & 0xffff;
  xd = dxv < 0 ? xd | 1 : xd & ~1;
  yd = dyv < 0 ? yd | 1 : yd & ~1;
  let xa = 0, ya = 0, d7 = 0;
  const d6 = Math.trunc(0x8000 / 34);
  for (let i = 0; i < 34; i++) {
    xa = (xa + xd) & 0xffff; ya = (ya + yd) & 0xffff;
    x2 = xd & 1 ? -(xa >> 8) : xa >> 8;
    y2 = yd & 1 ? -(ya >> 8) : ya >> 8;
    d7 = (d7 + d6) & 0xffff;
    y2 += Sin(d7 >> 8, -40);
    push();
  }
  bx += x2; by += y2; x2 = y2 = 0;
  // 開く（半開き5コマ→全開）。背景は白く飛び、相手はボールの色に染まっていく
  const f0 = F.length;
  ev.open = f0;
  const parts = [{ f0, frames: ballParticles(ball, bx, by - 5) }];
  const whiteAt = (f, start) => Math.min(16, Math.max(0, (f - start) * 2)) / 16;
  const dist = monY - by;
  let acc = 0, scaleV = 256;
  for (let f = f0; ; f++) {
    const k = f - f0;
    bf = k < 5 ? 1 : 2;
    if (k >= 1 && k <= 17) tint = (k - 1) / 16;
    white = k <= 18 ? whiteAt(f, f0) : Math.max(0, 16 - (k - 18) * 2) / 16;
    if (k === 21) ev.trade = f;
    if (k >= 12 && scaleV < 1152) {
      scaleV += 32; acc += Math.trunc(dist * 256 / 28);
      mScale = 256 / scaleV; mDy = -(acc >> 8);
    } else if (scaleV >= 1152) mVis = false;
    if (k >= 41) bf = k < 46 ? 1 : 0;
    push();
    if (k >= 51) break;
  }
  white = 0;
  // 落ちて4回はねる（振幅 40→30→20→10、はね返るたびに速く）
  by += Cos(0, 40); y2 = -Cos(0, 40);
  let state = 0, amp = 40, phase = 0;
  for (;;) {
    let last = false;
    if ((state & 0xff) === 0) {
      y2 = -Cos(phase, amp);
      phase += (state >> 8) + 4;
      if (phase >= 64) {
        amp -= 10; state += 257;
        const n = state >> 8;
        ev['b' + n] = F.length;
        if (n === 4) last = true;
      }
    } else {
      y2 = -Cos(phase, amp);
      phase -= (state >> 8) + 4;
      if (phase <= 0) { phase = 0; state &= ~0xff; }
    }
    if (last) { by += Cos(64, 40); y2 = 0; }
    push();
    if (last) break;
  }
  // ゆれる：右へ8コマ・左へ13コマ・右へ5コマ転がり（1コマ約4.2度、横に 176/256 ドットずつ）、31コマ休む
  const roll = (n, dir) => {
    let sub = 0;
    for (let i = 0; i < n; i++) {
      if (sub > 255) { x2 += dir; sub &= 0xff; } else sub += 176;
      rotU += dir > 0 ? -768 : 768;
      push();
    }
  };
  let dir = 1;
  ev.shakes = [];
  for (let i = 0; i < 30; i++) push();
  for (let n = 0; n < visual; n++) {
    ev.shakes.push(F.length);
    rotU = 0;
    roll(8, dir); push(); roll(13, -dir); roll(5, dir);
    dir = -dir;
    push();
    if (n + 1 < visual || !caught) for (let i = 0; i < 31; i++) push();
  }
  if (caught) {
    // つかまえた：40コマ後にカチッ・暗くなる・星、95コマ後にファンファーレ（ルビー・サファイアはカチッも星もなく、進化と同じファンファーレ）
    const c0 = F.length;
    for (let k = 1; k <= 130; k++) {
      if (k === 40 && !rs) { ev.click = F.length; stars = { f0: F.length, x: bx + x2, y: by + y2 }; }
      dark = rs || k < 40 ? 0 : k < 60 ? 6 / 16 : Math.max(0, 6 - 2 * Math.floor((k - 60) / 3)) / 16;
      if (k === 95) ev.msg = F.length;
      push();
    }
    void c0;
  } else {
    // 出てしまった：開いて、相手がボールの色のまま下から大きくなって出てくる
    const r0 = F.length;
    ev.pop = r0;
    parts.push({ f0: r0, frames: ballParticles(ball, bx + x2, by + y2 - 5) });
    mVis = true; tint = 1;
    for (let k = 0; k <= 30; k++) {
      bf = k < 5 ? 1 : 2;
      bvis = k < 10;
      if (k < 13) { mScale = (40 + 18 * k) / 256; mDy = (4096 - 288 * (k + 1)) >> 8; } else { mScale = 1; mDy = 0; }
      white = k <= 9 ? whiteAt(r0 + k, r0) : Math.max(0, 16 - (k - 9) * 2) / 16;
      tint = k < 10 ? 1 : Math.max(0, 16 - (k - 10)) / 16;
      if (k === 14) ev.msg = F.length;
      push();
    }
  }
  return { F, ev, parts };
}

const easeOut = (x) => 1 - (1 - x) ** 3;

// 後ろ姿のコマ順（エメラルドとFRLGの back_pic_anims より）。THROW_SPEED倍速で再生し、投げる瞬間にボールを放す
const THROW_SPEED = 1;
const BACK_ANIM = {
  em: { idle: 3, throw: [[0, 24], [1, 9], [2, 24], [0, 9], [3, 50]], release: 24 },
  fr: { idle: 0, throw: [[1, 20], [2, 6], [3, 6], [4, 24], [0, 1]], release: 20 },
};
function releaseMs() {
  const g = GAME[st.game];
  return g.gc ? 0 : BACK_ANIM[g.set].release * (1000 / 60) / THROW_SPEED;
}

function draw(t, dt) {
  const game = GAME[st.game];
  const entry = curEntry();
  ctx.clearRect(0, 0, 240, 160);
  if (game.gc) {
    drawOrreBg(entry.bg, t);
  } else {
    const bg = entry.bg === 'tower' ? IMG.bg_all_stadium : IMG['bg_' + game.set + '_' + entry.bg] || IMG['bg_' + game.set + '_' + (game.set === 'em' ? 'plain' : 'grass')];
    if (bg) ctx.drawImage(bg, 0, 0);
    const pl = scene.anim && scene.anim.plan;
    if (pl) {
      const w = pl.F[Math.max(0, Math.min(pl.F.length - 1, fl((t - scene.anim.t0 - scene.anim.rel) / G3F)))].white;
      if (w > 0) { ctx.fillStyle = `rgba(255,255,255,${w})`; ctx.fillRect(0, 0, 240, 112); }
    }
  }
  const { x: cx, y: cy } = enemyPos();
  const since = t - scene.introT0;
  if (!scene.cried && since >= 650) { scene.cried = true; if (since < 1650) cry(st.dex); }
  let mx = cx;
  if (since < 650) mx = -40 + (cx + 40) * easeOut(since / 650);
  let frame = 0;
  if (since > 650 && since < 1500) frame = fl((since - 650) / 140) % 2;
  const an = scene.anim;
  let monScale = 1, monAlpha = 1, monVisible = true, flash = 0;
  let monDy = 0, tintCol = '#ff8080';
  if (an && an.plan) {
    const S = an.plan.F[Math.max(0, Math.min(an.plan.F.length - 1, fl((t - an.t0 - an.rel) / G3F)))];
    monScale = S.mScale; monVisible = S.mVis; flash = S.tint; monDy = S.mDy; tintCol = G3_FADE[an.ball] || G3_FADE.poke;
  } else if (an) {
    const at = t - an.t0 - an.rel;
    if (at > 760 && at < 1060) { monScale = 1 - (at - 760) / 300; flash = 1; }
    else if (at >= 1060 && !(an.done && an.caught === false && at > an.popT)) monVisible = false;
    if (an.done && !an.caught && at > an.popT) {
      const k = Math.min(1, (at - an.popT) / 220);
      monScale = k; monVisible = true; flash = 1 - k;
    }
  }
  // 浮いている相手の影
  // 浮いている相手の影（battle_gfx_sfx_util.c：X はそのまま、Y は基準位置 40 + 29 に 32x8 の影）
  if (SP[st.dex].e > 0 && monVisible && since > 500 && IMG.enemy_shadow && !game.gc) {
    ctx.drawImage(IMG.enemy_shadow, cx - 16, 40 + 29 - 4);
  }
  const sx = Math.round(mx - 32), sy = Math.round(cy - 32);
  const shadowMon = game.gc && entry.kind === 'shadow';
  if (monVisible) {
    if (shadowMon && monScale === 1) drawAura(st.dex, frame, sx, sy, t);
    const img = sprite(st.dex, frame, st.shiny && shinyOK());
    ctx.save();
    if (an && an.plan && (monScale !== 1 || flash || monDy)) {
      const w = 64 * monScale;
      const x0 = Math.round(cx - w / 2), y0 = Math.round(cy + monDy - w / 2);
      ctx.drawImage(img, x0, y0, Math.round(w), Math.round(w));
      if (flash) {
        ctx.globalAlpha = flash;
        ctx.drawImage(silhouette(st.dex, frame, tintCol), x0, y0, Math.round(w), Math.round(w));
      }
    } else if (monScale !== 1) {
      const w = 64 * monScale;
      ctx.globalAlpha = monAlpha;
      ctx.drawImage(img, Math.round(cx - w / 2), Math.round(cy + 16 - 48 * monScale), Math.round(w), Math.round(w));
      if (flash) {
        ctx.globalAlpha = 0.7 * flash;
        const h = silhouette(st.dex, frame, '#ff8080');
        ctx.drawImage(h, Math.round(cx - w / 2), Math.round(cy + 16 - 48 * monScale), Math.round(w), Math.round(w));
      }
    } else {
      ctx.drawImage(img, sx, sy);
    }
    ctx.restore();
  }
  if (shadowMon) {
    if (monVisible && monScale === 1) updateParticles(st.dex, frame, sx, sy, dt);
    else scene.particles.length = 0;
    drawParticles();
  }
  // 主人公
  const back = game.back && IMG['back_' + game.back];
  if (back) {
    const seq = BACK_ANIM[game.set];
    let bf = seq.idle;
    if (an) {
      let at = (t - an.t0) / (1000 / 60) * THROW_SPEED;
      for (const [f, n] of seq.throw) { if (at < n) { bf = f; break; } at -= n; }
    }
    // 日本版の実機画面に合わせて、英語版の配置(48,48)より1ドット左
    ctx.drawImage(back, 0, bf * 64, 64, 64, 47, 48, 64, 64);
  }
  if (an) drawBall(t, cx, cy);
}

function drawBall(t, cx, cy) {
  const an = scene.anim;
  if (an.plan) { drawBallGba(t); return; }
  const at = t - an.t0 - an.rel;
  const img = IMG['ball_' + an.ball + '_spr'];
  if (!img) return;
  const ground = cy + 18;
  let bx, by, fr = 0, rot = 0;
  const x0 = GAME[st.game].gc ? -8 : 86, y0 = GAME[st.game].gc ? 118 : 62;
  if (cue(an, 'throw', at, 200)) sfx('throw');
  if (cue(an, 'trade', at, 760)) sfx('trade');
  if (cue(an, 'b1', at, 1298)) sfx('bounce1');
  if (cue(an, 'b2', at, 1370)) sfx('bounce2');
  for (let i = 0; i < an.visual; i++) if (cue(an, 's' + i, at, 1400 + i * 620 + 60)) sfx('shake');
  if (an.done && an.caught) {
    if (cue(an, 'click', t, an.doneT)) sfx('click');
    if (cue(an, 'jingle', t, an.doneT + 920)) sfx('caught');
  }
  if (an.done && !an.caught && cue(an, 'open', at, an.popT)) sfx('open');
  if (at < 200) return;
  if (at < 760) {
    const k = (at - 200) / 560;
    bx = x0 + (cx - x0) * k;
    by = y0 + (cy - 8 - y0) * k - Math.sin(k * Math.PI) * 38;
    rot = k * 6;
  } else if (at < 1060) {
    bx = cx; by = cy - 8; fr = 1;
  } else if (at < 1400) {
    const k = (at - 1060) / 340;
    bx = cx;
    const d = ground - (cy - 8);
    by = k < 0.7 ? cy - 8 + d * (k / 0.7) ** 2 : ground - Math.sin((k - 0.7) / 0.3 * Math.PI) * 5;
  } else {
    bx = cx; by = ground;
    const s = at - 1400;
    const idx = fl(s / 620);
    if (idx < an.visual) {
      const u = (s % 620) / 620;
      if (u < 0.6) rot = Math.sin(u / 0.6 * Math.PI * 2) * 0.45 * (idx % 2 ? -1 : 1);
    } else if (!an.done) {
      finishThrow(t);
    }
    if (an.done && !an.caught && at > an.popT) fr = 1;
    if (an.done && !an.caught && at > an.popT + 260) return;
  }
  ctx.save();
  ctx.translate(Math.round(bx), Math.round(by));
  ctx.rotate(rot);
  if (an.done && an.caught) ctx.filter = 'brightness(.55)';
  ctx.drawImage(img, 0, fr * 16, 16, 16, -8, -8, 16, 16);
  ctx.restore();
  if (an.done && an.caught) {
    const s = t - an.doneT;
    if (s < 900) {
      ctx.fillStyle = '#fff8b0';
      for (let i = 0; i < 3; i++) {
        const k = s / 900;
        const px = bx + (i - 1) * 10 * (0.4 + k), py = by - 6 - k * 16 - (i === 1 ? 4 : 0);
        ctx.globalAlpha = 1 - k;
        ctx.fillRect(Math.round(px) - 1, Math.round(py), 3, 1);
        ctx.fillRect(Math.round(px), Math.round(py) - 1, 1, 3);
      }
      ctx.globalAlpha = 1;
    }
  }
}

function drawBallGba(t) {
  const an = scene.anim, P = an.plan;
  const f = fl((t - an.t0 - an.rel) / G3F);
  const ev = P.ev;
  if (cue(an, 'throw', f, 0)) sfx('throw');
  if (cue(an, 'open', f, ev.open)) sfx('open');
  if (cue(an, 'trade', f, ev.trade)) sfx('trade');
  for (let n = 1; n <= 4; n++) if (cue(an, 'b' + n, f, ev['b' + n])) sfx('bounce' + n);
  ev.shakes.forEach((sf, i) => { if (cue(an, 's' + i, f, sf)) sfx('shake'); });
  if (ev.click !== undefined && cue(an, 'click', f, ev.click)) sfx('click');
  if (ev.pop !== undefined && cue(an, 'pop', f, ev.pop)) sfx('open');
  if (cue(an, 'msg', f, ev.msg)) { finishThrow(t); if (an.caught) sfx(an.rs ? 'caught_rs' : 'caught'); }
  const S = P.F[Math.max(0, Math.min(P.F.length - 1, f))];
  const ptc = IMG.ball_particles;
  if (ptc) {
    for (const g of P.parts) {
      const list = g.frames[f - g.f0];
      if (!list) continue;
      for (const [px, py, fr, hf] of list) {
        ctx.save();
        ctx.translate(Math.round(px), Math.round(py));
        if (hf) ctx.scale(-1, 1);
        ctx.drawImage(ptc, 0, fr * 8, 8, 8, -4, -4, 8, 8);
        ctx.restore();
      }
    }
  }
  const img = IMG['ball_' + an.ball + '_spr'];
  if (!img || !S.bvis) return;
  // 投げる前は手の中（投げる動きの間だけ見える）
  if (f < 0 && t - an.t0 < 0) return;
  ctx.save();
  ctx.translate(Math.round(S.bx), Math.round(S.by));
  ctx.rotate(S.rot);
  ctx.drawImage(img, 0, S.bf * 16, 16, 16, -8, -8, 16, 16);
  if (S.dark > 0) {
    ctx.globalAlpha = S.dark;
    ctx.drawImage(silhouetteOf(img, S.bf, '#000000'), -8, -8, 16, 16);
  }
  ctx.restore();
  if (S.stars && ptc) {
    // 3つの星がそれぞれ弧を描いて飛び、1コマおきに点滅する（MakeCaptureStars）
    const k = f - S.stars.f0;
    if (k >= 0 && k < 24 && k % 2 === 1) {
      for (const [ox, oy, amp] of CAPTURE_STARS) {
        const u = (k + 1) / 24;
        const px = S.stars.x + ox * u;
        const py = S.stars.y + oy * u + ((amp * D.sine[((k + 1) * Math.trunc(0x8000 / 24)) >> 8 & 255]) >> 8);
        ctx.drawImage(ptc, 0, 3 * 8, 8, 8, Math.round(px) - 4, Math.round(py) - 4, 8, 8);
      }
    }
  }
}
function silhouetteOf(img, frame, color) {
  const k = `bs${img.src ? img.src.length : 0}_${frame}_${color}`;
  if (!cache.has(k)) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 16;
    const x = cv.getContext('2d');
    x.drawImage(img, 0, frame * 16, 16, 16, 0, 0, 16, 16);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, 16, 16);
    cache.set(k, cv);
  }
  return cache.get(k);
}

let last = 0;
function loop(t) {
  const dt = last ? Math.min(100, t - last) : 16;
  last = t;
  if (ATLAS) draw(t, dt);
  if (scene.anim && scene.anim.done && t - scene.anim.doneT > (scene.anim.caught ? 4800 : 1400)) {
    const caught = scene.anim.caught;
    scene.anim = null;
    $('btnThrow').disabled = false;
    if (caught) { scene.introT0 = t; scene.cried = false; setMsg(introMsg()); }
  }
  requestAnimationFrame(loop);
}

function shinyOK() {
  return !(GAME[st.game].gc && curEntry().kind === 'shadow');
}

// ---------------------------------------------------------------- 効果音（pretのMIDIと音色から書き出したもの）
const SFX = { ctx: null, buf: {}, on: false };
try { SFX.on = localStorage.getItem('gen3catch.sfx') === '1'; } catch (e) { /* 保存できない環境 */ }
async function sfxInit() {
  if (SFX.ctx) { if (SFX.ctx.state === 'suspended') SFX.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  SFX.ctx = new AC();
  await Promise.all(Object.keys(A).filter((k) => k.startsWith('sfx_')).map(async (k) => {
    const bin = Uint8Array.from(atob(A[k].split(',')[1]), (c) => c.charCodeAt(0));
    SFX.buf[k.slice(4)] = await SFX.ctx.decodeAudioData(bin.buffer);
  }));
}
function sfx(name) {
  playBuf(SFX.buf[name]);
}
function playBuf(buf) {
  if (!SFX.on || !SFX.ctx || !buf) return;
  const src = SFX.ctx.createBufferSource();
  src.buffer = buf;
  const g = SFX.ctx.createGain();
  g.gain.value = 0.55;
  src.connect(g).connect(SFX.ctx.destination);
  src.start();
}
// 鳴き声（cries/NNN.wav。はじめて鳴らすときに読み込む）
const CRY = {};
function loadCry(dex) {
  if (!SFX.ctx) return null;
  if (!CRY[dex]) {
    CRY[dex] = fetch(`cries/${String(dex).padStart(3, '0')}.wav`).then((r) => r.arrayBuffer())
      .then((b) => SFX.ctx.decodeAudioData(b)).catch(() => null);
  }
  return CRY[dex];
}
function cry(dex) {
  const p = SFX.on && loadCry(dex);
  if (p) p.then(playBuf);
}
// アニメの経過時間がしきい値を越えた瞬間に1回だけ鳴らす
function cue(an, key, at, when) {
  if (at >= when && !an.fired[key]) { an.fired[key] = true; return true; }
  return false;
}

function setMsg(s) { $('msgText').textContent = s; drawMessage(s); }
function introMsg() {
  const e = curEntry();
  const name = SP[st.dex].name;
  if (e.kind === 'shadow') return 'あ！ ダークポケモンだ！';
  // 伝説戦（BATTLE_TYPE_LEGENDARY）だけ「あらわれた」。はいかいや他の固定シンボルは通常の野生と同じ
  if (e.kind === 'static' && LEGEND_STATIC.includes(st.dex)) return `あ！ やせいの\n${name}が あらわれた！`;
  return `あ！ やせいの\n${name}が とびだしてきた！`;
}

const LEGEND_STATIC = [144, 145, 146, 150, 151, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 386];
const PLAYER_NAME = { R: 'ユウキ', S: 'ハルカ', E: 'ユウキ', FR: 'レッド', LG: 'リーフ', ALL: 'ミツル' };

const FAIL_MSG = [
  'だめだ！ ポケモンが\nボールから でてしまった！',
  'ああ！ つかまえたと\nおもったのに！',
  'ざんねん！ もうすこしで\nつかまえられたのに！',
  'おしい！ あと ちょっとの\nところだったのに！',
];

function throwBall() {
  if (scene.anim) return;
  const c = ctxNow();
  const r = calc(c, st.ball);
  if (!r) return;
  let k = 0;
  if (r.p >= 1) k = 4;
  else while (k < 4 && Math.random() < r.p1) k++;
  const caught = k === 4;
  const gc = GAME[st.game].gc;
  // コロシアム/XDは判定1回目・2回目の失敗がどちらも「1回ゆれて出る」
  const visual = caught ? 3 : gc ? Math.max(1, k) : k;
  scene.gc = gc;
  scene.anim = { t0: performance.now(), rel: releaseMs(), ball: st.ball, k, caught, visual, done: false, fired: {} };
  // 投げ始めの位置：GBA は主人公の手元、コロシアム/XD は手前の味方の台座の上から
  const hand = gc ? [58, 96] : GAME[st.game].back === 'wally' ? [64, 91] : GAME[st.game].set === 'fr' ? [55, st.game === 'LG' ? 93 : 91] : [55, 85];
  scene.anim.plan = gen3Plan(visual, caught, hand[0], hand[1], enemyPos().y, st.ball, st.game === 'R' || st.game === 'S');
  scene.anim.rs = st.game === 'R' || st.game === 'S';
  scene.particles.length = 0;
  $('btnThrow').disabled = true;
  const ball = gc && curEntry().kind === 'shadow' ? 'スナッチボール' : `${BALL[st.ball].name}ボール`;
  setMsg(gc ? `${ball}を なげた！` : `${PLAYER_NAME[st.game]}は\n${ball}を つかった！`);
}

function finishThrow(t) {
  const an = scene.anim;
  an.done = true;
  an.doneT = t;
  an.popT = t - an.t0 - an.rel + 60;
  const name = SP[st.dex].name;
  tally.n++;
  if (an.caught) {
    tally.ok++;
    const gc = GAME[st.game].gc && curEntry().kind === 'shadow';
    setMsg(gc ? `やったー！\n${name}を スナッチした！` : `やったー！\n${name}を つかまえたぞ！`);
  } else {
    setMsg(FAIL_MSG[an.k]);
  }
  renderTally();
}

function renderTally() {
  $('tally').textContent = tally.n ? `${tally.n}回投げて${tally.ok}匹（${(tally.ok / tally.n * 100).toFixed(1)}%）` : 'まだ投げていません';
}

// ---------------------------------------------------------------- 画面更新
let ENTRIES = [];
function curEntry() { return ENTRIES[st.entry] || ENTRIES[0]; }

function refreshEntries(keepLevel) {
  ENTRIES = entriesFor(st.game, st.dex, st.free);
  if (st.entry >= ENTRIES.length) st.entry = 0;
  const e = curEntry();
  if (!keepLevel || st.level < e.min || st.level > e.max) st.level = e.free ? 50 : e.min;
  if (e.safari) st.ball = 'safari';
  else if (st.ball === 'safari' || (GAME[st.game].gc && st.ball === 'safari')) st.ball = 'ultra';
}

function renderGames() {
  const nav = $('games');
  nav.innerHTML = '';
  for (const g of GAMES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'game';
    b.style.setProperty('--c', g.color);
    b.textContent = g.name;
    b.setAttribute('aria-pressed', String(g.id === st.game));
    b.addEventListener('click', () => setGame(g.id));
    nav.append(b);
  }
}

function setGame(id) {
  st.game = id;
  st.free = GAME[id].all ? true : $('optFree').checked;
  $('freeWrap').hidden = !!GAME[id].all;
  $('intlWrap').hidden = id !== 'CO';
  st.dex = GAME[id].def;
  st.entry = 0; st.acts = []; st.repeat = false;
  refreshEntries(false);
  renderGames();
  const g = GAME[id];
  const msg = $('msg');
  msg.className = 'msg' + (g.gc ? ' gc' : g.set === 'fr' ? ' fr' : '');
  msg.style.backgroundImage = g.gc ? '' : `url(${A['textbox_' + g.tb]})`;
  $('hb').classList.toggle('gc', !!g.gc);
  $('throwIcon').src = A['ball_' + st.ball];
  intro();
  renderAll();
}

function setMon(dex) {
  st.dex = dex;
  st.entry = 0; st.acts = [];
  refreshEntries(false);
  intro();
  renderAll();
}

function intro() {
  scene.introT0 = performance.now();
  scene.cried = false;
  if (SFX.on) sfxInit().then(() => loadCry(st.dex));
  scene.anim = null;
  scene.particles.length = 0;
  $('btnThrow').disabled = false;
  tally.n = tally.ok = 0;
  renderTally();
  setMsg(introMsg());
}

function renderMonField() {
  const s = SP[st.dex];
  $('monInput').value = `${String(st.dex).padStart(3, '0')} ${s.name}`;
  const ic = $('monIcon').getContext('2d');
  ic.clearRect(0, 0, 32, 32);
  if (ICONS) ic.drawImage(icon(st.dex), 0, 0);
  const e = curEntry();
  const meta = $('monMeta');
  meta.innerHTML = '';
  for (const t of s.types) {
    const b = document.createElement('span');
    b.className = 'type';
    b.style.background = TYPE_COLOR[t];
    b.textContent = t;
    meta.append(b);
  }
  const rate = document.createElement('span');
  rate.innerHTML = `捕獲率 <b>${e.rate != null ? e.rate : s.rate}</b>`;
  meta.append(rate);
  const hp = document.createElement('span');
  hp.textContent = `HP種族値 ${s.hp}`;
  meta.append(hp);
  if (e.kind === 'shadow') {
    const p = document.createElement('span');
    p.className = 'pill dark';
    p.textContent = 'ダークポケモン';
    meta.append(p);
  }
}

function placeIcon(e) {
  if (e.kind === 'shadow') return 'shadow';
  if (e.kind === 'spot') return 'spot';
  if (e.kind === 'static') return 'static';
  if (e.kind === 'roam') return 'roam';
  if (e.free && !e.safari && !e.underwater && !ICON[e.method]) return 'free';
  const m = e.method;
  if (m === 'old' || m === 'good' || m === 'super') return 'rod';
  return ICON[m] ? m : 'land';
}

function renderPlaces() {
  const box = $('places');
  box.innerHTML = '';
  $('placeLabel').textContent = GAME[st.game].gc ? '出会う相手' : '出会う場所';
  $('placeCount').textContent = st.free ? '条件を無視して計算中' : `${ENTRIES.length}件`;
  ENTRIES.forEach((e, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'place';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(i === st.entry));
    const lv = e.min === e.max ? `Lv${e.min}` : `Lv${e.min}–${e.max}`;
    const pct = e.pct != null ? `<small>${e.pct}%</small>` : e.rate != null ? `<small>捕獲率${e.rate}</small>` : '';
    b.innerHTML = `${svg(placeIcon(e))}<span class="pn">${e.title}${e.sub ? `<small>${e.sub}</small>` : ''}</span><span class="pr">${lv}${pct}</span>`;
    b.addEventListener('click', () => {
      st.entry = i; st.acts = [];
      refreshEntries(true);
      intro();
      renderAll();
    });
    box.append(b);
  });
}

function renderSliders(c) {
  const ok = shinyOK();
  $('optShiny').disabled = !ok;
  $('shinyWrap').title = ok ? '' : 'ダークポケモンは色違いにならないため選べません';
  const e = c.entry;
  const lv = $('lvRange');
  lv.min = e.min; lv.max = e.max; lv.value = st.level;
  lv.disabled = e.min === e.max;
  $('lvOut').textContent = 'Lv' + st.level;
  $('ivRange').value = st.iv;
  $('ivOut').textContent = st.iv;
  const hp = $('hpRange');
  hp.max = c.M; hp.value = c.H;
  hp.disabled = !!e.safari;
  $('hpOut').textContent = `${c.H} / ${c.M}`;
  $('hpChips').querySelectorAll('button').forEach((b) => { b.disabled = !!e.safari; });
  $('hpHint').textContent = e.safari ? 'サファリゾーンでは攻撃できないので、HPはまんタンのまま' : '画面のHPバーをドラッグしても変えられます';
}

// ---------------------------------------------------------------- ゲームの小フォント
// 1文字は 8x12 の升目で、字は 4〜11 行目に描かれている。升目のまま並べると下に寄るので 3〜12 行目だけ使う
const FONT_TOP = 3, FONT_H = 10;
function glyph(ch, fg, sh) {
  const k = `g${ch}_${fg}_${sh}`;
  if (!cache.has(k)) {
    const code = D.fontCodes[ch];
    const cvg = document.createElement('canvas');
    cvg.width = 8; cvg.height = FONT_H;
    if (code != null && FONT) {
      const x = cvg.getContext('2d');
      const out = x.createImageData(8, FONT_H);
      const col = { 1: fg, 2: sh };
      for (let y = 0; y < FONT_H; y++) {
        for (let xx = 0; xx < 8; xx++) {
          const v = (FONT.d[(((code >> 4) * 16 + FONT_TOP + y) * FONT.w + (code & 15) * 8 + xx) * 4] + 8) >> 4;
          const cc = col[v];
          if (!cc) continue;
          const o = (y * 8 + xx) * 4;
          out.data[o] = cc[0]; out.data[o + 1] = cc[1]; out.data[o + 2] = cc[2]; out.data[o + 3] = cc[3] ?? 255;
        }
      }
      x.putImageData(out, 0, 0);
    }
    cache.set(k, cvg);
  }
  return cache.get(k);
}
function glyphOf(sheet, tag, ch, top, h, fg, sh) {
  const k = `${tag}${ch}_${fg}_${sh}`;
  if (!cache.has(k)) {
    const code = D.fontCodes[ch];
    const cvg = document.createElement('canvas');
    cvg.width = 8; cvg.height = h;
    if (code != null && code !== 0 && sheet) {
      const x = cvg.getContext('2d');
      const out = x.createImageData(8, h);
      const col = { 1: fg, 2: sh };
      for (let y = 0; y < h; y++) {
        for (let xx = 0; xx < 8; xx++) {
          const v = (sheet.d[(((code >> 4) * 16 + top + y) * sheet.w + (code & 15) * 8 + xx) * 4] + 8) >> 4;
          const cc = col[v];
          if (!cc) continue;
          const o = (y * 8 + xx) * 4;
          out.data[o] = cc[0]; out.data[o + 1] = cc[1]; out.data[o + 2] = cc[2]; out.data[o + 3] = 255;
        }
      }
      x.putImageData(out, 0, 0);
    }
    cache.set(k, cvg);
  }
  return cache.get(k);
}

// メッセージ窓（battle_message.c の B_WIN_MSG：エメラルドは窓(16,120)・文字(0,1)、FRLGは窓(8,120)・文字(2,2)・行間2）
function drawMessage(text) {
  const g = GAME[st.game];
  const cvs = $('msgCv');
  if (g.gc || !FONT_N) return;
  const fr = g.set === 'fr';
  const ox = fr ? 10 : 15, oy = fr ? 2 : 1;
  cvs.style.left = (ox - 8) + 'px';
  cvs.style.top = (8 + oy) + 'px';
  const x = cvs.getContext('2d');
  x.clearRect(0, 0, cvs.width, cvs.height);
  const fgc = [255, 255, 255], shc = [106, 90, 115];
  text.split('\n').forEach((line, row) => {
    if (fr && FONT_FR) {
      // FRLG は独自フォント：升目 16x16 の上 12 行、送りは文字ごとの幅（全角空白は 10）、行の送りは 14+2
      let cx = 8;
      for (const ch of line) {
        x.drawImage(glyphFR(ch, fgc, shc), cx, row * 16);
        const code = D.fontCodes[ch];
        cx += code ? D.frFontWidths[code] ?? 10 : 10;
      }
    } else {
      [...line].forEach((ch, i) => x.drawImage(glyphOf(FONT_N, 'n', ch, 0, 16, fgc, shc), 8 + i * 8, row * 16));
    }
  });
}
function glyphFR(ch, fg, sh) {
  const k = `fr${ch}_${fg}_${sh}`;
  if (!cache.has(k)) {
    const code = D.fontCodes[ch];
    const cvg = document.createElement('canvas');
    cvg.width = 16; cvg.height = 12;
    if (code) {
      const x = cvg.getContext('2d');
      const out = x.createImageData(16, 12);
      const col = { 1: fg, 2: sh };
      for (let y = 0; y < 12; y++) {
        for (let xx = 0; xx < 16; xx++) {
          const v = (FONT_FR.d[(((code >> 4) * 16 + y) * FONT_FR.w + (code & 15) * 16 + xx) * 4] + 8) >> 4;
          const cc = col[v];
          if (!cc) continue;
          const o = (y * 16 + xx) * 4;
          out.data[o] = cc[0]; out.data[o + 1] = cc[1]; out.data[o + 2] = cc[2]; out.data[o + 3] = 255;
        }
      }
      x.putImageData(out, 0, 0);
    }
    cache.set(k, cvg);
  }
  return cache.get(k);
}

function drawText(cvs, str, fg, sh, advance = 8) {
  cvs.width = Math.max(1, str.length * advance);
  cvs.height = FONT_H;
  cvs.style.width = cvs.width + 'px';
  cvs.style.height = FONT_H + 'px';
  const x = cvs.getContext('2d');
  x.clearRect(0, 0, cvs.width, FONT_H);
  [...str].forEach((ch, i) => x.drawImage(glyph(ch, fg, sh), i * advance, 0));
  cvs.setAttribute('aria-label', str);
}

// 相手の体力ゲージ。日本版の枠画像（Lv 描き込み済み）を使い、位置は実機画面と重ねて合わせた（枠の左上が画面(11,14)）
function hpPixels(H, M) {
  if (H >= M) return 48;
  return Math.max(H > 0 ? 1 : 0, fl(H * 48 / M));
}
function drawGlyphs(g, str, x, y, fg, sh) {
  // 升目の上端が y。glyph() は升目の3行目から切り出しているのでその分下げる
  [...str].forEach((ch, i) => g.drawImage(glyph(ch, fg, sh), x + i * 8, y + FONT_TOP));
}
function renderGbaHealthbox(c) {
  const cvs = $('hbGba');
  const g = cvs.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 128, 32);
  const boxImg = IMG.hb_box_jp || IMG.hb_box;
  if (!boxImg) return;
  g.drawImage(boxImg, 0, 0);
  const fg = [65, 65, 65], sh = [222, 213, 180];
  drawGlyphs(g, SP[st.dex].name, 8, 4, fg, sh);
  // レベル：日本版は枠に描かれた「Lv」のあとに2x2ドットの「:」と太字の数字を8ドット送りで並べる（Lv100は「:」なし）
  const bold = (ch, x) => g.drawImage(glyphOf(FONT_B, 'b', ch, 8, 8, fg, sh), x, 8);
  if (st.level >= 100) {
    [...'100'].forEach((d, i) => bold(d, 64 + i * 8));
  } else {
    for (const y of [10, 13]) {
      g.fillStyle = `rgb(${sh})`;
      g.fillRect(68, y + 1, 2, 2);
      g.fillStyle = `rgb(${fg})`;
      g.fillRect(67, y, 2, 2);
    }
    [...String(st.level)].forEach((d, i) => bold(d, 72 + i * 8));
  }
  // HPバー：「H」「P」の2マス＋残量6マス。状態異常があると「HP」の代わりに状態アイコン
  const hasStatus = c.status !== 'none';
  if (hasStatus) {
    g.drawImage(IMG.hb_bar, 0, 0, 8, 8, 24, 16, 8, 8);
    g.drawImage(IMG.hb_frameend, 32, 16);
  } else {
    g.drawImage(IMG.hb_bar, 8, 0, 16, 8, 24, 16, 16, 8);
  }
  const px = hpPixels(c.H, c.M);
  const color = c.H >= c.M || px > 24 ? 'g' : px > 9 ? 'y' : 'r';
  for (let t = 0; t < 6; t++) {
    const f = Math.max(0, Math.min(8, px - t * 8));
    if (color === 'g') g.drawImage(IMG.hb_bar, (3 + f) * 8, 0, 8, 8, 40 + t * 8, 16, 8, 8);
    else g.drawImage(IMG.hb_bar_anim, ((color === 'y' ? 0 : 9) + f) * 8, 0, 8, 8, 40 + t * 8, 16, 8, 8);
  }
  // 状態異常のときは捕まえたことがある印を出さない
  if (hasStatus) {
    const ICON_ROW = { psn: 0, par: 1, slp: 2, frz: 3, brn: 4 };
    g.drawImage(IMG.status_jp, 0, ICON_ROW[c.status] * 8, 24, 8, 8, 16, 24, 8);
  } else if (st.repeat) {
    g.drawImage(IMG.caught, 8, 16);
  }
  const hit = $('hbHit');
  hit.setAttribute('aria-valuemax', c.M);
  hit.setAttribute('aria-valuenow', c.H);
}

function renderHealthbox(c) {
  const gba = !GAME[st.game].gc;
  $('hb').hidden = gba;
  $('hbGba').hidden = !gba;
  $('hbHit').hidden = !gba;
  if (gba) {
    renderGbaHealthbox(c);
    return;
  }
  const s = SP[st.dex];
  const gcBox = true;
  const fg = gcBox ? [244, 240, 255] : [64, 72, 64];
  const sh = gcBox ? [90, 74, 138] : [216, 208, 168];
  drawText($('hbName'), s.name, fg, sh);
  drawText($('hbLv'), '' + st.level, fg, sh);
  const px = c.H >= c.M ? 48 : Math.max(c.H > 0 ? 1 : 0, fl(c.H * 48 / c.M));
  const fill = $('hbFill');
  fill.style.width = (px / 48 * 100) + '%';
  const col = px > 24 ? ['#70f8a8', '#58d080'] : px > 9 ? ['#f8e038', '#c8a808'] : ['#f85838', '#a84048'];
  fill.style.background = col[0];
  fill.style.boxShadow = `inset 0 -1px 0 ${col[1]}`;
  const stEl = $('hbStatus');
  const stv = STAT[c.status];
  // 状態アイコンは日本版ROMの画像
  stEl.innerHTML = '';
  const ICON_ROW = { psn: 0, par: 1, slp: 2, frz: 3, brn: 4 };
  if (c.status !== 'none' && IMG.status_jp) {
    const cvs = document.createElement('canvas');
    cvs.width = 24; cvs.height = 8;
    cvs.getContext('2d').drawImage(IMG.status_jp, 0, ICON_ROW[c.status] * 8, 24, 8, 0, 0, 24, 8);
    cvs.setAttribute('aria-label', stv.name);
    stEl.append(cvs);
  }
  // 捕まえたことがあるならボールのマークを出す（状態異常があっても出す）
  const caught = $('hbCaught');
  caught.src = A.caught;
  caught.hidden = !(st.repeat && !GAME[st.game].gc);
  const bar = $('hbBar');
  bar.setAttribute('aria-valuemax', c.M);
  bar.setAttribute('aria-valuenow', c.H);
}

function renderStatus(c) {
  const box = $('statusGrid');
  box.innerHTML = '';
  for (const s of STATUS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'st';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(c.status === s.id));
    b.disabled = !!c.entry.safari && s.id !== 'none';
    b.innerHTML = `<span class="badge" style="background:${s.color}">${s.name}</span><span class="mul">${s.mul}</span>`;
    b.addEventListener('click', () => { st.status = s.id; renderAll(); });
    box.append(b);
  }
  $('stNote').textContent = c.entry.safari ? 'サファリでは変えられません' : '';
}

function pctText(p) {
  if (p >= 1) return '100';
  if (p <= 0) return '0';
  if (p >= 0.9995) return (p * 100).toFixed(2);
  if (p < 0.001) return (p * 100).toFixed(3);
  return (p * 100).toFixed(1);
}

function renderBalls(c) {
  const box = $('ballGrid');
  box.innerHTML = '';
  let best = null, bestP = -1;
  const rows = [];
  for (const b of BALLS) {
    const info = ballInfo(b.id, c);
    if (!info) continue;
    const r = info.off ? null : calc(c, b.id);
    rows.push({ b, info, r });
    if (r && b.id !== 'master' && r.p > bestP + 1e-12) { bestP = r.p; best = b.id; }
  }
  if (!ballInfo(st.ball, c) || ballInfo(st.ball, c).off) st.ball = rows.find((x) => !x.info.off && x.b.id !== 'master')?.b.id || 'master';
  for (const { b, info, r } of rows) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ball' + (b.id === best && rows.filter((x) => x.r).length > 2 ? ' best' : '');
    el.setAttribute('role', 'radio');
    el.setAttribute('aria-checked', String(st.ball === b.id));
    el.disabled = !!info.off;
    el.title = info.off || '';
    const mul = info.master ? '確定' : info.off ? '—' : '×' + (info.m / 10).toFixed(1);
    const p = r ? pctText(r.p) + '%' : '';
    el.innerHTML = `<img src="${A['ball_' + b.id]}" alt=""><span class="bn">${b.name}</span><span class="bm">${mul}</span><span class="bp">${p}</span>`;
    el.addEventListener('click', () => { st.ball = b.id; $('throwIcon').src = A['ball_' + b.id]; renderAll(); });
    box.append(el);
  }
  $('throwIcon').src = A['ball_' + st.ball];
}

function renderConditions(c) {
  const e = c.entry;
  const g = GAME[st.game];
  $('condTimer').hidden = !!e.safari;
  $('turnRange').value = st.turn;
  $('turnOut').textContent = st.turn >= 31 ? '31ターン目以降' : st.turn + 'ターン目';
  const shadow = g.gc && e.kind === 'shadow';
  $('condRepeat').hidden = !!e.safari;
  const rep = $('optRepeat');
  rep.checked = st.repeat && !shadow;
  rep.disabled = shadow;
  if (shadow) {
    $('repeatLabel').textContent = '過去につかまえたことがある';
  } else if (g.gc) {
    $('repeatLabel').textContent = 'リピートボールが3倍になる状態';
  } else {
    $('repeatLabel').textContent = '図鑑で「つかまえた」になっている';
  }
  const saf = $('condSafari');
  saf.hidden = !e.safari;
  if (e.safari && c.safari) {
    const em = g.set === 'em';
    const s = c.safari;
    const btns = $('safariBtns');
    btns.innerHTML = '';
    const mk = (icon, label, fn, cls) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (cls) b.className = cls;
      b.innerHTML = `${svg(icon)}<span>${label}</span>`;
      b.addEventListener('click', () => { fn(); renderAll(); });
      btns.append(b);
    };
    if (em) {
      mk('near', 'ちかづく', () => st.acts.push('near'), 'primary');
      mk('pkbl', 'ポロック', () => st.acts.push('pkbl'), 'primary');
    } else {
      mk('rock', 'いし', () => st.acts.push('rock'), 'primary');
      mk('bait', 'エサ', () => st.acts.push('bait'), 'primary');
    }
    mk('undo', 'ひとつ戻す', () => st.acts.pop());
    mk('reset', '最初から', () => { st.acts = []; });
    const seg = $('pkblSeg');
    seg.hidden = !em;
    if (em) {
      seg.innerHTML = '';
      for (const [k, label] of Object.entries(PKBL_REACT)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(st.pkbl === k));
        b.textContent = 'ポロックに' + label;
        b.addEventListener('click', () => { st.pkbl = k; renderAll(); });
        seg.append(b);
      }
    }
    $('safariFactor').textContent = `捕獲率 ${s.rate}`;
    $('mCatch').style.width = (s.f / 20 * 100) + '%';
    $('mCatchV').textContent = s.f + '/20';
    $('mFlee').style.width = s.flee + '%';
    $('mFleeV').textContent = s.flee + '%';
    const log = $('safariLog');
    log.innerHTML = `<li>はじめ<b>${s.f0}</b></li>` + s.log.map((x) => `<li>${SAFARI_ACT[x.a]}<b>${x.f}</b></li>`).join('');
    // 最大期待値
    const res = solveSafari(c.dex, st.balls);
    $('sbBalls').value = st.balls;
    $('sbBallsOut').textContent = st.balls;
    $('sbNum').innerHTML = `${pctText(res.best)}<small>%</small>`;
    $('sbSub').textContent = `ボールだけ投げ続けると ${pctText(res.only)}%`;
    const steps = [];
    for (const a of res.path) {
      const lastStep = steps[steps.length - 1];
      if (lastStep && lastStep.a === a) lastStep.n++;
      else steps.push({ a, n: 1 });
    }
    $('sbPath').innerHTML = steps.map((x) => `<li class="${x.a === 'ball' ? 'ball' : ''}">${SAFARI_ACT[x.a]}${x.n > 1 ? ' ×' + x.n : ''}</li>`).join('<span class="arr" aria-hidden="true">→</span>') + (res.path.length >= 14 ? '<span class="arr" aria-hidden="true">…</span>' : '');
  }
}

function fmtN(n) {
  if (n == null || !isFinite(n)) return '—';
  return n >= 10000 ? n.toLocaleString('ja-JP') : String(n);
}

function renderResult(c) {
  const sr = series(c, st.ball);
  const r = sr.base;
  $('pct').innerHTML = `${pctText(r.p)}<small>%</small>`;
  $('kExp').innerHTML = isFinite(sr.exp) ? `${sr.exp < 100 ? sr.exp.toFixed(2) : Math.round(sr.exp).toLocaleString('ja-JP')}<small>個</small>` : '—';
  for (const P of [50, 90, 99]) $('k' + P).innerHTML = sr.need[P] != null ? `${fmtN(sr.need[P])}<small>個</small>` : '—';

  // ゆれ方
  const gc = GAME[st.game].gc;
  const p1 = r.p1;
  const q = 1 - p1;
  let parts;
  if (r.p >= 1) parts = [[0, 0], [0, 0], [0, 0], [0, 0], [1, 1]];
  else parts = [[q, 0], [p1 * q, 1], [p1 * p1 * q, 2], [p1 ** 3 * q, 3], [p1 ** 4, 4]];
  const cols = ['#c9432f', '#d77a36', '#d6a53a', '#9fae3d', 'var(--accent)'];
  let segs;
  if (gc) {
    segs = [
      { p: parts[0][0] + parts[1][0], label: '1回ゆれて出る', col: cols[0] },
      { p: parts[2][0], label: '2回ゆれて出る', col: cols[2] },
      { p: parts[3][0], label: '3回ゆれて出る', col: cols[3] },
      { p: parts[4][0], label: '捕獲', col: cols[4] },
    ];
  } else {
    segs = [
      { p: parts[0][0], label: 'ゆれずに出る', col: cols[0] },
      { p: parts[1][0], label: '1回ゆれて出る', col: cols[1] },
      { p: parts[2][0], label: '2回ゆれて出る', col: cols[2] },
      { p: parts[3][0], label: '3回ゆれて出る', col: cols[3] },
      { p: parts[4][0], label: '捕獲', col: cols[4] },
    ];
  }
  const bar = $('shakeBar');
  bar.innerHTML = '';
  const leg = $('shakeLegend');
  leg.innerHTML = '';
  for (const s of segs) {
    const sp = document.createElement('span');
    sp.style.width = (s.p * 100) + '%';
    sp.style.background = s.col;
    sp.title = `${s.label} ${pctText(s.p)}%`;
    bar.append(sp);
    const li = document.createElement('li');
    li.innerHTML = `<i style="background:${s.col}"></i>${s.label} <b>${pctText(s.p)}%</b>`;
    leg.append(li);
  }
  $('shakeNote').textContent = r.p >= 1 ? '判定なしで確定' : gc ? '1球ごとの判定は4回。コロシアム/XDは1回目・2回目の失敗がどちらも1回ゆれに見える' : '1球ごとに4回判定して、すべて通れば捕獲';

  renderCurve(sr);
  renderFormula(c, r);
}

function renderCurve(sr) {
  const el = $('curve');
  const W = 560, H = 190, L = 40, R = 16, T = 12, B = 30;
  const cum = sr.cum;
  let N = sr.need[99] != null ? sr.need[99] : cum.length;
  N = Math.max(5, Math.min(N, 120, cum.length || 5));
  if (sr.base.p >= 1) N = 5;
  const xs = (i) => L + (i - 1) / Math.max(1, N - 1) * (W - L - R);
  const ys = (p) => T + (1 - p) * (H - T - B);
  const val = (i) => (sr.base.p >= 1 ? 1 : cum[i - 1] ?? 1);
  let s = '';
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${ys(p)}" y2="${ys(p)}"/><text x="${L - 6}" y="${ys(p) + 4}" text-anchor="end">${p * 100}%</text>`;
  }
  const step = N <= 10 ? 1 : N <= 30 ? 5 : N <= 60 ? 10 : 20;
  for (let i = 1; i <= N; i++) {
    if (i === 1 || i % step === 0) s += `<text x="${xs(i)}" y="${H - 10}" text-anchor="middle">${i}</text>`;
  }
  s += `<text x="${W - R}" y="${H - 10 + 0}" text-anchor="end" dx="0" dy="0" opacity="0"> </text>`;
  let d = '';
  for (let i = 1; i <= N; i++) d += (i === 1 ? 'M' : 'L') + xs(i).toFixed(1) + ' ' + ys(val(i)).toFixed(1);
  const area = d + `L${xs(N).toFixed(1)} ${ys(0)}L${xs(1).toFixed(1)} ${ys(0)}Z`;
  s += `<path class="area" d="${area}"/><path class="ln" d="${d}"/>`;
  const n90 = sr.need[90];
  if (n90 != null && n90 <= N) {
    s += `<line class="ref" x1="${xs(n90)}" x2="${xs(n90)}" y1="${ys(0)}" y2="${ys(val(n90))}"/>`;
    s += `<circle class="mk" cx="${xs(n90)}" cy="${ys(val(n90))}" r="4"/>`;
    const tx = Math.min(xs(n90) + 8, W - R - 70);
    s += `<text class="mk-t" x="${tx}" y="${ys(val(n90)) + 16}">${n90}個で${pctText(val(n90))}%</text>`;
  }
  el.innerHTML = s;
  $('curveNote').textContent = sr.timer ? `${st.turn}ターン目から毎ターン1個ずつ投げた場合` : '';
}

function row(k, v) { return `<div class="fx-row"><span class="k">${k}</span><code>${v}</code></div>`; }

function renderFormula(c, r) {
  const bi = r.bi;
  let h = '<div class="fx">';
  if (c.safari) {
    const f = c.safari;
    h += row('サファリ係数', `f = ⌊${SP[c.dex].rate}×100/1275⌋ = ${f.f0}${f.log.length ? ` → 行動後 <b>${f.f}</b>` : ''}`);
    h += row('捕獲率 C', `⌊f×1275/100⌋ = <b>${c.rate}</b>`);
  } else {
    h += row('捕獲率 C', `<b>${c.rate}</b>${c.entry.rate != null && c.entry.rate !== SP[c.dex].rate ? '（ダークポケモン用の値）' : ''}`);
  }
  if (r.auto) {
    h += row('結果', 'チュートリアル戦のため判定せず<b>必ず捕まる</b>');
    $('formula').innerHTML = h + '</div>';
    return;
  }
  if (r.master) {
    h += row('結果', 'マスターボールは判定せず<b>必ず捕まる</b>');
    $('formula').innerHTML = h + '</div>';
    return;
  }
  h += row('ボール B', `${bi.m}/10（×${(bi.m / 10).toFixed(1)}）`);
  h += row('最大HP M', c.dex === 292 ? 'ヌケニンは常に 1' : `⌊(2×${SP[c.dex].hp}+${st.iv})×${st.level}/100⌋+${st.level}+10 = <b>${c.M}</b>`);
  h += row('のこりHP H', `<b>${c.H}</b>`);
  h += row('a（HP込み）', `⌊⌊C×B/10⌋×(3M−2H)/3M⌋ = ⌊${r.a1}×${3 * c.M - 2 * c.H}/${3 * c.M}⌋ = <b>${r.a2}</b>`);
  h += row('じょうたい', `${STAT[c.status].name} ${r.smul} → a = <b>${r.a3}</b>`);
  if (r.sure) {
    h += row('結果', 'a が 255 以上なので<b>必ず捕まる</b>');
  } else if (r.zero) {
    h += row('結果', 'a が 0 のため捕まらない');
  } else {
    h += row('ゆれ判定値 b', `⌊1048560/⌊√⌊√⌊16711680/a⌋⌋⌋⌋ = ⌊1048560/⌊√⌊√${r.q}⌋⌋⌋ = ⌊1048560/${r.s2}⌋ = <b>${r.b}</b>`);
    h += row('1回の判定', `乱数(0〜65535) &lt; b となる確率 = ${r.b}/65536 = ${(r.p1 * 100).toFixed(3)}%`);
    h += row('捕獲率', `(b/65536)⁴ = <b>${pctText(r.p)}%</b>（目安の a/255 = ${(r.a3 / 255 * 100).toFixed(1)}%）`);
  }
  $('formula').innerHTML = h + '</div>';
}

function renderAll() {
  const c = ctxNow();
  renderMonField();
  renderPlaces();
  renderSliders(c);
  renderHealthbox(c);
  renderStatus(c);
  renderBalls(c);
  renderConditions(c);
  renderResult(ctxNow());
}

// ---------------------------------------------------------------- 入力
function kata(s) {
  return s.replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}
const combo = { open: false, items: [], idx: 0 };
function openList(q) {
  const list = $('monList');
  const pool = st.free ? Array.from({ length: 386 }, (_, i) => i + 1) : speciesFor(st.game);
  const k = kata(q.trim().replace(/^\d+\s*/, (m) => (/^\d+\s*$/.test(q.trim()) ? m : '')));
  const num = /^\d+$/.test(q.trim()) ? parseInt(q.trim(), 10) : null;
  let items = pool.filter((d) => (num != null ? String(d).startsWith(String(num)) : !k || SP[d].name.includes(k)));
  combo.items = items;
  combo.idx = 0;
  list.innerHTML = '';
  if (!combo.items.length) {
    list.innerHTML = '<li class="empty">見つかりません。' + (st.free ? '' : 'このソフトで出会えないポケモンは「出現条件を無視する」で選べます。') + '</li>';
  }
  combo.items.forEach((d, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === combo.idx));
    li.innerHTML = `<img src="${iconURL(d)}" alt=""><span class="no">${String(d).padStart(3, '0')}</span><span class="nm">${SP[d].name}</span><span class="rt">捕獲率${SP[d].rate}</span>`;
    li.addEventListener('mousedown', (ev) => { ev.preventDefault(); pick(d); });
    list.append(li);
  });
  list.hidden = false;
  combo.open = true;
  $('monInput').setAttribute('aria-expanded', 'true');
}
function closeList() {
  $('monList').hidden = true;
  combo.open = false;
  $('monInput').setAttribute('aria-expanded', 'false');
}
function pick(d) {
  closeList();
  $('monInput').blur();
  setMon(d);
}
function moveSel(dv) {
  if (!combo.items.length) return;
  combo.idx = (combo.idx + dv + combo.items.length) % combo.items.length;
  const lis = $('monList').querySelectorAll('li');
  lis.forEach((li, i) => li.setAttribute('aria-selected', String(i === combo.idx)));
  lis[combo.idx]?.scrollIntoView({ block: 'nearest' });
}

function bind() {
  const inp = $('monInput');
  inp.addEventListener('focus', () => { inp.select(); openList(''); });
  inp.addEventListener('input', () => openList(inp.value));
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!combo.open) openList(inp.value); else moveSel(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (combo.items[combo.idx]) pick(combo.items[combo.idx]); }
    else if (e.key === 'Escape') { closeList(); inp.blur(); }
  });
  inp.addEventListener('blur', () => { setTimeout(() => { closeList(); renderMonField(); }, 120); });

  $('optIntl').addEventListener('change', (e) => { st.intl = e.target.checked; renderAll(); });
  $('optFree').addEventListener('change', (e) => {
    st.free = e.target.checked;
    if (!st.free && !speciesFor(st.game).includes(st.dex)) st.dex = GAME[st.game].def;
    st.entry = 0;
    refreshEntries(true);
    intro();
    renderAll();
  });
  $('optShiny').addEventListener('change', (e) => { st.shiny = e.target.checked; });
  $('lvRange').addEventListener('input', (e) => { st.level = +e.target.value; renderAll(); });
  $('ivRange').addEventListener('input', (e) => { st.iv = +e.target.value; renderAll(); });
  $('hpRange').addEventListener('input', (e) => {
    const M = maxHP(st.dex, st.level, st.iv);
    st.hpFrac = +e.target.value <= 1 ? 0 : +e.target.value / M;
    renderAll();
  });
  $('hpChips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const M = maxHP(st.dex, st.level, st.iv);
    st.hpFrac = { full: 1, half: Math.ceil(M / 2) / M, red: Math.max(1, fl(M * 0.2)) / M, one: 0 }[b.dataset.hp];
    renderAll();
  });
  $('turnRange').addEventListener('input', (e) => { st.turn = +e.target.value; renderAll(); });
  $('optRepeat').addEventListener('change', (e) => { st.repeat = e.target.checked; renderAll(); });
  $('btnThrow').addEventListener('click', () => { sfxInit().then(throwBall); });
  $('optSfx').checked = SFX.on;
  $('sbBalls').addEventListener('input', (e) => { st.balls = +e.target.value; renderAll(); });
  $('optSfx').addEventListener('change', (e) => {
    SFX.on = e.target.checked;
    if (SFX.on) sfxInit();
    try { localStorage.setItem('gen3catch.sfx', SFX.on ? '1' : '0'); } catch (err) { /* 保存できない環境 */ }
  });
  $('btnTallyReset').addEventListener('click', () => { tally.n = tally.ok = 0; renderTally(); });

  // HPバーのドラッグ
  for (const bar of [$('hbBar'), $('hbHit')]) {
  const setFromX = (clientX) => {
    if (curEntry().safari) return;
    const rc = bar.getBoundingClientRect();
    const k = Math.max(0, Math.min(1, (clientX - rc.left) / rc.width));
    const M = maxHP(st.dex, st.level, st.iv);
    const hp = Math.max(1, Math.round(k * M));
    st.hpFrac = hp <= 1 ? 0 : hp / M;
    renderAll();
  };
  bar.addEventListener('pointerdown', (e) => { bar.setPointerCapture(e.pointerId); setFromX(e.clientX); });
  bar.addEventListener('pointermove', (e) => { if (bar.hasPointerCapture(e.pointerId)) setFromX(e.clientX); });
  bar.addEventListener('keydown', (e) => {
    const M = maxHP(st.dex, st.level, st.iv);
    const H = curHP(M);
    let v = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = H - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = H + 1;
    if (e.key === 'Home') v = 1;
    if (e.key === 'End') v = M;
    if (v == null || curEntry().safari) return;
    e.preventDefault();
    v = Math.max(1, Math.min(M, v));
    st.hpFrac = v <= 1 ? 0 : v / M;
    renderAll();
  });
  }
}

// ---------------------------------------------------------------- 起動
async function start() {
  renderGames();
  bind();
  const keys = Object.keys(A).filter((k) => k.startsWith('bg_') || k.startsWith('back_') || k.startsWith('hpnum_') || k.startsWith('hb_') || k === 'status_jp' || k === 'caught' || k === 'enemy_shadow' || k.endsWith('_spr') || k === 'ball_particles');
  const [sp, ic, ...rest] = await Promise.all([loadImg(A.sprites), loadImg(A.icons), ...keys.map((k) => loadImg(A[k]))]);
  keys.forEach((k, i) => { IMG[k] = rest[i]; });
  ATLAS = imgData(sp);
  ICONS = imgData(ic);
  FONT = imgData(await loadImg(A.font_small));
  FONT_N = imgData(await loadImg(A.font_normal));
  FONT_B = imgData(await loadImg(A.font_bold));
  FONT_FR = imgData(await loadImg(A.font_frnormal));
  const h = location.hash.slice(1).toUpperCase();
  if (GAME[h]) st.game = h;
  if (st.game !== 'E') st.dex = GAME[st.game].def;
  setGame(st.game);
  requestAnimationFrame(loop);
}
refreshEntries(true);
start();
window.gen3 = { st, scene, draw, throwBall, setGame, setMon, gen3Plan };
})();
