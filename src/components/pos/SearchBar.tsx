import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { t, dir } = useI18n();
  return (
    <div className="relative">
      <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-secondary text-foreground placeholder:text-muted-foreground py-3 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm ${dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"}`}
        dir={dir}
      />
    </div>
  );
};

export default SearchBar;
