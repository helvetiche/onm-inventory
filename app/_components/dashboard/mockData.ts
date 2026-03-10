import type {
  AnalyticMetric,
  AuditItem,
  BottomNavItem,
  CabinetItem,
  TrendPoint,
  WidgetItem,
  WidgetIconKey,
} from "@/app/_components/dashboard/types";

export const analyticsMetrics: AnalyticMetric[] = [
  {
    id: "total-items",
    title: "Total Items Tracked",
    value: "12,480",
    context: "Across all active cabinets",
    delta: "+4.2% this month",
  },
  {
    id: "low-stock",
    title: "Low Stock Alerts",
    value: "18",
    context: "Need attention today",
    delta: "-3 since yesterday",
  },
  {
    id: "audits-done",
    title: "Audits Completed",
    value: "94%",
    context: "Weekly target progress",
    delta: "+7% versus last week",
  },
];

export const analyticsTrend: TrendPoint[] = [
  { day: "Mon", stock: 9200, movement: 380 },
  { day: "Tue", stock: 9350, movement: 410 },
  { day: "Wed", stock: 9480, movement: 370 },
  { day: "Thu", stock: 9600, movement: 450 },
  { day: "Fri", stock: 9740, movement: 430 },
  { day: "Sat", stock: 9850, movement: 330 },
  { day: "Sun", stock: 9980, movement: 290 },
];

export const auditItems: AuditItem[] = [
  {
    id: "audit-1",
    actor: "Maria Santos",
    action: "Verified medicine tray count",
    cabinet: "Cabinet A-03",
    timeLabel: "08:45 AM",
    severity: "normal",
  },
  {
    id: "audit-2",
    actor: "Ramon Cruz",
    action: "Adjusted stock after delivery",
    cabinet: "Cabinet B-07",
    timeLabel: "09:30 AM",
    severity: "normal",
  },
  {
    id: "audit-3",
    actor: "Lina Reyes",
    action: "Late return flagged for review",
    cabinet: "Cabinet C-02",
    timeLabel: "10:10 AM",
    severity: "important",
  },
  {
    id: "audit-4",
    actor: "Joel Dela Vega",
    action: "Weekly integrity check complete",
    cabinet: "Cabinet D-01",
    timeLabel: "11:25 AM",
    severity: "normal",
  },
];

export const cabinetItems: CabinetItem[] = [
  {
    id: "cab-1",
    label: "Cabinet A-03",
    zone: "North Wing",
    usedSlots: 42,
    totalSlots: 48,
    readiness: "ready",
  },
  {
    id: "cab-2",
    label: "Cabinet B-07",
    zone: "Main Hall",
    usedSlots: 36,
    totalSlots: 40,
    readiness: "ready",
  },
  {
    id: "cab-3",
    label: "Cabinet C-02",
    zone: "East Hall",
    usedSlots: 29,
    totalSlots: 40,
    readiness: "attention",
  },
];

export const widgetItems: WidgetItem[] = [
  {
    id: "widget-health",
    title: "Stock Health",
    value: "Stable",
    helperText: "Most categories are healthy",
    iconKey: "ChartLineUp",
  },
  {
    id: "widget-audits",
    title: "Pending Audits",
    value: "6",
    helperText: "Due before 5:00 PM",
    iconKey: "ShieldCheck",
  },
  {
    id: "widget-cabinets",
    title: "Active Cabinets",
    value: "14",
    helperText: "2 need maintenance check",
    iconKey: "Archive",
  },
  {
    id: "widget-layout",
    title: "Layout Movement",
    value: "Easy",
    helperText: "Drag cards to reorder",
    iconKey: "ArrowsOutCardinal",
  },
];

export const widgetIconOptions: WidgetIconKey[] = [
  "ChartLineUp",
  "Archive",
  "ShieldCheck",
  "ArrowsOutCardinal",
  "UserCircle",
];

export const bottomNavItems: BottomNavItem[] = [
  { id: "dashboard", label: "Dashboard", iconKey: "ChartLineUp" },
  { id: "cabinets", label: "Cabinets", iconKey: "Archive" },
  { id: "audits", label: "Audits", iconKey: "ShieldCheck" },
  { id: "profile", label: "Profile", iconKey: "UserCircle" },
];
