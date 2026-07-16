import { Construction } from "lucide-react";
import { useI18n } from "@/i18n";

export default function PlaceholderPage({ sectionKey }: { sectionKey: string }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center py-24 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <Construction className="size-7" />
      </div>
      <h1 className="mt-6 text-xl font-semibold">
        {t(sectionKey)} · {t("console.comingSoon")}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t("console.comingSoonDesc")}
      </p>
    </div>
  );
}
