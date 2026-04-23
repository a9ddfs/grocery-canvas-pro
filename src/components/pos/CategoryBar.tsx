import { categories } from "@/data/products";
import { useI18n } from "@/lib/i18n";

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryBar = ({ activeCategory, onCategoryChange }: CategoryBarProps) => {
  const { t } = useI18n();
  const labelMap: Record<string, string> = {
    all: t("catAll"),
    fruits: t("catFruits"),
    vegetables: t("catVegetables"),
    dairy: t("catDairy"),
    bakery: t("catBakery"),
    drinks: t("catDrinks"),
    canned: t("catCanned"),
  };
  return (
    <div className="flex gap-2 overflow-x-auto py-2 pos-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap text-sm font-semibold transition-all duration-200 ${
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-secondary text-secondary-foreground hover:bg-pos-surface-hover"
          }`}
        >
          <span className="text-lg">{cat.icon}</span>
          <span>{labelMap[cat.id] || cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
