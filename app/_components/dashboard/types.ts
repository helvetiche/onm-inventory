export type TrendPoint = {
  day: string;
  stock: number;
  movement: number;
};

export type AnalyticMetric = {
  id: string;
  title: string;
  value: string;
  context: string;
  delta: string;
};

export type AuditItem = {
  id: string;
  actor: string;
  action: string;
  cabinet: string;
  timeLabel: string;
  severity: "normal" | "important";
};

export type CabinetItem = {
  id: string;
  label: string;
  zone: string;
  usedSlots: number;
  totalSlots: number;
  readiness: "ready" | "attention";
};

export type WidgetIconKey =
  | "ChartLineUp"
  | "Archive"
  | "ShieldCheck"
  | "ArrowsOutCardinal"
  | "UserCircle";

export type WidgetItem = {
  id: string;
  title: string;
  value: string;
  helperText: string;
  iconKey: WidgetIconKey;
};

export type BottomNavItem = {
  id: string;
  label: string;
  iconKey: WidgetIconKey;
};
