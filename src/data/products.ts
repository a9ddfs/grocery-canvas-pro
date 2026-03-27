import applesImg from "@/assets/products/apples.jpg";
import bananasImg from "@/assets/products/bananas.jpg";
import milkImg from "@/assets/products/milk.jpg";
import breadImg from "@/assets/products/bread.jpg";
import tomatoesImg from "@/assets/products/tomatoes.jpg";
import orangeJuiceImg from "@/assets/products/orange-juice.jpg";
import cheeseImg from "@/assets/products/cheese.jpg";
import eggsImg from "@/assets/products/eggs.jpg";
import cannedTunaImg from "@/assets/products/canned-tuna.jpg";
import waterImg from "@/assets/products/water.jpg";
import cucumbersImg from "@/assets/products/cucumbers.jpg";
import yogurtImg from "@/assets/products/yogurt.jpg";

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  barcode?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export const categories: Category[] = [
  { id: "all", name: "الكل", icon: "🏪" },
  { id: "fruits", name: "فواكه", icon: "🍎" },
  { id: "vegetables", name: "خضروات", icon: "🥬" },
  { id: "dairy", name: "ألبان", icon: "🥛" },
  { id: "bakery", name: "مخبوزات", icon: "🍞" },
  { id: "drinks", name: "مشروبات", icon: "🥤" },
  { id: "canned", name: "معلبات", icon: "🥫" },
];

export const products: Product[] = [
  { id: "1", name: "تفاح أحمر", price: 8.50, category: "fruits", image: applesImg, barcode: "100001" },
  { id: "2", name: "موز", price: 6.00, category: "fruits", image: bananasImg, barcode: "100002" },
  { id: "3", name: "طماطم", price: 4.50, category: "vegetables", image: tomatoesImg, barcode: "100003" },
  { id: "4", name: "خيار", price: 3.75, category: "vegetables", image: cucumbersImg, barcode: "100004" },
  { id: "5", name: "حليب طازج", price: 7.00, category: "dairy", image: milkImg, barcode: "100005" },
  { id: "6", name: "جبنة", price: 12.50, category: "dairy", image: cheeseImg, barcode: "100006" },
  { id: "7", name: "بيض", price: 14.00, category: "dairy", image: eggsImg, barcode: "100007" },
  { id: "8", name: "زبادي", price: 3.50, category: "dairy", image: yogurtImg, barcode: "100008" },
  { id: "9", name: "خبز أبيض", price: 3.00, category: "bakery", image: breadImg, barcode: "100009" },
  { id: "10", name: "عصير برتقال", price: 9.00, category: "drinks", image: orangeJuiceImg, barcode: "100010" },
  { id: "11", name: "مياه معدنية", price: 1.50, category: "drinks", image: waterImg, barcode: "100011" },
  { id: "12", name: "تونة معلبة", price: 8.00, category: "canned", image: cannedTunaImg, barcode: "100012" },
];
