import { MenuItem, SurveyResponse, RestaurantConfig } from './types';

export const INITIAL_CONFIG: RestaurantConfig = {
  name: "Манай Ресторан",
  subTitle: "Ухаалаг меню & Сэтгэл ханамжийн судалгаа",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80", 
  managerPin: "1234",
  managerEmail: "haliunaa.dolgorjav@gmail.com",
  categories: [
    { id: 'FOOD', label: 'Хоол', subtitle: 'Амтат Үндсэн Хоолнууд (Main Dishes)', visible: true },
    { id: 'ALCOHOL', label: 'Согтууруулах ундаа', subtitle: 'Шар айраг & Сормуун Архи (Spirits)', visible: true },
    { id: 'WINE', label: 'Дарс', subtitle: 'Тансаг Дарсны Цуглуулга (Premium Wines)', visible: true },
    { id: 'DRINKS', label: 'Ундаа, Жүүс', subtitle: 'Зөөлөн Ундаа & Жүүс (Soft Drinks)', visible: true }
  ]
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    title: "ANHEUNG GALBI SPECIAL 안흥갈би Спе셜",
    subTitle: "안흥갈비 스페셜",
    weight: "250гр",
    price: 39900,
    description: "45 жилийн түүхтэй, гурван үе дамжсан нууц жороор амталж 48 цаг дарсаны үр дүнд зөөлөн, шүүслэг бүтэцтэй онцгой сонголт.",
    imageUrl: "https://images.unsplash.com/photo-1632161655118-cf569600aee6?w=400&auto=format&fit=crop&q=80",
    category: "FOOD",
    available: true
  },
  {
    id: "item-2",
    title: "Special Marinated Pork Neck 양념목살",
    subTitle: "양념목살",
    weight: "250гр",
    price: 39900,
    description: "Амталсан Гахайн Хүзүү ОНЦГОЙ. Нарийн зүссэн зөөлөн махан дээр тусгай соус шингээн бэлтгэсэн.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
    category: "FOOD",
    available: true
  },
  {
    id: "item-3",
    title: "Samgyeopsal 삼겹살",
    subTitle: "삼겹살",
    weight: "250гр",
    price: 35500,
    description: "Самгёбсал. Гахайн толбогүй өөх, мах хосолсон тансаг зүсэлт бүхий шарсан мах.",
    imageUrl: "https://images.unsplash.com/photo-1534938665420-4193efe2adb4?w=400&auto=format&fit=crop&q=80",
    category: "FOOD",
    available: true
  },
  {
    id: "item-4",
    title: "MONGYU Steak 몽규 스테이크 (소고기)",
    subTitle: "몽규 스테이크 (소고기)",
    weight: "200гр",
    price: 49000,
    description: "Хамгийн зөөлөн үхрийн махан стейк. Шүүслэг байдлыг нь хадгалан зөөлөн галаар шарсан.",
    imageUrl: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&auto=format&fit=crop&q=80",
    category: "FOOD",
    available: true
  },
  {
    id: "item-5",
    title: "Soju Original 참이슬",
    subTitle: "참이슬 오리지널",
    weight: "360мл",
    price: 15000,
    description: "Солонгосын уламжлалт цэвэршүүлсэн архи.",
    imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=80",
    category: "ALCOHOL",
    available: true
  },
  {
    id: "item-6",
    title: "Chateau Margaux Red Wine",
    subTitle: "프리미엄 레드 와인",
    weight: "750мл",
    price: 125000,
    description: "Дээд зэрэглэлийн франц улаан дарс.",
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&auto=format&fit=crop&q=80",
    category: "WINE",
    available: true
  },
  {
    id: "item-7",
    title: "Fresh Lemon Juice",
    subTitle: "레몬에이드",
    weight: "450мл",
    price: 7500,
    description: "Шинэхэн шахсан нимбэгний шүүс, мөстэй ундаа.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80",
    category: "DRINKS",
    available: true
  }
];

// Generates 7 mock survey responses matching Screenshot 3 values as closely as possible
// Question scores averages around: Q1: 4.7, Q2: 4.6, Q3: 4.4, Q4: 3.9, Q5: 4.3. NPS: +57, Total CSAT: 100% (or high)
export const INITIAL_SURVEY_RESPONSES: SurveyResponse[] = [
  {
    id: "survey-1",
    rating1: 5,
    rating2: 5,
    rating3: 5,
    rating4: 4,
    rating5: 5,
    nps: 10, // Promoter
    comment: "Хоол үнэхээр тансаг амттай байлаа. Галаби стейк зөөлөн бөгөөд шүүслэг юм. Дахин заавал ирнэ ээ!",
    phoneNumber: "99112233",
    followUpStatus: "RESOLVED",
    createdAt: "2026-06-15T12:30:00Z"
  },
  {
    id: "survey-2",
    rating1: 5,
    rating2: 4,
    rating3: 4,
    rating4: 3,
    rating5: 4,
    nps: 9, // Promoter
    comment: "Цэвэрхэн, тухтай орчинтой юм байна. Үйлчилгээний ажилтан жаахан ачаалалтай удаан байсан ч эелдэг байсан.",
    phoneNumber: "88998899",
    followUpStatus: "PENDING",
    createdAt: "2026-06-16T14:15:00Z"
  },
  {
    id: "survey-3",
    rating1: 4,
    rating2: 5,
    rating3: 4,
    rating4: 4,
    rating5: 4,
    nps: 9, // Promoter
    comment: "Самгёбсал нь хамгийн амттай нь байв. Үнэ нь чанартаа тохирсон.",
    phoneNumber: "95156515",
    followUpStatus: "RESOLVED",
    createdAt: "2026-06-16T18:45:00Z"
  },
  {
    id: "survey-4",
    rating1: 5,
    rating2: 5,
    rating3: 5,
    rating4: 4,
    rating5: 4,
    nps: 10, // Promoter
    comment: "Сэтгэл ханамж өндөр байна! Саналууд маш хэрэгцээтэй харагдаж байна.",
    phoneNumber: "90098010",
    followUpStatus: "PENDING",
    createdAt: "2026-06-17T08:20:00Z"
  },
  {
    id: "survey-5",
    rating1: 4,
    rating2: 4,
    rating3: 4,
    rating4: 5,
    rating5: 4,
    nps: 9, // Promoter
    comment: "Шөл нь арай илүү халуун байсан бол зүгээр байх байлаа. Бусдаар бол үйлчилгээ маш сайн байна.",
    phoneNumber: "99554433",
    followUpStatus: "PENDING",
    createdAt: "2026-06-17T09:12:00Z"
  },
  {
    id: "survey-6",
    rating1: 5,
    rating2: 4,
    rating3: 4,
    rating4: 4,
    rating5: 4,
    nps: 8, // Passive
    comment: "Хэт их хүлээгдэл үүссэн. Дараа анхаараарай. Мах нь зөөлөн байлаа.",
    phoneNumber: "80081010",
    followUpStatus: "UNRESOLVED",
    createdAt: "2026-06-17T10:05:00Z"
  },
  {
    id: "survey-7",
    rating1: 5,
    rating2: 5,
    rating3: 5,
    rating4: 4,
    rating5: 5,
    nps: 5, // Detractor
    comment: "Ариун цэврийн өрөөний цэвэрлэгээ муу байна, утас руу ярьж энэ асуудлыг шийдсэн эсэхээ хэлээрэй.",
    phoneNumber: "99123456",
    followUpStatus: "PENDING",
    createdAt: "2026-06-17T10:35:00Z"
  }
];
