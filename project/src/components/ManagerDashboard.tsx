import React, { useState, useMemo } from 'react';
import { MenuItem, SurveyResponse, RestaurantConfig, MenuCategory, Order } from '../types';
import { 
  Calendar, BarChart2, Edit3, Trash2, Plus, Check, RefreshCw, LogOut, Grid, 
  TrendingUp, Users, Heart, Award, ArrowUpRight, Phone, MessageSquare, 
  CheckCircle, Clock, AlertTriangle, Image as ImageIcon, QrCode, Search, Filter, Utensils,
  Settings, Key, Mail, ExternalLink, FileSpreadsheet, ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManagerDashboardProps {
  config: RestaurantConfig;
  menuItems: MenuItem[];
  surveys: SurveyResponse[];
  orders: Order[];
  onUpdateConfig: (updated: RestaurantConfig) => void;
  onUpdateMenu: (updated: MenuItem[]) => void;
  onUpdateSurveys: (updated: SurveyResponse[]) => void;
  onUpdateOrders: (updated: Order[]) => void;
  onLogOut: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  config,
  menuItems,
  surveys,
  orders,
  onUpdateConfig,
  onUpdateMenu,
  onUpdateSurveys,
  onUpdateOrders,
  onLogOut
}) => {
  const [activeTab, setActiveTab] = useState<'consolidated' | 'menu-editor' | 'survey-followups' | 'orders' | 'settings'>('consolidated');
  
  // Custom Alert and Confirmation Modal state for iframe sandbox friendly interaction
  const [customAlert, setCustomAlert] = useState<{ message: string; type?: 'info' | 'success' | 'warn' } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showAlert = (message: string, type: 'info' | 'success' | 'warn' = 'success') => {
    setCustomAlert({ message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setCustomConfirm({ message, onConfirm });
  };
  
  // Settings Form values - synced with config
  const [configName, setConfigName] = useState(config.name);
  const [configSubTitle, setConfigSubTitle] = useState(config.subTitle);
  const [configLogoUrl, setConfigLogoUrl] = useState(config.logoUrl);
  const [configManagerEmail, setConfigManagerEmail] = useState(config.managerEmail || 'haliunaa.dolgorjav@gmail.com');
  
  // Custom category labels state with default fallbacks
  const [configCategories, setConfigCategories] = useState(() => {
    return config.categories || [
      { id: 'FOOD', label: 'Хоол', subtitle: 'Амтат Үндсэн Хоолнууд (Main Dishes)', visible: true },
      { id: 'ALCOHOL', label: 'Согтууруулах ундаа', subtitle: 'Шар айраг & Сормуун Архи (Spirits)', visible: true },
      { id: 'WINE', label: 'Дарс', subtitle: 'Тансаг Дарсны Цуглуулга (Premium Wines)', visible: true },
      { id: 'DRINKS', label: 'Ундаа, Жүүс', subtitle: 'Зөөлөн Ундаа & Жүүс (Soft Drinks)', visible: true }
    ];
  });

  const handleImageUpload = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // PIN Change OTP states
  const [pinChangeStep, setPinChangeStep] = useState<'IDLE' | 'OTP_INPUT' | 'NEW_PIN_INPUT' | 'SUCCESS'>('IDLE');
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [newPinCodeInput, setNewPinCodeInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [showOtpInboxSim, setShowOtpInboxSim] = useState(false);
  
  // Filtering states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // New item form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<Omit<MenuItem, 'id'>>({
    title: '',
    subTitle: '',
    weight: '250гр',
    price: 35000,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    category: 'FOOD',
    available: true
  });

  // Survey Filtered results
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      if (!s.createdAt) return true;
      const sDate = s.createdAt.substring(0, 10); // YYYY-MM-DD
      const startOk = startDate ? sDate >= startDate : true;
      const endOk = endDate ? sDate <= endDate : true;
      return startOk && endOk;
    });
  }, [surveys, startDate, endDate]);

  // Calculations for KPIs
  const kpis = useMemo(() => {
    const total = filteredSurveys.length;
    if (total === 0) {
      return { total: 0, average: '0.0', nps: '+0', csat: '0' };
    }

    // Average rating
    let totalRatingsSum = 0;
    filteredSurveys.forEach(s => {
      const respAvg = (s.rating1 + s.rating2 + s.rating3 + s.rating4 + s.rating5) / 5;
      totalRatingsSum += respAvg;
    });
    const avgScore = (totalRatingsSum / total).toFixed(1);

    // NPS Calculation
    let promoters = 0;
    let detractors = 0;
    filteredSurveys.forEach(s => {
      if (s.nps >= 9) promoters++;
      else if (s.nps <= 6) detractors++;
    });
    const npsScore = Math.round(((promoters - detractors) / total) * 100);
    const npsFormatted = npsScore >= 0 ? `+${npsScore}` : `${npsScore}`;

    // CSAT % (percentage of reviews satisfied, e.g. average rating from user >= 4.0)
    let satisfied = 0;
    filteredSurveys.forEach(s => {
      const score = (s.rating1 + s.rating2 + s.rating3 + s.rating4 + s.rating5) / 5;
      if (score >= 4.0) satisfied++;
    });
    const csatPercent = Math.round((satisfied / total) * 100);

    return {
      total,
      average: avgScore,
      nps: npsFormatted,
      csat: csatPercent
    };
  }, [filteredSurveys]);

  // Answers Breakdown
  const questionAverages = useMemo(() => {
    const count = filteredSurveys.length;
    if (count === 0) return [0, 0, 0, 0, 0];

    const sums = [0, 0, 0, 0, 0];
    filteredSurveys.forEach(s => {
      sums[0] += s.rating1;
      sums[1] += s.rating2;
      sums[2] += s.rating3;
      sums[3] += s.rating4;
      sums[4] += s.rating5;
    });

    return sums.map(sum => Number((sum / count).toFixed(1)));
  }, [filteredSurveys]);

  // NPS Tally
  const npsDetailed = useMemo(() => {
    const count = filteredSurveys.length;
    let prom = 0, pass = 0, detr = 0;
    filteredSurveys.forEach(s => {
      if (s.nps >= 9) prom++;
      else if (s.nps >= 7) pass++;
      else detr++;
    });

    const promPct = count ? Math.round((prom / count) * 100) : 0;
    const passPct = count ? Math.round((pass / count) * 100) : 0;
    const detrPct = count ? Math.round((detr / count) * 100) : 0;

    return {
      prom, promPct,
      pass, passPct,
      detr, detrPct
    };
  }, [filteredSurveys]);

  // Follow-ups filter
  const [followupSearch, setFollowupSearch] = useState('');
  const [followupStatusFilter, setFollowupStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'UNRESOLVED'>('ALL');

  const filteredFollowups = useMemo(() => {
    return surveys.filter(s => {
      // Must have some text details or phone
      const hasContent = s.comment || s.phoneNumber;
      if (!hasContent) return false;

      // Date Range Match Condition
      if (s.createdAt) {
        const sDate = s.createdAt.substring(0, 10); // YYYY-MM-DD
        const startOk = startDate ? sDate >= startDate : true;
        const endOk = endDate ? sDate <= endDate : true;
        if (!startOk || !endOk) return false;
      } else if (startDate || endDate) {
        return false;
      }

      const matchesSearch = s.comment.toLowerCase().includes(followupSearch.toLowerCase()) || 
                            s.phoneNumber.includes(followupSearch);
      
      const matchesStatus = followupStatusFilter === 'ALL' ? true : s.followUpStatus === followupStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [surveys, followupSearch, followupStatusFilter, startDate, endDate]);

  // Handle followups status change
  const handleUpdateFollowupStatus = (id: string, status: 'PENDING' | 'RESOLVED' | 'UNRESOLVED') => {
    const updated = surveys.map(s => {
      if (s.id === id) {
        return { ...s, followUpStatus: status };
      }
      return s;
    });
    onUpdateSurveys(updated);
  };

  // Menu management
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // Editing Mode
      const updated = menuItems.map(item => {
        if (item.id === editingItem.id) {
          return { ...itemForm, id: item.id };
        }
        return item;
      });
      onUpdateMenu(updated);
      setEditingItem(null);
    } else {
      // Adding Mode
      const newItem: MenuItem = {
        ...itemForm,
        imageUrl: itemForm.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        id: `custom-item-${Date.now()}`
      };
      onUpdateMenu([...menuItems, newItem]);
      setIsAddingItem(false);
    }
    // Reset Form
    setItemForm({
      title: '',
      subTitle: '',
      weight: '250гр',
      price: 32000,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      category: 'FOOD',
      available: true
    });
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      subTitle: item.subTitle,
      weight: item.weight,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      available: item.available
    });
    setIsAddingItem(true);
  };

  const handleDeleteItem = (id: string) => {
    showConfirm("Та энэ хоолыг цэснээс устгахдаа итгэлтэй байна уу?", () => {
      const updated = menuItems.filter(item => item.id !== id);
      onUpdateMenu(updated);
      showAlert("Хоол цэснээс амжилттай устгагдлаа.");
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      
      {/* Top Beautiful Navbar matching Screenshot 3 */}
      <nav className="bg-[#a21c1c] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-rose-900 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden">
            <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#fda4af]">Mенежерийн удирдлага</span>
            <h1 className="text-xl font-bold tracking-tight">{config.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <span className="text-[11px] bg-red-950/40 text-rose-200 px-3 py-1 rounded-full border border-red-800 font-bold font-mono">
            Сүүлд шинэчлэгдсэн: 2026-06-17 12:45
          </span>
          <button
            onClick={onLogOut}
            className="p-1 px-3 text-xs bg-red-950/30 hover:bg-black/25 text-white font-bold rounded-lg border border-red-700/55 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Гарах</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-100">
        
        {/* Left Sidebar Menu Options */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-2 flex-shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-2 mb-3">Хяналтын горим</p>
          
          <button
            onClick={() => setActiveTab('consolidated')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'consolidated'
                ? 'bg-[#a21c1c]/10 text-[#a21c1c]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Нэгтгэсэн Дашбоард</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('survey-followups');
              setFollowupStatusFilter('ALL');
            }}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'survey-followups'
                ? 'bg-[#a21c1c]/10 text-[#a21c1c]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>Харилцагчийн санал хүсэлт</span>
            {surveys.filter(s => s.followUpStatus === 'PENDING' && s.phoneNumber).length > 0 && (
              <span className="ml-auto w-4.5 h-4.5 bg-amber-500 text-black font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {surveys.filter(s => s.followUpStatus === 'PENDING' && s.phoneNumber).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu-editor')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'menu-editor'
                ? 'bg-[#a21c1c]/10 text-[#a21c1c]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>Рестораны меню засах</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#a21c1c]/10 text-[#a21c1c]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span>Ширээний захиалгууд</span>
            {orders.length > 0 && (
              <span className="ml-auto w-5 h-5 bg-red-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#a21c1c]/10 text-[#a21c1c]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 focus:animate-spin" />
            <span>Рестораны Тохиргоо</span>
          </button>

          <div className="pt-6 border-t border-slate-100">
            {/* Live Sync Information Display */}
            <div className="p-3 bg-emerald-50 text-[10px] rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
              <span className="font-bold flex items-center gap-1 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Систем идэвхтэй байна
              </span>
              <p className="text-slate-500 font-medium">Менежерийн цэс засалт ба хүлээгдэж буй санал шийдвэрлэлтүүд хэрэглэгчийн QR-д шууд хамт шинэчлэгдэнэ.</p>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
          
          {/* TAB 1: Consolidated Survey Insights */}
          {activeTab === 'consolidated' && (
            <div className="space-y-6">
              
              {/* Date Filter Bar matching Screenshot 3 */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                {/* Inputs Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-500">Эхлэх:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:border-[#a21c1c]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Дуусах:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:border-[#a21c1c]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={clearFilters}
                      type="button"
                      className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                    >
                      Цэвэрлэх
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-500 font-semibold bg-slate-100/50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Нийт: <span className="text-[#a21c1c] font-bold">{kpis.total} хариулт</span>
                </div>
              </div>

              {/* KPI Score Panels Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-300"></div>
                  <span className="text-[9px] uppercase font-mono font-black text-slate-400 tracking-wider">НИЙТ ХАРИУЛТ</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1.5">{kpis.total}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">үйлчлүүлэгч</span>
                </div>

                {/* KPI 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
                  <span className="text-[9px] uppercase font-mono font-black text-indigo-400 tracking-wider">ДУНДАЖ ОНОО</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1.5">{kpis.average}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">/ 5.0 оноо</span>
                </div>

                {/* KPI 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500"></div>
                  <span className="text-[9px] uppercase font-mono font-black text-amber-500 tracking-wider">NPS ОНОО</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 mt-1.5">{kpis.nps}</span>
                  <span className="text-[10px] font-extrabold text-amber-600 mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {Number(kpis.nps) >= 50 ? 'Гайхалтай сайн' : Number(kpis.nps) >= 0 ? 'Дундаж' : 'Сайжруулах шаардлагатай'}
                  </span>
                </div>

                {/* KPI 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-sky-500"></div>
                  <span className="text-[9px] uppercase font-mono font-black text-sky-500 tracking-wider">CSAT</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-sky-600 mt-1.5">{kpis.csat}%</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">% сэтгэл хангалуун</span>
                </div>

              </div>

              {/* Progress Bar Chart Breakdown */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="font-extrabold text-[#7c1d1d] text-sm sm:text-base flex items-center gap-1.5 select-none">
                    <span>📊</span> Асуулт бүрийн дундаж оноо
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Барааны үнэлгээ, бүтээгдэхүүний хөгжил, орчин цэвэрлэгээний үнэлгээнүүд</p>
                </div>

                <div className="space-y-5">
                  {[
                    { label: 'Өнөөдрийн үйлчилгээнд хэр сэтгэл хангалуун байна вэ?', score: questionAverages[0], color: 'bg-[#1e293b]' },
                    { label: 'Хоолны чанар, амт', score: questionAverages[1], color: 'bg-[#b91c1c]' },
                    { label: 'Үнэ нь чанартай харьцуулахад зохистой юу?', score: questionAverages[2], color: 'bg-[#059669]' },
                    { label: 'Үйлчлүүлэгчийн харилцаа, эелдэг байдалд хэр үнэлэх вэ?', score: questionAverages[3], color: 'bg-[#7c3aed]' },
                    { label: 'Орчин тохилог, цэвэр байдал', score: questionAverages[4], color: 'bg-[#06b6d4]' }
                  ].map((item, index) => {
                    // Maximum width calculations
                    const percentOfFive = (item.score / 5) * 100;
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between items-start text-xs sm:text-[13px] font-semibold text-slate-700 leading-normal">
                          <span className="max-w-[85%]">{item.label}</span>
                          <span className="font-mono text-slate-800 bg-slate-100 rounded px-1">{item.score || '0.0'}</span>
                        </div>

                        {/* Visual Progress Track */}
                        <div className="relative w-full h-6 sm:h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
                          <div 
                            className={`h-full ${item.color} rounded-l-lg transition-all duration-1000 flex items-center px-3 justify-end text-[10px] text-white font-black font-mono`}
                            style={{ width: `${percentOfFive}%` }}
                          >
                            <span>{percentOfFive.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NPS distribution breakdown exactly as Screenshot 3 */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="font-extrabold text-[#7c1d1d] text-sm sm:text-base flex items-center gap-1.5 select-none font-sans">
                    <span>⭐</span> NPS — Найз танилдаа санал болгох магадлал
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Нийт хэрэглэгчдийн сэтгэл ханамжийн ангилал, өсөлтийн индекс</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                  {/* Promoter item */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4.5 rounded-xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">PROMOTER (Дэмжигч)</span>
                    <span className="text-[11px] text-slate-500 block">9–10 оноо</span>
                    <span className="text-3xl font-black text-emerald-600 block">{npsDetailed.prom}</span>
                    <span className="text-xs font-semibold font-mono text-emerald-700">{npsDetailed.promPct}% үйлчлүүлэгч</span>
                  </div>

                  {/* Passive item */}
                  <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">PASSIVE (Идэвхгүй)</span>
                    <span className="text-[11px] text-slate-500 block">7–8 оноо</span>
                    <span className="text-3xl font-black text-amber-600 block">{npsDetailed.pass}</span>
                    <span className="text-xs font-semibold font-mono text-amber-700">{npsDetailed.passPct}% үйлчлүүлэгч</span>
                  </div>

                  {/* Detractor item */}
                  <div className="bg-rose-50 border border-rose-200 p-4.5 rounded-xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800">DETRACTOR (Шүүмжлэгч)</span>
                    <span className="text-[11px] text-slate-500 block">0–6 оноо</span>
                    <span className="text-3xl font-black text-[#a21c1c] block">{npsDetailed.detr}</span>
                    <span className="text-xs font-semibold font-mono text-rose-700">{npsDetailed.detrPct}% үйлчлүүлэгч</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Customer feedback follow-up system */}
          {activeTab === 'survey-followups' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4.5 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Хэрэглэгчийн санал, гомдол шийдвэрлэлт</h3>
                  <p className="text-xs text-slate-500 mt-1">Сэтгэгдэл эсвэл утасны дугаараа үлдээсэн хэрэглэгчидтэй холбогдож асуудлыг шийдэх, хянах хэсэг</p>
                </div>
                
                {/* Active counters */}
                <div className="flex gap-2.5">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    Pending: {surveys.filter(s => s.followUpStatus === 'PENDING').length}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolved: {surveys.filter(s => s.followUpStatus === 'RESOLVED').length}
                  </span>
                </div>
              </div>

              {/* Date Filter Bar matching requested feature */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                {/* Inputs Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-500">Огноо Эхлэх:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:border-[#a21c1c]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Дуусах:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:border-[#a21c1c]"
                    />
                  </div>

                  {(startDate || endDate) && (
                    <div className="flex gap-2">
                      <button
                        onClick={clearFilters}
                        type="button"
                        className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                      >
                        Цэвэрлэх
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-500 font-semibold bg-slate-100/50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Шүүгдсэн: <span className="text-[#a21c1c] font-bold">{filteredFollowups.length} санал</span>
                </div>
              </div>

              {/* Filtering bar */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center gap-4 text-xs font-semibold">
                
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={followupSearch}
                    onChange={(e) => setFollowupSearch(e.target.value)}
                    placeholder="Сэтгэгдэл эсвэл утасны дугаараар шүүх..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#a21c1c] font-medium"
                  />
                </div>

                {/* Status Toggle buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">Төлөв:</span>
                  {(['ALL', 'PENDING', 'RESOLVED', 'UNRESOLVED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFollowupStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        followupStatusFilter === status
                          ? 'bg-[#a21c1c] text-white'
                          : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'ALL' && 'Бүгд'}
                      {status === 'PENDING' && 'Хүлээгдэж буй'}
                      {status === 'RESOLVED' && 'Шийдсэн'}
                      {status === 'UNRESOLVED' && 'Шийдээгүй'}
                    </button>
                  ))}
                </div>

              </div>

              {/* Followups List */}
              <div className="space-y-4">
                {filteredFollowups.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Шүүлтэд тохирох санал гомдол олдсонгүй.</p>
                  </div>
                ) : (
                  filteredFollowups.map((resp) => {
                    const avgRating = ((resp.rating1 + resp.rating2 + resp.rating3 + resp.rating4 + resp.rating5) / 5).toFixed(1);
                    return (
                      <div key={resp.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">
                                Үнэлгээний дундаж: <span className="text-[#a21c1c] font-mono">{avgRating} оноо</span>
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                ({new Date(resp.createdAt).toLocaleDateString()} {new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </div>
                            
                            {/* Individual ratings indicator */}
                            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                              <span>Үйлчилгээ: {resp.rating1}</span>•
                              <span>Амт: {resp.rating2}</span>•
                              <span>Үнэ: {resp.rating3}</span>•
                              <span>Ажилтан: {resp.rating4}</span>•
                              <span>Орчин: {resp.rating5}</span>
                            </div>
                          </div>

                          {/* Quick Callback button */}
                          {resp.phoneNumber && (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 text-[#a21c1c] font-bold font-mono px-3 py-1.5 rounded-xl text-xs">
                              <Phone className="w-3.5 h-3.5 fill-[#a21c1c]" />
                              <span>утсаар залгах: {resp.phoneNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Comment text body */}
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Сэтгэгдэл /Санал хүсэлт/:</span>
                          <p className="text-xs sm:text-sm text-slate-755 leading-relaxed italic font-medium">
                            "{resp.comment || 'Амаар болон тодорхой сэтгэгдэл үлдээгээгүй.'}"
                          </p>
                        </div>

                        {/* Action controllers */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500">NPS Дэмжлэг:</span>
                            <span className={`text-[10px] sm:text-xs font-bold border rounded-full px-2.5 py-0.5 ${
                              resp.nps >= 9 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                              resp.nps >= 7 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                              'text-red-700 bg-rose-50 border-rose-200'
                            }`}>
                              NPS: {resp.nps} оноо
                            </span>
                          </div>

                          {/* Status buttons */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Шийдвэрлэлтийн төлөв:</span>
                            
                            <button
                              onClick={() => handleUpdateFollowupStatus(resp.id, 'PENDING')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                resp.followUpStatus === 'PENDING'
                                  ? 'bg-amber-500 text-black border border-amber-600'
                                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Хүлээгдэж буй</span>
                            </button>

                            <button
                              onClick={() => handleUpdateFollowupStatus(resp.id, 'RESOLVED')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                resp.followUpStatus === 'RESOLVED'
                                  ? 'bg-emerald-600 text-white border border-emerald-700'
                                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Шийдсэн</span>
                            </button>

                            <button
                              onClick={() => handleUpdateFollowupStatus(resp.id, 'UNRESOLVED')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                resp.followUpStatus === 'UNRESOLVED'
                                  ? 'bg-red-600 text-white border border-red-700'
                                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Шийдээгүй</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 3: Menu content editor */}
          {activeTab === 'menu-editor' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Рестораны QR Меню засварлагч</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Шинэ хоол ундаа нэмэх, үнэ солих, сэрвэрээс авах болон бусад зүйлсийг засварлана. Энд оруулсан өөрчлөлт харилцагчийн утсан дээр шууд харагдана.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      title: '',
                      subTitle: '',
                      weight: '250гр',
                      price: 25000,
                      description: '',
                      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                      category: 'FOOD',
                      available: true
                    });
                    setIsAddingItem(true);
                  }}
                  className="px-4 py-2.5 bg-[#a21c1c] hover:bg-[#861616] text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md shadow-rose-950/20 shrink-0"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Шинийг нэмэх</span>
                </button>
              </div>

              {/* QR Code and Print Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#a21c1c]" />
                    Статик QR цэсний хэвлэмэл хуудас
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Харилцагч энэхүү QR кодыг утасныхаа камераар уншуулснаар танай цэс рүү шууд шилжих бөгөөд хоол захиалга, сэтгэл ханамж тандалтыг хийнэ. Хуудсыг хэвлэж ширээн бүр дээр наахад тохиромжтой.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all select-all">
                    URL: {window.location.origin}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-4 bg-[#7c1d1d]/5 hover:bg-[#7c1d1d]/10 transition-colors select-none">
                  {/* Real Scannable QR Code dynamically matching current host */}
                  <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`}
                      alt="Restaurant Menu QR Code"
                      className="w-24 h-24 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[8.5px] font-mono font-bold tracking-widest text-slate-500 mt-2 text-center uppercase">SCAN QR ORDER</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      showAlert("QR холбоос санах ойд амжилттай хуулагдлаа!");
                    }}
                    className="mt-3.5 text-[10px] text-red-700 hover:text-red-900 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Холбоос хуулах</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inventory details and dialog */}
              <AnimatePresence>
                {isAddingItem && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]"
                    >
                      <h4 className="font-extrabold text-[#7c1d1d] text-base mb-4 flex items-center gap-2">
                        {editingItem ? '✏️ Хоолны мэдээлэл засах' : '➕ Шинэ хоол нэмэх'}
                      </h4>

                      <form onSubmit={handleSaveItem} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Title */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Хоолны нэр /Монголоор, Англиар/:</label>
                            <input
                              type="text"
                              required
                              value={itemForm.title}
                              onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                              placeholder="Жишээ: Samgyeopsal 삼겹살"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#a21c1c]"
                            />
                          </div>

                          {/* Korean Name */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Орчуулга /Солонгос, Хятад нэр/:</label>
                            <input
                              type="text"
                              value={itemForm.subTitle}
                              onChange={(e) => setItemForm({ ...itemForm, subTitle: e.target.value })}
                              placeholder="Жишээ: 삼겹살"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#a21c1c]"
                            />
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* Price */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Үнэ (МӨНГӨН ДҮН):</label>
                            <input
                              type="number"
                              required
                              value={itemForm.price}
                              onChange={(e) => setItemForm({ ...itemForm, price: Math.max(0, parseInt(e.target.value) || 0) })}
                              placeholder="39900"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#a21c1c]"
                            />
                          </div>

                          {/* Weight */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Хэмжээ (Weight):</label>
                            <input
                              type="text"
                              required
                              value={itemForm.weight}
                              onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })}
                              placeholder="250гр"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#a21c1c]"
                            />
                          </div>

                          {/* Category */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Цэсний аяга /Ангилал/:</label>
                            <select
                              value={itemForm.category}
                              onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as MenuCategory })}
                              className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#a21c1c] font-sans"
                            >
                              {configCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label} ({cat.id})
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">Тайлбар /Орц жор, бүтэц/:</label>
                          <textarea
                            rows={3}
                            value={itemForm.description}
                            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            placeholder="Найрлага, 48 цаг дарсан зөөлөрүүлсэн амт..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#a21c1c]"
                          />
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <input
                            type="checkbox"
                            id="is-available-box"
                            checked={itemForm.available}
                            onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                            className="w-4 h-4 text-[#a21c1c]"
                          />
                          <label htmlFor="is-available-box" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                            Энэ хоолны нөөц бэлэн байгаа эсэх (Захиалахад харагдана)
                          </label>
                        </div>

                        {/* Actions buttons */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                          <button
                            type="button"
                            onClick={() => setIsAddingItem(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                          >
                            Цуцлах
                          </button>
                          
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>Хадгалах</span>
                          </button>
                        </div>

                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Editable listings tables */}
              <div className="grid grid-cols-1 gap-6">
                {(['FOOD', 'ALCOHOL', 'WINE', 'DRINKS'] as MenuCategory[]).map((catName) => {
                  const categoryItems = menuItems.filter(i => i.category === catName);
                  const catConfig = configCategories.find(c => c.id === catName);
                  const displayLabel = catConfig ? catConfig.label : catName;
                  return (
                    <div key={catName} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="bg-slate-100/75 p-3.5 px-5 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase font-sans">{displayLabel} ({catName})</span>
                        <span className="text-xs font-bold text-slate-400 font-mono">({categoryItems.length} хоол)</span>
                      </div>

                      {categoryItems.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">Энэ ангилалд хоол байхгүй байна.</div>
                      ) : (
                        <div className="overflow-x-auto select-none">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                              <tr>
                                <th className="p-4 px-5">Зураг</th>
                                <th className="p-4">Хоолны нэр / Нэрс / Тайлбар</th>
                                <th className="p-4">Хэмжээ</th>
                                <th className="p-4">Үнэ</th>
                                <th className="p-4">Төлөв</th>
                                <th className="p-4 text-right">Үйлдэл</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {categoryItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="p-4 px-5">
                                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  </td>
                                  <td className="p-4 max-w-[280px]">
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold text-slate-800 text-sm block leading-tight">{item.title}</span>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase font-mono">{item.subTitle}</span>
                                      <span className="text-slate-400 block line-clamp-1">{item.description}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-slate-500">{item.weight}</td>
                                  <td className="p-4 font-mono font-bold text-emerald-600 text-sm">₮{item.price.toLocaleString()}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.available 
                                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                                        : 'text-red-700 bg-rose-50 border border-rose-200'
                                    }`}>
                                      {item.available ? 'Идэвхтэй' : 'Дууссан'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 bg-slate-1 w-9 h-9 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                                        title="Засах"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-2 bg-slate-1 w-9 h-9 text-slate-500 hover:text-red-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                                        title="Устгах"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: Active Dining Orders view */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 block sm:flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="font-extrabold text-[#7c1d1d] text-base font-sans select-none">
                    🍽️ Ширээний идэвхтэй захиалгын хяналт
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Харилцагч Камераар QR уншуулан явуулсан ширээний хоолны захиалгат урсгал
                  </p>
                </div>

                <div className="text-xs font-mono font-semibold bg-slate-50 p-2 border border-slate-200 rounded-lg text-slate-500 max-w-[200px] text-center mt-2.5 sm:mt-0">
                  Нийт захиалга: <span className="text-[#a12] font-black">{orders.length} ширээ</span>
                </div>
              </div>

              {/* List of orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {orders.length === 0 ? (
                  <div className="col-span-1 sm:col-span-3 text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-500">
                    <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-500">Идэвхтэй захиалга байхгүй байна.</p>
                    <p className="text-xs text-slate-400 mt-1">Клиент талаас хоол нэмээд "Захиалга илгээх" товчийг дарж шалгаарай.</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-2xl border border-slate-250 p-5 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center border-b border-dashed border-slate-150 pb-2.5">
                          <span className="text-sm font-extrabold text-slate-800">Захиалга: #{ord.id.substring(3, 7)}</span>
                          <span className="text-[#a21c1c] font-black tracking-tight text-sm font-mono bg-rose-50 border border-rose-100 rounded-lg px-2 text-center">
                            Ширээ {ord.tableNumber}
                          </span>
                        </div>

                        {/* Order items lists */}
                        <div className="space-y-1.5 flex-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-medium text-slate-700">
                              <span className="text-slate-500 shrink-0 font-mono font-bold mr-1">{it.quantity} х</span>
                              <span className="flex-1 truncate text-left font-semibold">{it.title}</span>
                              <span className="text-slate-500 font-mono">₮{(it.price * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-dashed border-slate-150 pt-2.5 flex justify-between items-center">
                          <span className="text-[11px] text-slate-400 font-bold">Нийт дүн:</span>
                          <span className="text-base font-extrabold font-mono text-emerald-600">₮{ord.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Status state buttons or actions controllers */}
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-205 flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                          <span className="font-bold text-slate-400">Төлөв:</span>
                          <span className="font-mono text-xs text-amber-650 font-extrabold flex items-center gap-1.5 uppercase">
                            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                            ШИНЭ / ХҮЛЭЭГДЭЖ БУЙ
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            showConfirm(`Ширээ ${ord.tableNumber}-н захиалгыг бэлэн болгож хаах уу?`, () => {
                              const updated = orders.filter(o => o.id !== ord.id);
                              onUpdateOrders(updated);
                              showAlert("Ордер амжилттай хаагдлаа.");
                            });
                          }}
                          className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                        >
                          ✓ Бэлдсэн / Хаах
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Settings and Config panels */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 block sm:flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="font-extrabold text-[#7c1d1d] text-base font-sans select-none">
                    ⚙️ Рестораны Нэгдсэн Тохиргоо & Хамгаалалт
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Эндээс та рестораны нэр, лого, цэсний ангилал болон менежерийн нэвтрэх хамгаалалтын кодыг удирдах боломжтой.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Profile Customizer Card */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    1. Рестораны Ерөнхий Мэдээлэл
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    *Бүх хэрэглэгчийн гар утас болон захиалгын дэлгэцэнд энд оруулсан мэдээллүүд шууд харуулагдах болно.
                  </p>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Рестораны Нэр</label>
                      <input
                        type="text"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="Миний Ресторан"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:border-red-655"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Дэд гарчиг / Уриа</label>
                      <input
                        type="text"
                        value={configSubTitle}
                        onChange={(e) => setConfigSubTitle(e.target.value)}
                        placeholder="Ухаалаг меню & Сэтгэл ханамжийн судалгаа"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:border-red-655"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Логоны зургийн URL хаяг</label>
                      <input
                        type="text"
                        value={configLogoUrl}
                        onChange={(e) => setConfigLogoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-sans text-slate-700 focus:outline-none focus:border-red-655"
                      />
                      <div className="mt-2 flex gap-3 items-center">
                        <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] sm:text-xs px-3.5 py-2 rounded-lg border border-slate-300 cursor-pointer transition-colors block text-center">
                          📁 Лого зураг оруулах (Upload Logo)
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(e.target.files[0], (base64) => {
                                  setConfigLogoUrl(base64);
                                });
                              }
                            }}
                          />
                        </label>
                        {configLogoUrl && (
                          <img src={configLogoUrl} alt="Logo preview" className="w-10 h-10 object-cover rounded-lg border shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => {
                          onUpdateConfig({
                            ...config,
                            name: configName,
                            subTitle: configSubTitle,
                            logoUrl: configLogoUrl,
                            categories: configCategories
                          });
                          showAlert('Рестораны ерөнхий мэдээлэл болон ангиллын тохиргоонууд амжилттай хадгалагдлаа!');
                        }}
                        className="bg-[#a21c1c] hover:bg-red-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-lg uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Мэдээлэл хадгалах
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Customizer Card */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    2. Цэсний Ангилал Тохируулах (Category Config)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Эндээс хоол, ундааны 4 үндсэн ангиллын нэр болон дэд тайлбарыг өөрчлөх, мөн заримыг нь цэснээс нууж (hide), харуулах тохиргоог хийнэ үү.
                  </p>

                  <div className="space-y-4 pt-1">
                    {configCategories.map((cat, idx) => (
                      <div key={cat.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#a21c1c] font-mono uppercase tracking-wider">
                            ID: {cat.id}
                          </span>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={cat.visible}
                              onChange={(e) => {
                                const updated = [...configCategories];
                                updated[idx] = { ...cat, visible: e.target.checked };
                                setConfigCategories(updated);
                              }}
                              className="w-3.5 h-3.5 text-[#a21c1c] rounded"
                            />
                            Харагдах эсэх
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Ангиллын Нэр</label>
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => {
                                const updated = [...configCategories];
                                updated[idx] = { ...cat, label: e.target.value };
                                setConfigCategories(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-655"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-450 font-extrabold block mb-1">Дэд тайлбар</label>
                            <input
                              type="text"
                              value={cat.subtitle}
                              onChange={(e) => {
                                const updated = [...configCategories];
                                updated[idx] = { ...cat, subtitle: e.target.value };
                                setConfigCategories(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-red-655"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => {
                          onUpdateConfig({
                            ...config,
                            categories: configCategories
                          });
                          showAlert('Цэсний ангиллын тохиргоо, нэрсийн өөрчлөлтийг амжилттай хадгаллаа!');
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Зөвхөн Ангиллуудыг Хадгалах
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Security Manager PIN with Verification Email confirmation Code */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    3. Менежерийн Нэвтрэх хамгаалалт (ПИН Код)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Менежерийн нэвтрэх кодыг өөрчлөхдөө өөрийн бүртгэлтэй имэйл хаягаар баталгаажуулах код хүлээн авдаг байх шаардлагатай.
                  </p>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">Менежерийн Баталгаажуулах Имэйл хаяг</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={configManagerEmail}
                          onChange={(e) => setConfigManagerEmail(e.target.value)}
                          placeholder="haliunaa.dolgorjav@gmail.com"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-sans text-slate-800 focus:outline-none focus:border-red-655"
                        />
                        <button
                          onClick={() => {
                            onUpdateConfig({
                              ...config,
                              managerEmail: configManagerEmail
                            });
                            showAlert(`Имэйл хаягийг амжилттай тохирууллаа: ${configManagerEmail}`);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold text-xs px-3.5 rounded-lg border border-slate-300 transition-colors"
                        >
                          Имэйл хадгалах
                        </button>
                      </div>
                    </div>

                    {/* PIN modification wizard layout based on pinChangeStep */}
                    <div className="p-4 rounded-xl border border-dashed border-red-200 bg-rose-50/20 space-y-3.5">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7c1d1d] flex items-center gap-1 leading-none">
                        <Key className="w-3.5 h-3.5" />
                        ПИН Засах Алхам
                      </span>

                      {pinChangeStep === 'IDLE' && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            Та ПИН код солихыг хүсвэл доорх товч дээр хүрч <span className="text-indigo-600 font-bold font-mono">{configManagerEmail}</span> хаяг руу 6-оронтой баталгаажуулах код илгээнэ үү.
                          </p>
                          <button
                            onClick={() => {
                              // Send request
                              const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
                              setGeneratedOtpCode(randomOtp);
                              setPinChangeStep('OTP_INPUT');
                              setOtpCodeInput('');
                              setOtpError('');
                              setShowOtpInboxSim(true);
                              showAlert(`${configManagerEmail} хаяг руу 6 оронтой баталгаажуулах код илгээлээ. Доорх Имэйл Хайрцаг уншуулагчийг нээн кодыг авна уу!`);
                            }}
                            className="bg-gradient-to-r from-[#a21c1c] to-[#7c1d1d] hover:from-red-800 hover:to-red-900 text-white font-bold text-xs p-3.5 rounded-lg uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5 w-full shadow"
                          >
                            <Mail className="w-4 h-4 shrink-0" />
                            <span>Имэйлээр Баталгаажуулах код илгээх</span>
                          </button>
                        </div>
                      )}

                      {pinChangeStep === 'OTP_INPUT' && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-extrabold text-[#a12]">{configManagerEmail}</span> хаяг руу 6 оронтой код илгээгдсэн. Кодыг доор оруулж нэвтрэх эрхээ баталгаажуулна уу:
                          </p>
                          
                          <div className="space-y-1.5 font-sans">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCodeInput}
                              onChange={(e) => setOtpCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Баталгаажуулах 6 оронтой код (OTP)"
                              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-center text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                            {otpError && <p className="text-[10px] text-red-500 font-bold">✗ {otpError}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                if (otpCodeInput === generatedOtpCode) {
                                  setPinChangeStep('NEW_PIN_INPUT');
                                  setOtpError('');
                                  setNewPinCodeInput('');
                                } else {
                                  setOtpError('Баталгаажуулах код буруу байна, дахин шалгана уу!');
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer"
                            >
                              Баталгаажуулах
                            </button>
                            <button
                              onClick={() => {
                                setPinChangeStep('IDLE');
                                setShowOtpInboxSim(false);
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2.5 rounded-lg cursor-pointer"
                            >
                              Цуцлах
                            </button>
                          </div>
                        </div>
                      )}

                      {pinChangeStep === 'NEW_PIN_INPUT' && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            Амжилттай баталгаажлаа! Одоо өөрийн ашиглах оронтой шинэ ПИН кодыг оруулна уу:
                          </p>

                          <div>
                            <input
                              type="text"
                              maxLength={4}
                              value={newPinCodeInput}
                              onChange={(e) => setNewPinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Шинэ 4 оронтой ПИН код"
                              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-center text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                            />
                            {newPinCodeInput && newPinCodeInput.length < 4 && (
                              <p className="text-[9px] text-amber-500 font-bold block mt-1">✓ ПИН код яг 4 оронтой тоо байх ёстой.</p>
                            )}
                          </div>

                          <button
                            disabled={newPinCodeInput.length < 4}
                            onClick={() => {
                              onUpdateConfig({
                                ...config,
                                managerPin: newPinCodeInput
                              });
                              setPinChangeStep('SUCCESS');
                              setShowOtpInboxSim(false);
                              showAlert(`Менежерийн шинэ ПИН код амжилттай тохируулж хадгаллаа! Дараа нэвтрэхэд: ${newPinCodeInput} ашиглана уу.`);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Шинэ ПИН Код Хадгалах
                          </button>
                        </div>
                      )}

                      {pinChangeStep === 'SUCCESS' && (
                        <div className="text-center py-4 space-y-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                            <Check className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-emerald-850">Менежерийн ПИН код амжилттай шинэчлэгдлээ!</p>
                          <button
                            onClick={() => setPinChangeStep('IDLE')}
                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                          >
                            Дуусгах
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Highly Interactive Simulated Inbox logs displayed as actual emails inside the developer workspace container */}
                    {showOtpInboxSim && generatedOtpCode && (
                      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#8c1e1e]"></div>
                        <span className="text-[9px] text-[#a21c1c] uppercase font-bold block mb-2 select-none tracking-widest">
                          ⚡ SMTP Sandbox Email Terminal (Туршилтын Орчин)
                        </span>
                        <div className="space-y-1">
                          <p className="text-slate-400 font-bold">Илгээгч: mailer-daemon@smartmenu.mn</p>
                          <p className="text-slate-400 font-bold">Хүлээн авагч: {configManagerEmail}</p>
                          <p className="text-slate-400 font-bold">Гарчиг: ПИН код солих баталгаажуулах код</p>
                          <div className="text-slate-200 bg-black/40 p-2.5 rounded border border-white/5 my-2 text-xs">
                            Сайн байна уу, манай бүтээгдэхүүнийг ашиглаж буй танд баярлалаа. <br />
                            Менежерийн аюулгүй байдлын нэвтрэх ПИН кодыг өөрчлөх таны 6 оронтой баталгаажуулах код:
                            <div className="text-center text-lg font-black text-amber-400 font-mono tracking-widest py-2 bg-amber-500/10 rounded my-1.5 select-all">
                              {generatedOtpCode}
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-tight">Энэхүү код нь 3 минутын дараа хүчингүй болно. Харилцагч та бусдад үүнийг бүү дамжуулна уу.</span>
                          </div>
                          <p className="text-[#4ade80] text-[10px] font-bold flex items-center gap-1.5 mt-3 select-none">
                            <span>✓ Status: Simulated Inbox Delivered successfully</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Sandbox-friendly custom alert modal */}
      <AnimatePresence>
        {customAlert && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed font-sans">
                {customAlert.message}
              </p>
              <button
                type="button"
                onClick={() => setCustomAlert(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Ойлголоо / Хаах
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sandbox-friendly custom confirm modal */}
      <AnimatePresence>
        {customConfirm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed font-sans">
                {customConfirm.message}
              </p>
              <div className="flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setCustomConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Үгүй
                </button>
                <button
                  type="button"
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                  className="flex-1 py-2.5 bg-[#a21c1c] hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Тийм
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
