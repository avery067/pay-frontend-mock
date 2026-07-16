import { useState } from "react";
import { UserPlus, MoreHorizontal } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

type Member = { id: string; name: string; email: string; role: string; pending?: boolean };

const INITIAL: Member[] = [
  { id: "m1", name: "示例商户 001", email: "demo@example.com", role: "team.roleOwner" },
  { id: "m2", name: "Alex Chen（示例）", email: "alex@example.com", role: "team.roleAdmin" },
  { id: "m3", name: "Sam Lee（示例）", email: "sam@example.com", role: "team.roleView" },
];

export default function TeamPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("team.roleView");

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "m" + Math.floor(Math.random() * 1_000_000);
    setMembers((p) => [...p, { id, name: email.split("@")[0] || "member", email, role, pending: true }]);
    setOpen(false);
    setEmail("");
    setRole("team.roleView");
    toast(t("team.invited"));
  };
  const changeRole = (id: string, r: string) => setMembers((p) => p.map((m) => (m.id === id ? { ...m, role: r } : m)));
  const remove = (id: string) => {
    setMembers((p) => p.filter((m) => m.id !== id));
    toast(t("team.removed"));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("team.title")}
        subtitle={t("team.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus />
                {t("team.invite")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("team.inviteTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={invite} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="imail">{t("team.email")}</Label>
                  <Input id="imail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("team.emailPh")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="irole">{t("team.role")}</Label>
                  <select
                    id="irole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="team.roleAdmin">{t("team.roleAdmin")}</option>
                    <option value="team.roleView">{t("team.roleView")}</option>
                  </select>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t("common.cancel")}</Button>
                  </DialogClose>
                  <Button type="submit">{t("team.invite")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("team.colMember")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("team.colRole")}</th>
                  <th className="px-6 py-2.5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isOwner = m.role === "team.roleOwner";
                  return (
                    <tr key={m.id} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                            {m.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              {m.name}
                              {m.pending && <Badge variant="warning">{t("team.pending")}</Badge>}
                            </div>
                            <div className="tabular-nums text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{t(m.role)}</Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {!isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={t("team.changeRole")}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => changeRole(m.id, "team.roleAdmin")}>{t("team.roleAdmin")}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeRole(m.id, "team.roleView")}>{t("team.roleView")}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => remove(m.id)} className="text-danger">{t("team.remove")}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
