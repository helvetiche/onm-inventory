import type { JSX } from "react";
import {
  Archive,
  ArrowsOutCardinal,
  ChartLineUp,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react";
import type { Icon, IconProps } from "@phosphor-icons/react";
import type { WidgetIconKey } from "@/app/_components/dashboard/types";

type IconRendererProps = {
  iconKey: WidgetIconKey;
  size?: number;
  className?: string;
};

const iconMap: Record<WidgetIconKey, Icon> = {
  ChartLineUp,
  Archive,
  ShieldCheck,
  ArrowsOutCardinal,
  UserCircle,
};

export function DashboardIcon({
  iconKey,
  size = 20,
  className,
}: IconRendererProps): JSX.Element {
  const IconComponent = iconMap[iconKey];
  return <IconComponent size={size} weight="duotone" className={className} />;
}
