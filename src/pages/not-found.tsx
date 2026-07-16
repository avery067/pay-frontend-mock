import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-svh place-items-center bg-background px-6 text-center">
      <div>
        <Link to="/" className="inline-flex" aria-label="Meridian">
          <Logo />
        </Link>
        <div className="mt-8 tabular-nums text-6xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>404</div>
        <h1 className="mt-4 text-xl font-semibold">{t("nf.title")}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("nf.desc")}</p>
        <Link to="/" className={cn(buttonVariants({ variant: "default" }), "mt-6")}>{t("actions.backHome")}</Link>
      </div>
    </div>
  );
}
