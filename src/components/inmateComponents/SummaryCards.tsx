import { Card, CardContent, Typography } from "@mui/material";
import type { InmateSummary } from "../../types/inmateTypes";

function SummaryCards({ summary }: { summary: InmateSummary }) {
  const items = [
    { label: "Total Locations", value: summary.total_locations, color: "#3E6AB3" },
    { label: "Total Inmates", value: summary.total_inmates, color: "#EF5675" },
    { label: "Total Subscriptions", value: summary.total_subscriptions, color: "#4CAF50" },
    { label: "Active Subscriptions", value: summary.active_subscriptions, color: "#FF9800" },
    { label: "Expired Subscriptions", value: summary.expired_subscriptions, color: "#9C27B0" },
    { label: "Total Revenue", value: `₹${summary.total_revenue}`, color: "#009688" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {items.map((item) => (
        <Card
          key={item.label}
          className="shadow-lg"
          sx={{
            backgroundColor: item.color,
            color: "#fff",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {item.label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {item.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SummaryCards;
