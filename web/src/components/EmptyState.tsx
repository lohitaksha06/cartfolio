interface Props {
  message?: string;
}

export default function EmptyState({ message = "No orders found" }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: 12,
        color: "var(--text-muted)",
      }}
    >
      <p style={{ fontSize: 15 }}>{message}</p>
    </div>
  );
}
