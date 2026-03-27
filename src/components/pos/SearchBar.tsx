import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="بحث عن منتج أو باركود..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pr-11 pl-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
        dir="rtl"
      />
    </div>
  );
};

export default SearchBar;
