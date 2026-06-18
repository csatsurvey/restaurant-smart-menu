export interface MenuItem {
  id: string;
  title: string;       // Mongolian / English name (e.g., ANHEUNG GALBI SPECIAL)
  subTitle: string;    // Korean name / translation (e.g., 안흥갈би 스페셜)
  weight: string;      // weight or size (e.g., 250гр)
  price: number;       // Numeric price (e.g., 39900)
  description: string; // Description text (e.g., 45 жилийн түүхтэй,...)
  imageUrl: string;    // URL of item image
  category: 'FOOD' | 'ALCOHOL' | 'WINE' | 'DRINKS';
  available: boolean;  // is stock available
}

export type MenuCategory = 'FOOD' | 'ALCOHOL' | 'WINE' | 'DRINKS';

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  itemPrice: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: {
    menuItemId: string;
    title: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELLED';
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  rating1: number; // Өнөөдрийн үйлчилгээнд хэр сэтгэл хангалуун байна вэ?
  rating2: number; // Хоолны чанар, амт
  rating3: number; // Үнэ нь чанартай харьцуулахад зохистой юу?
  rating4: number; // Үйлчилгээний харилцаа, эелдэг байдал
  rating5: number; // Орчин тохилог, цэвэр байдал
  nps: number;     // Найз танилдаа санал болгох магадлал (0-10)
  comment: string;
  phoneNumber: string;
  followUpStatus: 'PENDING' | 'RESOLVED' | 'UNRESOLVED'; // тухайн харилцагчийн асуудлыг шийдсэн шийдээгүй хэсэг
  createdAt: string;
}

export interface CategoryConfig {
  id: 'FOOD' | 'ALCOHOL' | 'WINE' | 'DRINKS';
  label: string;
  subtitle: string;
  visible: boolean;
}

export interface RestaurantConfig {
  name: string;
  subTitle: string;
  logoUrl: string;
  managerPin: string;
  managerEmail: string;       // Email address for OTP verification
  categories?: CategoryConfig[]; // Custom category configurations
}
