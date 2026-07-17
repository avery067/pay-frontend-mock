import { Check, KeyRound, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { type AcquiringChannel, type ChannelMode } from "@/mock/more";
import { useMock, previewApprovalRate } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

const MODES: ChannelMode[] = ["local", "direct", "third_party"];
const MODE_KEY: Record<ChannelMode, string> = {
  local: "chan.modeLocal",
  direct: "chan.modeDirect",
  third_party: "chan.modeThirdParty",
};
const MODE_DESC_KEY: Record<ChannelMode, string> = {
  local: "chan.modeLocalDesc",
  direct: "chan.modeDirectDesc",
  third_party: "chan.modeThirdPartyDesc",
};

function toneOf(rate: number): string {
  return rate >= 91 ? "bg-success" : rate >= 87 ? "bg-info" : "bg-warning";
}

export default function AcquiringChannelsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { channels, setChannelMode, networkTokensOn, toggleNetworkTokens } = useMock();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton kpis={2} cards={6} />;

  const avgApproval = channels.length
    ? Math.round((channels.reduce((s, c) => s + c.approvalRate, 0) / channels.length) * 10) / 10
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("chan.title")}
        subtitle={t("chan.subtitle")}
        actions={<Badge variant="success">{t("chan.avgApproval")} {avgApproval.toFixed(1)}%</Badge>}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{t("chan.tokensTitle")}</CardTitle>
                <Badge variant={networkTokensOn ? "success" : "outline"}>{t(networkTokensOn ? "chan.tokensOn" : "chan.tokensOff")}</Badge>
              </div>
              <CardDescription>{t("chan.tokensDesc")}</CardDescription>
            </div>
          </div>
          <Switch
            checked={networkTokensOn}
            onCheckedChange={() => {
              toggleNetworkTokens();
              toast(t("chan.tokensToggled"));
            }}
          />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
              networkTokensOn ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            <TrendingUp className="size-4 shrink-0" />
            <span>{networkTokensOn ? t("chan.tokensLiftHint") : t("chan.tokensOff")}</span>
            {networkTokensOn && <Badge variant="success" className="ml-auto">+3.3pt</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium">{t("chan.marketsTitle")}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("chan.marketsDesc")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((c) => (
            <ChannelCard
              key={c.market}
              channel={c}
              tokensOn={networkTokensOn}
              onSwitch={(mode) => {
                setChannelMode(c.market, mode);
                toast(t("chan.switched"));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelCard({
  channel,
  tokensOn,
  onSwitch,
}: {
  channel: AcquiringChannel;
  tokensOn: boolean;
  onSwitch: (mode: ChannelMode) => void;
}) {
  const { t } = useI18n();
  const pct = Math.max(0, Math.min(100, Math.round(channel.approvalRate)));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{channel.market}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{t("chan.interchangeTier")}: {channel.interchangeTier}</div>
          </div>
          <Badge variant="info">{t(MODE_KEY[channel.mode])}</Badge>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">{t("chan.approvalRate")}</span>
          <span className="tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {channel.approvalRate.toFixed(1)}%
          </span>
        </div>
        <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full transition-[width] duration-500", toneOf(channel.approvalRate))} style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{t("chan.currentMode")}: {t(MODE_KEY[channel.mode])}</span>
          <span className="text-[11px] text-muted-foreground">{t("chan.previewCompare")}</span>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {MODES.map((m) => {
            const active = channel.mode === m;
            const preview = previewApprovalRate(channel.market, m, tokensOn);
            return (
              <button
                key={m}
                type="button"
                title={active ? t(MODE_DESC_KEY[m]) : `${t("chan.switchTo")} · ${t(MODE_DESC_KEY[m])}`}
                onClick={() => !active && onSwitch(m)}
                disabled={active}
                className={cn(
                  "rounded-lg border px-2 py-2 text-left text-[11px] transition",
                  active ? "cursor-default border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium">{t(MODE_KEY[m])}</span>
                  {active && (
                    <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-2.5" />
                    </span>
                  )}
                </div>
                <div className="mt-1 tabular-nums text-muted-foreground">{preview.toFixed(1)}%</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
