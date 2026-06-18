import React, { useState, useEffect } from 'react';
import { CustomerMenuView } from './components/CustomerMenuView';
import { CustomerSurveyModal } from './components/CustomerSurveyModal';
import { ManagerPinScreen } from './components/ManagerPinScreen';
import { ManagerDashboard } from './components/ManagerDashboard';
import { MenuItem, SurveyResponse, RestaurantConfig, Order } from './types';
import { INITIAL_CONFIG, INITIAL_MENU_ITEMS, INITIAL_SURVEY_RESPONSES } from './data';
import { Shield, Sparkles, Utensils, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [role, setRole] = useState<'customer' | 'manager-pin' | 'manager'>('customer');
  
  // Persistent Config State
  const [config, setConfig] = useState<RestaurantConfig>(() => {
    const saved = localStorage.getItem('soso_restaurant_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });
  
  // Persistent Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('soso_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // Persistent Survey Feedback State
  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('soso_survey_responses');
    return saved ? JSON.parse(saved) : INITIAL_SURVEY_RESPONSES;
  });

  // Persistent Active Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('soso_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  // Sync to local storage on memory changes
  useEffect(() => {
    localStorage.setItem('soso_restaurant_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('soso_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('soso_survey_responses', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('soso_orders', JSON.stringify(orders));
  }, [orders]);

  // Handle a new menu list from admin editor
  const handleUpdateMenu = (newMenu: MenuItem[]) => {
    setMenuItems(newMenu);
  };

  // Handle updated survey lists (follow-ups status tweaks)
  const handleUpdateSurveys = (newSurveys: SurveyResponse[]) => {
    setSurveys(newSurveys);
  };

  // Create new customer feedback
  const handleNewSurvey = (newResponse: Omit<SurveyResponse, 'id' | 'createdAt' | 'followUpStatus'>) => {
    const item: SurveyResponse = {
      ...newResponse,
      id: `survey-${Date.now()}`,
      followUpStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setSurveys(prev => [item, ...prev]);
  };

  // Submit table order from client
  const handlePlaceOrder = (items: { menuItemId: string; title: string; quantity: number; price: number }[], table: string) => {
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order: Order = {
      id: `ord-${Date.now()}`,
      tableNumber: table,
      items,
      totalPrice,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [order, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#070907] relative text-slate-100 selection:bg-amber-500 selection:text-[#070907]">
      
      {/* Floating Manager Authentication Switcher at top right (Desktop/Tablet helper) */}
      {role === 'customer' && (
        <div className="absolute top-18 right-2.5 z-40">
          <button
            onClick={() => setRole('manager-pin')}
            className="p-2 sm:px-3 sm:py-1.5 bg-[#141b14]/90 hover:bg-[#a21c1c]/20 border border-white/10 hover:border-red-500/30 rounded-full text-slate-400 hover:text-red-400 text-[10px] font-black tracking-wider uppercase cursor-pointer flex items-center gap-1.5 transition-all shadow-lg backdrop-blur"
            title="Менежерийн удирдлага руу нэвтрэх"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Менежер нэвтрэх /{config.managerPin}/</span>
          </button>
        </div>
      )}

      {/* Main Perspective Router */}
      <AnimatePresence mode="wait">
        {role === 'customer' && (
          <motion.div
            key="customer-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CustomerMenuView
              config={config}
              menuItems={menuItems}
              orders={orders}
              onUpdateOrders={setOrders}
              onOpenSurvey={() => setIsSurveyOpen(true)}
              onPlaceOrder={handlePlaceOrder}
            />
          </motion.div>
        )}

        {role === 'manager-pin' && (
          <motion.div
            key="pin-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ManagerPinScreen
              config={config}
              onUnlock={() => setRole('manager')}
              onClose={() => setRole('customer')}
            />
          </motion.div>
        )}

        {role === 'manager' && (
          <motion.div
            key="manager-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ManagerDashboard
              config={config}
              menuItems={menuItems}
              surveys={surveys}
              orders={orders}
              onUpdateConfig={setConfig}
              onUpdateMenu={handleUpdateMenu}
              onUpdateSurveys={handleUpdateSurveys}
              onUpdateOrders={setOrders}
              onLogOut={() => setRole('customer')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Customer Survey Overlay */}
      <AnimatePresence>
        {isSurveyOpen && (
          <CustomerSurveyModal
            config={config}
            onClose={() => setIsSurveyOpen(false)}
            onSubmit={handleNewSurvey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
