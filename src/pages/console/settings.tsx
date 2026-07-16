import { useState } from "react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LangSwitcher } from "@/components/common/lang-switcher";

export default function SettingsPage() {
  const { t } = useI18n();
  const [twoFa, setTwoFa] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} sample={false} />

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.business")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="bizname">{t("settings.businessName")}</Label>
            <Input id="bizname" defaultValue="示例商户 001" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.theme")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("settings.theme")}</span>
            <ThemeSwitcher />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("settings.language")}</span>
            <LangSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.security")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-sm font-medium">{t("settings.twoFa")}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{t("settings.twoFaDesc")}</div>
            </div>
            <Switch checked={twoFa} onCheckedChange={setTwoFa} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
