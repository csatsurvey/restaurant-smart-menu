import React, { useState } from 'react';
import { SurveyResponse, RestaurantConfig } from '../types';
import { Star, MessageSquare, Phone, Send, X, ShieldAlert, Award, Smile, ExternalLink, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerSurveyModalProps {
  onClose: () => void;
  onSubmit: (response: Omit<SurveyResponse, 'id' | 'createdAt' | 'followUpStatus'>) => void;
  config: RestaurantConfig;
}

export const CustomerSurveyModal: React.FC<CustomerSurveyModalProps> = ({
  onClose,
  onSubmit,
  config
}) => {
  // Survey ratings
  const [rating1, setRating1] = useState(5);
  const [rating2, setRating2] = useState(5);
  const [rating3, setRating3] = useState(5);
  const [rating4, setRating4] = useState(5);
  const [rating5, setRating5] = useState(5);
  const [nps, setNps] = useState(10);
  const [comment, setComment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const questions = [
    { id: 1, label: 'Өнөөдрийн үйлчилгээнд хэр сэтгэл хангалуун байна вэ?', value: rating1, setter: setRating1 },
    { id: 2, label: 'Хоолны чанар, амт', value: rating2, setter: setRating2 },
    { id: 3, label: 'Үнэ нь чанартай харьцуулахад зохистой юу?', value: rating3, setter: setRating3 },
    { id: 4, label: 'Үйлчлүүлэгчийн харилцаа, эелдэг байдалд хэр үнэлэх вэ?', value: rating4, setter: setRating4 },
    { id: 5, label: 'Орчин тохилог, цэвэр байдал', value: rating5, setter: setRating5 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate slight network delay
    setTimeout(() => {
      onSubmit({
        rating1,
        rating2,
        rating3,
        rating4,
        rating5,
        nps,
        comment,
        phoneNumber
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const getNpsLabel = (val: number) => {
    if (val <= 6) return { text: 'Шүүмжлэгч (Detractor)', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    if (val <= 8) return { text: 'Идэвхгүй (Passive)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Дэмжигч (Promoter)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  return (
    <div className="fixed inset-0 bg-[#070907]/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-[#0e130e] border border-white/10 w-full max-w-lg rounded-2xl shadow-3xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-white/5 bg-[#121912] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-extrabold text-base">⭐</span>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-wide">Сэтгэл ханамжийн судалгаа</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-5 max-h-[80vh] scrollbar-thin">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Intro branding banner */}
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-[#182318] to-transparent border border-emerald-500/10">
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">{config?.name || "Манай Ресторан"}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Бид өөрсдийн хоол, үйлчилгээнийхээ чанарыг сайжруулахад таны үнэнч үнэлгээг ашиглах тул тухлан бөглөнө үү.
                  </p>
                </div>

                {/* Normal inline ratings */}
                {/* 5-Star Ratings Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-white/5 pb-1 select-none">
                    I. Ерөнхий үнэлгээ (1-5 оноо)
                  </h3>
                  
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-2.5 p-3 rounded-xl bg-[#121912]/60 border border-white/5">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-xs sm:text-[13px] text-slate-200 font-medium leading-tight">
                          {q.id}. {q.label}
                        </span>
                        <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-1.5 rounded shrink-0">
                          {q.value}.0
                        </span>
                      </div>
                      
                      {/* Interactive Stars Row */}
                      <div className="flex gap-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => q.setter(star)}
                            className="p-1 -ml-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 duration-100"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= q.value
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Net Promoter Score (NPS) Scale 0 to 10 */}
                <div className="space-y-4 pt-1">
                  <div className="flex justify-between items-end border-b border-white/5 pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 select-none">
                      II. NPS Үнэлгээ (0-10 оноо)
                    </h3>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-[#121912]/60 border border-white/5 space-y-3">
                    <p className="text-xs sm:text-[13px] text-slate-200 font-medium leading-tight">
                      Найз, танил, гэр бүлийнхэндээ манай рестораныг санал болгох магадлал:
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Active category dynamic badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-mono">Төлөв:</span>
                        <span className={`text-[10px] sm:text-[11px] font-bold border rounded-full px-2.5 py-0.5 ${getNpsLabel(nps).color}`}>
                          {getNpsLabel(nps).text} ({nps} оноо)
                        </span>
                      </div>

                      {/* Horizontal 0-10 custom scale */}
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }).map((_, i) => {
                          const isActive = nps === i;
                          const isDetractor = i <= 6;
                          const isPassive = i === 7 || i === 8;
                          const isPromoter = i >= 9;

                          let btnBg = 'bg-[#151c15] text-slate-400 border-white/5 hover:bg-[#1a241a]';
                          if (isActive) {
                            if (isDetractor) btnBg = 'bg-red-500 text-white border-red-600';
                            if (isPassive) btnBg = 'bg-amber-500 text-black border-amber-600';
                            if (isPromoter) btnBg = 'bg-emerald-500 text-black border-emerald-600';
                          }

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNps(i)}
                              className={`h-9 sm:h-10 text-xs font-bold font-mono rounded-lg border transition-all cursor-pointer flex items-center justify-center ${btnBg}`}
                            >
                              {i}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                        <span>0 - Маш муу</span>
                        <span>5 - Дундаж</span>
                        <span>10 - Маш сайн</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal feedback and callback number */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-white/5 pb-1 select-none">
                    III. Санал хүсэлт & Холбоо барих
                  </h3>

                  <div className="space-y-4">
                    {/* Opinion comment */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        Бусад сэтгэгдэл, санал хүсэлт (Санал болгох зүйлс):
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Сэтгэгдлээ энд бичнэ үү..."
                        className="w-full bg-[#111611] text-slate-100 placeholder-slate-600 rounded-xl p-3 text-sm border border-white/10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        Холбоо барих утасны дугаар (Зөвхөн менежер харилцана):
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Утасны дугаараа оруулна уу (жишээ: 99112233)"
                        maxLength={8}
                        className="w-full bg-[#111611] text-slate-100 placeholder-slate-600 rounded-xl p-3 text-sm border border-white/10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                      {phoneNumber && phoneNumber.length < 8 && (
                        <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1.5">
                          <ShieldAlert className="w-3 h-3" /> Утасны дугаар 8 оронтой байх ёстой.
                        </p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Submit button bar */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || (phoneNumber !== '' && phoneNumber.length < 8)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-sm py-4 rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>ИЛГЭЭХ</span>
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-center text-slate-500 leading-normal">
                    *Таны утсыг зөвхөн асуудал шийдвэрлэхэд ашиглах бөгөөд нууцыг хамгаална.
                  </p>
                </div>

              </form>
            ) : (
              // Success Splash screen 
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 px-4 text-center space-y-5 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center animate-bounce">
                  <Award className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    Судалгааг хүлээн авлаа!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Манай рестораныг зорин ирж, үнэтэй сэтгэгдлээ хуваалцсанд маш их баярлалаа. Бид улам илүү хичээн ажиллах болно.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#142014] to-transparent border border-emerald-500/10 text-left space-y-1.5 w-full">
                  <div className="flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-white font-bold">Сэтгэл ханамжийн хөтөлбөр</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {phoneNumber ? "Хөгжлийн асуудлууд байсан бол менежер таны утас руу яаралтай залгаж шийдлийг мэдэгдэнэ." : "Бидэнд санал хүсэлтээ үлдээсэн нь үйлчилгээ сайжрахад чухал хувь нэмэр оруулна."}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-black font-extrabold text-xs tracking-wider rounded-lg uppercase cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Хаах
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
