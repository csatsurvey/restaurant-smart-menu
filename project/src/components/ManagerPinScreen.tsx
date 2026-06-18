import React, { useState } from 'react';
import { Delete, Lock, ShieldAlert, Eye, EyeOff, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { RestaurantConfig } from '../types';

interface ManagerPinScreenProps {
  config: RestaurantConfig;
  onUnlock: () => void;
  onClose: () => void;
}

export const ManagerPinScreen: React.FC<ManagerPinScreenProps> = ({
  config,
  onUnlock,
  onClose
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    setPinError(false);
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === config.managerPin) {
        // Authenticated!
        onUnlock();
      } else {
        // Shaking error
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1200);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPinError(false);
      setPin(pin.slice(0, -1));
    }
  };

  const badgeInitial = config?.name ? config.name.slice(0, 1).toUpperCase() : 'M';

  return (
    <div className="fixed inset-0 bg-[#8c1e1e] flex flex-col items-center justify-center p-4 z-40 select-none">
      
      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 px-4 py-2 text-xs font-bold text-white/50 hover:text-white bg-black/15 hover:bg-black/35 rounded-lg cursor-pointer transition-all"
      >
        Хэрэглэгчийн цэс
      </button>

      {/* Main card matching Screenshot 2 */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative"
      >
        {/* Chef/Restaurant Logo Badge */}
        <div className="w-24 h-24 rounded-full border border-slate-200 p-1 bg-white flex items-center justify-center shadow-inner relative overflow-hidden mb-4">
          {config?.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt={config.name} 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="rounded-full bg-slate-50 w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-300">
              <Key className="w-8 h-8 text-slate-400" />
              <span className="text-[7.5px] font-mono font-extrabold tracking-wide text-gray-500 mt-1 uppercase">{badgeInitial}</span>
            </div>
          )}
        </div>

        {/* Name and subtitle */}
        <h2 className="text-xl font-extrabold text-[#7c1d1d] text-center tracking-tight leading-tight select-none">
          {config?.name || "Манай Ресторан"}
        </h2>
        <p className="text-[11px] text-slate-500 font-medium text-center mt-1 mb-6">
          {config?.subTitle || "Сэтгэл ханамжийн судалгааны систем"}
        </p>

        {/* 4 dots entry indicators */}
        <div className="flex justify-center items-center gap-4.5 mb-8">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <motion.div
                key={index}
                animate={pinError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                className={`w-4.5 h-4.5 rounded-full border-2 transition-all duration-150 ${
                  pinError
                    ? 'bg-red-500 border-red-500'
                    : isFilled
                    ? 'bg-[#7c1d1d] border-[#7c1d1d] scale-110'
                    : 'bg-white border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Shaking PIN failure indicator */}
        {pinError && (
          <p className="text-xs font-bold text-red-600 mb-4 bg-red-100/75 border border-red-200 rounded-lg px-3.5 py-1.5 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Нэвтрэх код буруу байна!</span>
          </p>
        )}

        {/* PIN Keyboard grid layout matching Screenshot 2 */}
        <div className="grid grid-cols-3 gap-y-3 gap-x-5 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-14 w-14 sm:h-15 sm:w-15 rounded-full bg-slate-50 text-slate-800 text-lg font-extrabold flex items-center justify-center border border-slate-100 cursor-pointer active:bg-slate-200 active:scale-95 transition-all select-none mx-auto"
            >
              {key}
            </button>
          ))}
          
          {/* Row 4 */}
          <button
            onClick={handleDelete}
            title="Буцах"
            className="h-14 w-14 sm:h-15 sm:w-15 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center border border-red-100 cursor-pointer active:scale-95 transition-all mx-auto"
          >
            <Delete className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 w-14 sm:h-15 sm:w-15 rounded-full bg-slate-50 text-slate-800 text-lg font-extrabold flex items-center justify-center border border-slate-100 cursor-pointer active:bg-slate-200 active:scale-95 transition-all mx-auto"
          >
            0
          </button>

          <div className="h-14 w-14 sm:h-15 sm:w-15 bg-slate-100/25 rounded-full border border-slate-100 cursor-default select-none mx-auto opacity-0" />
        </div>

        {/* Guide PIN tooltip */}
        <p className="text-[10px] text-slate-400 font-mono text-center mt-6">
          Аюулгүй байдлын үүднээс админы пин: <span className="text-[#a12] font-extrabold">{config.managerPin}</span>
        </p>
      </motion.div>
    </div>
  );
};
