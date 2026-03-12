import type { OrderStatus } from "@cartfolio/shared";
import { STATUS_LABELS } from "@cartfolio/shared";
import { getStatusColor } from "@cartfolio/shared/utils/formatters";

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const color = getStatusColor(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
