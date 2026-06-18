import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, MenuCategory, Order, OrderItem, RestaurantConfig, CategoryConfig } from '../types';
import { Search, ShoppingBag, Plus, Minus, Check, Star, BookOpen, Utensils, X, Clock, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerMenuViewProps {
  menuItems: MenuItem[];
  config: RestaurantConfig;
  orders: Order[];
  onUpdateOrders?: (updated: Order[]) => void;
  onOpenSurvey: () => void;
  onPlaceOrder: (items: { menuItemId: string; title: string; quantity: number; price: number }[], table: string) => void;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  menuItems,
  config,
  orders,
  onUpdateOrders,
  onOpenSurvey,
  onPlaceOrder
}) => {
  // Get active configurations or defaults
  const categories = useMemo((): CategoryConfig[] => {
    return config.categories || [
      { id: 'FOOD', label: 'Хоол', subtitle: 'Амтат Үндсэн Хоолнууд (Main Dishes)', visible: true },
      { id: 'ALCOHOL', label: 'Согтууруулах ундаа', subtitle: 'Шар айраг & Сормуун Архи (Spirits)', visible: true },
      { id: 'WINE', label: 'Дарс', subtitle: 'Тансаг Дарсны Цуглуулга (Premium Wines)', visible: true },
      { id: 'DRINKS', label: 'Ундаа, Жүүс', subtitle: 'Зөөлөн Ундаа & Жүүс (Soft Drinks)', visible: true }
    ];
  }, [config.categories]);

  const visibleCategories = useMemo(() => {
    return categories.filter(c => c.visible);
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('FOOD');

  // Sync selected category if it gets hidden
  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, selectedCategory]);

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('05');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Active table orders tracking & modal trigger
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  // Last placed order modal tracking for custom customer confirmation popup
  const [lastPlacedOrder, setLastPlacedOrder] = useState<{
    items: { title: string; quantity: number; price: number }[];
    table: string;
    total: number;
  } | null>(null);

  // Group active orders by table number
  const ordersByTable = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    orders.forEach(o => {
      if (!groups[o.tableNumber]) {
        groups[o.tableNumber] = [];
      }
      groups[o.tableNumber].push(o);
    });
    return groups;
  }, [orders]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle count
  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const newQty = (prev[itemId] || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum: number, qty: number) => sum + qty, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum: number, [id, qty]) => {
      const item = menuItems.find(m => m.id === id);
      return sum + (item ? item.price * (qty as number) : 0);
    }, 0);
  }, [cart, menuItems]);

  const handleCheckout = () => {
    if (totalCartCount === 0) return;
    
    const itemsToOrder = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(m => m.id === itemId)!;
      return {
        menuItemId: item.id,
        title: item.title,
        quantity,
        price: item.price
      };
    });

    onPlaceOrder(itemsToOrder, tableNumber);
    setCart({});
    setIsCartOpen(false);
    
    // Set custom order summary details modal for client
    setLastPlacedOrder({
      items: itemsToOrder.map(it => ({ title: it.title, quantity: it.quantity, price: it.price })),
      table: tableNumber,
      total: totalCartPrice
    });

    setShowOrderSuccess(true);
    setTimeout(() => {
      setShowOrderSuccess(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#070907] text-slate-100 flex flex-col font-sans select-none relative pb-28">
      {/* Top Header Row with Menu and Search toggle */}
      <header className="px-5 py-4 flex justify-between items-center border-b border-white/5 bg-[#0a0d0a]/90 backdrop-blur sticky top-0 z-30">
        <button 
          type="button"
          onClick={() => setIsOrdersModalOpen(true)} 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all"
        >
          <Receipt className="w-3.5 h-3.5 text-amber-500" />
          <span>Ширээний захиалга харах</span>
        </button>
        
        <div className="flex items-center gap-1">
          <Utensils className="w-5 h-5 text-amber-500" />
          <span className="font-mono text-xs text-amber-500/80 uppercase font-semibold tracking-wider">{config?.name || "Манай Меню"}</span>
        </div>

        <div className="flex items-center gap-2">
          {totalCartCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-amber-400 hover:text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-[#070907] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {totalCartCount}
              </span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Expandable Search Input */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#0d120d] border-b border-white/5"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Хоол, ундааны нэрээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141b14] text-slate-100 rounded-lg pl-9 pr-8 py-2 text-sm border border-white/10 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md mx-auto px-4 pt-6 flex-1 flex flex-col">
        {/* Styled "Меню" Title exactly as Screenshot 1 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-serif text-amber-150 tracking-wide font-semibold italic opacity-95" style={{ textShadow: '0 2px 10px rgba(139, 92, 26, 0.2)' }}>
            Меню
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2"></div>
        </div>

        {/* Dynamic Horizontal Categories exactly as Screenshot 1 */}
        <div className="flex space-x-2.5 overflow-x-auto pb-4 scrollbar-none justify-center">
          {visibleCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-lg text-xs font-bold tracking-widest transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#2d3a2d]/90 text-[#bbf7d0] border-[#4ade80]/30 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#101310]/60 text-slate-400 border-white/5 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Selected Category subtitle */}
        <div className="text-center py-2 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-500/75">
            {categories.find(c => c.id === selectedCategory)?.subtitle || ''}
          </span>
        </div>

        {/* Menu Items List */}
        <div className="space-y-4 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-white/5 bg-[#0b0e0b]/50 rounded-2xl flex flex-col items-center justify-center">
              <Utensils className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm">Одоогоор энэ ангилалд хоол байхгүй байна.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const countInCart = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`relative p-3.5 bg-[#0f140f] rounded-xl border transition-all ${
                    countInCart > 0 
                      ? 'border-amber-500/30 bg-[#141b14]/90' 
                      : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Details Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between flex-wrap">
                        <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      
                      {/* Price-Weight Tag */}
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="text-xs text-[#a3e635] font-mono">
                          {item.weight}
                        </span>
                        <span className="text-xs text-amber-400 font-bold font-mono">
                          ₮{item.price.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Image Column */}
                    {item.imageUrl && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-amber-500/10 shadow-md relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-[10px] text-red-400 font-bold uppercase rounded border border-red-500/30 px-1">
                              Дууссан
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Control Bar in Card */}
                  <div className="mt-3.5 pt-3.5 border-t border-white/5 flex justify-between items-center bg-[#070907]/30 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-mono">Ширээнд захиалах:</span>
                    {item.available ? (
                      <div className="flex items-center gap-3">
                        {countInCart > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-[#1a231a] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:scale-90 transition-transform"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold font-mono text-amber-400 w-4 text-center">
                              {countInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#1a231a] border border-[#daff4c]/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:scale-90 transition-transform"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 hover:bg-amber-500/20 font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Нэмэх</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Захиалах боломжгүй</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Order Success Toast */}
      <AnimatePresence>
        {showOrderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-24 right-4 left-4 max-w-sm mx-auto bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 p-4 rounded-xl shadow-2xl backdrop-blur flex items-center gap-3.5 z-50"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Захиалга амжилттай илгээгдлээ!</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">Ширээ {tableNumber} руу захиалгыг системд бүртгэлээ.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex flex-col justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-[#0c120c] rounded-t-3xl border-t border-white/10 max-h-[80%] flex flex-col pt-5"
            >
              {/* Header */}
              <div className="px-5 pb-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="font-bold text-lg text-white">Төхөөрөмжийн Тэрэг</h2>
                  <span className="bg-[#121a12] text-amber-400 font-mono text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/10">
                    {totalCartCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 px-3 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  Хаах
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = menuItems.find(m => m.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between items-center gap-4 bg-[#111711] p-3 rounded-xl border border-white/5">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-[#a3e635] font-mono mt-0.5">₮{item.price.toLocaleString()} х {qty}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartQuantity(id, -1)}
                          className="w-7 h-7 rounded bg-[#1a231a] flex items-center justify-center border border-white/5 text-slate-300 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-white text-sm w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateCartQuantity(id, 1)}
                          className="w-7 h-7 rounded bg-[#1a231a] flex items-center justify-center border border-white/5 text-slate-300 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Table selector */}
                <div className="bg-[#141d14]/50 border border-[#daff4c]/5 p-4 rounded-xl space-y-2.5 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Хүрэх Ширээний Дугаар:</span>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="bg-[#182318] border border-white/10 rounded-lg text-sm text-amber-400 font-bold px-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(t => (
                        <option key={t} value={t}>Ширээ {t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom total row */}
              <div className="p-5 border-t border-white/5 bg-[#0a0f0a] space-y-3 pb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-400">Нийт дүн:</span>
                  <span className="text-xl font-bold font-mono text-amber-400">₮{totalCartPrice.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-[#cbd5e1] hover:bg-white text-black font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all scale-100 active:scale-98 cursor-pointer shadow-lg shadow-black/45"
                >
                  ЗАХИАЛГА ИЛГЭЭХ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Gold Satisfaction Survey CTA exactly matching Screenshot 1 */}
      <div className="fixed bottom-0 inset-x-0 bg-[#070907]/80 backdrop-blur pb-5 pt-3 px-4 border-t border-white/5 z-25 flex justify-center">
        <button
          type="button"
          id="survey-trigger-cta"
          onClick={onOpenSurvey}
          className="w-full max-w-md bg-gradient-to-r from-amber-400 to-[#caa540] hover:from-amber-380 hover:to-[#be9830] active:scale-98 text-slate-950 font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          style={{ boxShadow: '0 -4px 30px rgba(245, 158, 11, 0.15)' }}
        >
          <span className="text-base sm:text-base tracking-wide flex items-center gap-1.5">
            ⭐ Сэтгэл ханамжийн судалгаа өгөх
          </span>
        </button>
      </div>

      {/* Active Table Orders View for Waiters/Staff */}
      <AnimatePresence>
        {isOrdersModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0f0b] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4.5 border-b border-white/10 flex justify-between items-center bg-[#0e140e]">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider">
                    Ширээний Захиалгууд (Зөөгч харах хуудас)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrdersModalOpen(false)}
                  className="p-1 px-3 text-xs bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer font-bold"
                >
                  Хаах
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {orders.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                    <p>Одоогоор идэвхтэй ширээний захиалга байхгүй байна.</p>
                  </div>
                ) : (
                  Object.entries(ordersByTable)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([tableNum, tOrders]) => {
                      const typedOrders = tOrders as Order[];
                      return (
                        <div key={tableNum} className="p-3.5 rounded-xl border border-white/5 bg-[#121812]/80 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-sm font-black text-amber-400">
                              ШИРЭЭ {tableNum}
                            </span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                              {typedOrders.length} захиалга
                            </span>
                          </div>
                          
                          <div className="space-y-3 font-medium">
                            {typedOrders.map((ord) => (
                              <div key={ord.id} className="text-xs bg-[#172017]/50 rounded-lg p-3 border border-white/5 space-y-2.5">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                  <span>Үүссэн: {new Date(ord.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span className="text-amber-400 font-extrabold uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">{ord.status}</span>
                                </div>
                                
                                <div className="space-y-1.5">
                                  {ord.items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-200">
                                      <span className="font-medium text-slate-300">{it.title}</span>
                                      <span className="font-mono text-amber-400 font-black">x{it.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                                  <span className="text-slate-405 text-[10px] font-bold">Нийт дүн:</span>
                                  <span className="font-mono font-bold text-[#a3e635]">₮{ord.totalPrice.toLocaleString()}</span>
                                </div>
                                
                                {/* Option for waiter to close / serve */}
                                <div className="pt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onUpdateOrders) {
                                        const updated = orders.filter(o => o.id !== ord.id);
                                        onUpdateOrders(updated);
                                      }
                                    }}
                                    className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer select-none ring-1 ring-emerald-500/20"
                                  >
                                    ✓ Бэлдсэн / Хүлээлгэн өгсөн (Ордер устгах)
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Checkout Success Summary Modal exactly matching requests */}
      <AnimatePresence>
        {lastPlacedOrder && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b0f0b] border border-emerald-500/30 rounded-3xl w-full max-w-sm p-6 text-center space-y-5 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-1">
                <Check className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
              
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
                  Захиалга илгээгдсэн!
                </h2>
                <p className="text-xs text-emerald-400 mt-1 font-bold font-mono bg-emerald-950/40 py-1.5 border border-emerald-950 rounded-lg">
                  ШИРЭЭНИЙ ДУГААР: {lastPlacedOrder.table}
                </p>
              </div>
              
              {/* Checkout success content displays item list, quantity, and total price */}
              <div className="bg-[#121812] rounded-xl p-4 text-left border border-white/5 space-y-3.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1.5">
                  Захиалсан хоолны мэдээлэл:
                </p>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {lastPlacedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-200 gap-3">
                      <span className="font-bold leading-tight text-slate-300">{it.title}</span>
                      <span className="font-mono text-amber-400 text-xs font-black shrink-0 ml-auto">
                        {it.quantity} ширхэг
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-2.5 flex justify-between items-center font-mono">
                  <span className="text-xs text-slate-400 font-bold">Нийт үнийн дүн:</span>
                  <span className="text-amber-400 text-sm font-black">
                    ₮{lastPlacedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setLastPlacedOrder(null)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Зөвшөөрөх / Хаах
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
