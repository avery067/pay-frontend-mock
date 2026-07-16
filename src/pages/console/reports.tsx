import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { volumeSeries, methodBreakdown, corridorVolume } from "@/mock/more";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function ReportsPage() {
  const { t } = useI18n();
  const tooltipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--popover-foreground)",
    fontSize: 12,
  } as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("rep.title")}
        subtitle={t("rep.subtitle")}
        actions={
          <Button size="sm" variant="outline" onClick={() => exportCsv("volume.csv", volumeSeries)}>
            <Download />
            {t("rep.export")}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("rep.volumeTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeSeries} margin={{ left: -12, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatMoney(Number(v))} />
                <Area type="monotone" dataKey="v" stroke="var(--brand-strong)" strokeWidth={2} fill="url(#gv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("rep.byMethod")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={2} stroke="none">
                    {methodBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {methodBreakdown.map((m, i) => (
                <span key={m.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {m.name} <span className="tabular-nums">{m.value}%</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("rep.byCorridor")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridorVolume} layout="vertical" margin={{ left: 20, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatMoney(Number(v))} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="v" fill="var(--brand-strong)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
