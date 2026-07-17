import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, Users2, LayoutTemplate } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { CURRENCIES } from "@/lib/quote";
import { MCC_CATEGORIES } from "@/mock/data";
import type { SpendProgram } from "@/mock/more";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { EmptyState } from "@/components/console/empty-state";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function SpendProgramsPage() {
  const { t } = useI18n();
  const { spendPrograms, cards } = useMock();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton cards={3} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("sp.title")}
        subtitle={t("sp.subtitle")}
        actions={
          <NewProgramDialog>
            <Button size="sm">
              <Plus />
              {t("sp.newProgram")}
            </Button>
          </NewProgramDialog>
        }
      />

      {spendPrograms.length === 0 ? (
        <EmptyState icon={<LayoutTemplate className="size-6" />} title={t("common.empty")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {spendPrograms.map((p) => (
            <ProgramCard key={p.id} program={p} issuedCount={cards.filter((c) => c.name.includes(p.name)).length} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, issuedCount }: { program: SpendProgram; issuedCount: number }) {
  const { t, lang } = useI18n();
  const c = program.controls;
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{program.name}</div>
            <div className="tabular-nums text-xs text-muted-foreground">
              {program.fundingCurrency} · {issuedCount} {t("sp.issuedCount")}
            </div>
          </div>
          <Badge variant={c.mccMode === "allow" ? "info" : "default"}>
            {c.mccMode === "allow" ? t("iss.mccAllow") : t("iss.mccDeny")}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {c.mccList.length > 0 ? (
            c.mccList.map((code) => {
              const m = MCC_CATEGORIES.find((x) => x.code === code);
              return (
                <span
                  key={code}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {m ? (lang === "zh" ? m.zh : m.en) : code}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-muted-foreground">{t("sp.noMccRestriction")}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBox label={t("iss.perTxn")} value={formatMoney(c.perTxnLimit, program.fundingCurrency)} />
          <StatBox label={t("iss.daily")} value={formatMoney(c.dailyLimit, program.fundingCurrency)} />
          <StatBox label={t("iss.monthly")} value={formatMoney(c.monthlyLimit, program.fundingCurrency)} />
        </div>

        <BulkIssueDialog program={program}>
          <Button variant="outline" size="sm" className="w-full">
            <Users2 />
            {t("sp.bulkIssue")}
          </Button>
        </BulkIssueDialog>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-xs font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function NewProgramDialog({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { createProgram } = useMock();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [mccMode, setMccMode] = useState<"allow" | "deny">("allow");
  const [mccList, setMccList] = useState<string[]>([]);
  const [perTxnLimit, setPerTxnLimit] = useState(3000);
  const [dailyLimit, setDailyLimit] = useState(5000);
  const [monthlyLimit, setMonthlyLimit] = useState(10000);

  const resetForm = () => {
    setName("");
    setCurrency("USD");
    setMccMode("allow");
    setMccList([]);
    setPerTxnLimit(3000);
    setDailyLimit(5000);
    setMonthlyLimit(10000);
  };

  const toggleMcc = (code: string) => {
    setMccList((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    createProgram({
      name: name.trim() || t("sp.namePh"),
      fundingCurrency: currency,
      controls: { mccMode, mccList, perTxnLimit, dailyLimit, monthlyLimit },
    });
    setOpen(false);
    resetForm();
    toast(t("sp.created"));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sp.newProgram")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="spName">{t("sp.name")}</Label>
            <Input
              id="spName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("sp.namePh")}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="spCur">{t("sp.fundingCurrency")}</Label>
            <select
              id="spCur"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t("iss.mccPolicy")}</span>
              <div className="flex rounded-lg border border-border p-0.5 text-xs">
                {(["allow", "deny"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMccMode(m)}
                    className={cn(
                      "rounded-md px-2 py-1 font-medium transition",
                      mccMode === m
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "allow" ? t("iss.mccAllow") : t("iss.mccDeny")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MCC_CATEGORIES.map((m) => {
                const on = mccList.includes(m.code);
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => toggleMcc(m.code)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                      on ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {lang === "zh" ? m.zh : m.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="spPerTxn">{t("iss.perTxn")}</Label>
              <Input
                id="spPerTxn"
                type="number"
                min={0}
                value={perTxnLimit}
                onChange={(e) => setPerTxnLimit(Math.max(0, Number(e.target.value) || 0))}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spDaily">{t("iss.daily")}</Label>
              <Input
                id="spDaily"
                type="number"
                min={0}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Math.max(0, Number(e.target.value) || 0))}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spMonthly">{t("iss.monthly")}</Label>
              <Input
                id="spMonthly"
                type="number"
                min={0}
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(Math.max(0, Number(e.target.value) || 0))}
                className="tabular-nums"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{t("sp.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkIssueDialog({ program, children }: { program: SpendProgram; children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { bulkIssue } = useMock();
  const [open, setOpen] = useState(false);
  const [namesText, setNamesText] = useState("");

  const names = namesText
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (names.length === 0) return;
    bulkIssue({ programId: program.id, holderNames: names });
    setOpen(false);
    setNamesText("");
    toast(`${t("sp.bulkToast")} · ${names.length}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setNamesText("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sp.bulkIssue")}</DialogTitle>
          <DialogDescription>{program.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="spNames">{t("sp.holderNames")}</Label>
            <textarea
              id="spNames"
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              placeholder={t("sp.holderNamesPh")}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <p className="text-xs text-muted-foreground">
              {t("sp.holderNamesHint")}
              {names.length > 0 ? ` · ${names.length}` : ""}
            </p>
          </div>
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{t("sp.bulkHint")}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={names.length === 0}>
              <Users2 />
              {t("sp.bulkIssue")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
