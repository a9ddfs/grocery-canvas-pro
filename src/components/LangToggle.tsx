import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const LangToggle = () => {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="px-2.5 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-pos-surface-hover transition-all flex items-center gap-1.5"
      title={t("language")}
    >
      <Languages className="w-4 h-4" />
      <span>{t("language")}</span>
    </button>
  );
};

export default LangToggle;
