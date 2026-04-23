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
import orangesImg from "@/assets/products/oranges.jpg";
import strawberriesImg from "@/assets/products/strawberries.jpg";
import peppersImg from "@/assets/products/peppers.jpg";
import potatoesImg from "@/assets/products/potatoes.jpg";
import butterImg from "@/assets/products/butter.jpg";
import croissantsImg from "@/assets/products/croissants.jpg";
import colaImg from "@/assets/products/cola.jpg";
import cannedBeansImg from "@/assets/products/canned-beans.jpg";
import riceImg from "@/assets/products/rice.jpg";
import onionsImg from "@/assets/products/onions.jpg";

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  price: number; // سعر التجزئة
  wholesalePrice: number; // سعر الجملة
  costPrice: number; // سعر التكلفة
  category: string;
  image: string;
  barcode?: string;
  stock: number;
  minStock: number; // الحد الأدنى للمخزون
  unit: "piece" | "kg" | "carton" | "pack"; // الوحدة
};

export type CartItem = Product & {
  quantity: number;
  priceType: "retail" | "wholesale"; // نوع السعر المستخدم
};

export type SaleRecord = {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount?: number;
  couponCode?: string;
  grandTotal: number;
  paymentMethod: "cash" | "card" | "credit"; // أضفنا الآجل
  customerId?: string; // للبيع بالآجل
  date: Date;
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

export const unitLabels: Record<string, string> = {
  piece: "حبة",
  kg: "كيلو",
  carton: "كرتون",
  pack: "عبوة",
};

export const initialProducts: Product[] = [
  { id: "1", name: "تفاح أحمر", price: 8.50, wholesalePrice: 7.00, costPrice: 5.50, category: "fruits", image: applesImg, barcode: "100001", stock: 50, minStock: 10, unit: "kg" },
  { id: "2", name: "موز", price: 6.00, wholesalePrice: 5.00, costPrice: 3.50, category: "fruits", image: bananasImg, barcode: "100002", stock: 40, minStock: 10, unit: "kg" },
  { id: "3", name: "برتقال", price: 7.00, wholesalePrice: 5.50, costPrice: 4.00, category: "fruits", image: orangesImg, barcode: "100003", stock: 35, minStock: 8, unit: "kg" },
  { id: "4", name: "فراولة", price: 15.00, wholesalePrice: 12.00, costPrice: 9.00, category: "fruits", image: strawberriesImg, barcode: "100004", stock: 20, minStock: 5, unit: "pack" },
  { id: "5", name: "طماطم", price: 4.50, wholesalePrice: 3.50, costPrice: 2.50, category: "vegetables", image: tomatoesImg, barcode: "100005", stock: 60, minStock: 15, unit: "kg" },
  { id: "6", name: "خيار", price: 3.75, wholesalePrice: 3.00, costPrice: 2.00, category: "vegetables", image: cucumbersImg, barcode: "100006", stock: 55, minStock: 15, unit: "kg" },
  { id: "7", name: "فلفل", price: 5.00, wholesalePrice: 4.00, costPrice: 3.00, category: "vegetables", image: peppersImg, barcode: "100007", stock: 30, minStock: 8, unit: "kg" },
  { id: "8", name: "بطاطس", price: 4.00, wholesalePrice: 3.00, costPrice: 2.00, category: "vegetables", image: potatoesImg, barcode: "100008", stock: 70, minStock: 20, unit: "kg" },
  { id: "9", name: "بصل", price: 3.00, wholesalePrice: 2.50, costPrice: 1.50, category: "vegetables", image: onionsImg, barcode: "100009", stock: 65, minStock: 20, unit: "kg" },
  { id: "10", name: "حليب طازج", price: 7.00, wholesalePrice: 6.00, costPrice: 4.50, category: "dairy", image: milkImg, barcode: "100010", stock: 25, minStock: 10, unit: "piece" },
  { id: "11", name: "جبنة", price: 12.50, wholesalePrice: 10.00, costPrice: 8.00, category: "dairy", image: cheeseImg, barcode: "100011", stock: 18, minStock: 5, unit: "piece" },
  { id: "12", name: "بيض", price: 14.00, wholesalePrice: 12.00, costPrice: 9.00, category: "dairy", image: eggsImg, barcode: "100012", stock: 30, minStock: 10, unit: "carton" },
  { id: "13", name: "زبادي", price: 3.50, wholesalePrice: 3.00, costPrice: 2.00, category: "dairy", image: yogurtImg, barcode: "100013", stock: 40, minStock: 10, unit: "piece" },
  { id: "14", name: "زبدة", price: 9.00, wholesalePrice: 7.50, costPrice: 6.00, category: "dairy", image: butterImg, barcode: "100014", stock: 22, minStock: 5, unit: "piece" },
  { id: "15", name: "خبز أبيض", price: 3.00, wholesalePrice: 2.50, costPrice: 1.50, category: "bakery", image: breadImg, barcode: "100015", stock: 45, minStock: 15, unit: "piece" },
  { id: "16", name: "كرواسون", price: 5.50, wholesalePrice: 4.50, costPrice: 3.00, category: "bakery", image: croissantsImg, barcode: "100016", stock: 25, minStock: 8, unit: "pack" },
  { id: "17", name: "عصير برتقال", price: 9.00, wholesalePrice: 7.50, costPrice: 5.50, category: "drinks", image: orangeJuiceImg, barcode: "100017", stock: 30, minStock: 8, unit: "piece" },
  { id: "18", name: "مياه معدنية", price: 1.50, wholesalePrice: 1.00, costPrice: 0.50, category: "drinks", image: waterImg, barcode: "100018", stock: 100, minStock: 30, unit: "piece" },
  { id: "19", name: "كولا", price: 3.00, wholesalePrice: 2.50, costPrice: 1.50, category: "drinks", image: colaImg, barcode: "100019", stock: 50, minStock: 15, unit: "piece" },
  { id: "20", name: "تونة معلبة", price: 8.00, wholesalePrice: 6.50, costPrice: 5.00, category: "canned", image: cannedTunaImg, barcode: "100020", stock: 35, minStock: 10, unit: "piece" },
  { id: "21", name: "فاصوليا معلبة", price: 5.50, wholesalePrice: 4.50, costPrice: 3.00, category: "canned", image: cannedBeansImg, barcode: "100021", stock: 40, minStock: 10, unit: "piece" },
  { id: "22", name: "أرز", price: 18.00, wholesalePrice: 15.00, costPrice: 12.00, category: "canned", image: riceImg, barcode: "100022", stock: 28, minStock: 8, unit: "kg" },
];
