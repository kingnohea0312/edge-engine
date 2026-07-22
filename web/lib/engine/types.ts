/** Shared domain types for the data layer + prediction engine. */

export type FightResult = "W" | "L" | "D";
export type MethodKind = "ko" | "sub" | "dec" | "draw" | "nc";

export interface FightStat {
  sigL: number;
  sigA: number;
  totL: number;
  tdL: number;
  tdA: number;
  kd: number;
  sub: number;
  ctrl: number; // seconds
}

export interface Fight {
  date: string;
  wc: string;
  evName: string;
  oppId: string | null;
  oppName: string;
  res: FightResult;
  method: string;
  kind: MethodKind;
  round: number;
  clock: string;
  secs: number;
  st: FightStat | null;
}

export interface FightRecord {
  w: number;
  l: number;
  d: number;
  text: string;
}

export interface Bio {
  id: string;
  name: string;
  first: string;
  last: string;
  nickname: string;
  age: number | null;
  dob: string | null;
  height: string;
  reach: string;
  weight: string;
  stance: string;
  wc: string;
  gym: string;
  country: string;
  flag: string;
  headshot: string;
  record: string;
  rec: FightRecord | null;
}

export interface Agg {
  n: number;
  nStats: number;
  minutes: number;
  ufcW: number;
  ufcL: number;
  slpm: number;
  acc: number;
  td15: number;
  tdAcc: number;
  kd15: number;
  sub15: number;
  ctrlPct: number;
  finishRate: number;
  koShare: number;
  subShare: number;
  last5: Fight[];
  form5: number;
  form5txt: string;
  lastDate: string | null;
}

export interface Profile {
  bio: Bio;
  hist: { fights: Fight[]; upcomingCount: number; totalPlayed: number };
  agg: Agg;
}

export interface Market {
  provider: string;
  mlA: number;
  mlB: number;
  openA: number | null;
  openB: number | null;
  pA: number;
  vmA: { ko: number; sub: number; dec: number } | null;
  vmB: { ko: number; sub: number; dec: number } | null;
  ou: number | null;
}

export interface MethodCol {
  ko: number;
  sub: number;
  dec: number;
}

export interface RoundProjection {
  mode: "veteran" | "standard";
  dist: { [k: string]: number };
  modal?: number | "distance";
  modalP?: number;
  F: number;
  nA?: number;
  nB?: number;
  reason?: string;
  finishLikely?: boolean;
  lean?: "early" | "late" | null;
  gateReason?: string;
}

export interface Prediction {
  pA: number;
  favLast: string;
  favName: string;
  dogLast: string;
  favP: number;
  matrix: { a: MethodCol; b: MethodCol };
  top: { who: string; how: string; v: number };
  finishP: number;
  factors: { w: number; label: string; detail: string }[];
  lowData: boolean;
  damp: number;
  anchored: boolean;
  nudge: number;
  market: Market | null;
  round: RoundProjection;
  aLast: string;
  bLast: string;
}
