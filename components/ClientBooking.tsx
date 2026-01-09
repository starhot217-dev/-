import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';
import { MOCK_VEHICLES, TAIWAN_AREAS } from '../constants';

interface PricingConfig {
  baseFare: number;
  perKm: number;
  perMinute: number;
  nightSurcharge: number;
}

interface ClientBookingProps {
  activeOrder?: Order;
  onCreateOrder: (order: Partial<Order>) => void;
  onResetOrder: () => void;
  pricingConfig: PricingConfig;
}

const ClientBooking: React.FC<ClientBookingProps> = ({ activeOrder, onCreateOrder, onResetOrder, pricingConfig }) => {
  const [pickup, setPickup] = useState({ county: '高雄市', district: '鳳山區', street: '' });
  const [destination, setDestination] = useState({ county: '高雄市', district: '', street: '' });
  
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  const fullPickup = useMemo(() => `${pickup.county}${pickup.district}${pickup.street}`, [pickup]);
  const fullDest = useMemo(() => `${destination.county}${destination.district}${destination.street}`, [destination]);

  const showMap = useMemo(() => {
    return pickup.street.length > 0 && destination.district.length > 0 && destination.street.length > 0;
  }, [pickup.street, destination.district, destination.street]);

  useEffect(() => {
    if (showMap) {
      const seed = fullPickup.length + fullDest.length;
      const mockDistance = (seed % 20) + 3; 
      const mockTime = Math.floor(mockDistance * 1.8); 
      const price = pricingConfig.baseFare + (mockDistance * pricingConfig.perKm) + (mockTime * pricingConfig.perMinute);
      
      setEstimatedPrice(price);
      setEstimatedMinutes(mockTime);
    }
  }, [fullPickup, fullDest, showMap, pricingConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    
    setTimeout(() => {
      onCreateOrder({
        clientName: '李先生',
        clientPhone: '0910-000-888',
        pickup: fullPickup,
        destination: fullDest,
        price: estimatedPrice,
      });
      setIsBooking(false);
    }, 1500);
  };

  const containerClasses = "w-full max-w-md bg-white md:rounded-[2.5rem] md:shadow-2xl overflow-hidden md:border-[8px] border-slate-800 relative transition-all duration-500 min-h-screen md:min-h-0";

  if (activeOrder) {
    const assignedVehicle = activeOrder.vehicleId ? MOCK_VEHICLES.find(v => v.id === activeOrder.vehicleId) : null;

    return (
      <div className="flex justify-center items-start lg:items-center min-h-full bg-slate-100">
        <div className={containerClasses}>
          <div className="hidden md:block h-6 bg-slate-800 w-1/3 mx-auto rounded-b-2xl mb-4 relative z-20"></div>
          
          <div className="p-6 space-y-6 pb-24 md:pb-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">訂單追蹤</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Order ID: {activeOrder.id}</p>
            </div>

            <div className="relative h-48 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
               <div className="absolute inset-0 opacity-40">
                <svg width="100%" height="100%" className="text-slate-400">
                  <defs>
                    <pattern id="gridClient" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridClient)" />
                </svg>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative w-full px-12">
                   <div className="h-1 bg-rose-100 w-full rounded-full overflow-hidden">
                     <div className="h-full bg-rose-600 animate-[progress_3s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                   </div>
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 rounded-full ring-4 ring-rose-100"></div>
                   <div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-500 rounded-full ring-4 ring-slate-100"></div>
                   <div className="absolute left-[30%] top-1/2 -translate-y-full -translate-x-1/2 animate-bounce">
                     <i className="fas fa-car-side text-rose-600 text-xl drop-shadow-lg"></i>
                   </div>
                 </div>
               </div>
            </div>

            <div className="relative flex flex-col items-center">
              {activeOrder.status === OrderStatus.PENDING || activeOrder.status === OrderStatus.DISPATCHING ? (
                <>
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-rose-50 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-rose-400/20 rounded-full animate-ping"></div>
                    <i className="fas fa-satellite-dish text-xl lg:text-2xl text-rose-600"></i>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-base lg:text-lg font-black text-slate-800">正在為您尋找最合適的司機...</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">系統派遣廣播中</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg relative">
                     <i className="fas fa-user-check text-xl lg:text-2xl text-emerald-600"></i>
                  </div>
                  <div className="mt-6 text-center w-full">
                    <p className="text-base lg:text-lg font-black text-emerald-600">司機已承接任務！</p>
                    <div className="mt-4 p-4 lg:p-5 bg-slate-50 rounded-2xl lg:rounded-[2rem] border border-slate-100 w-full text-left">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 h-12 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                            <i className="fas fa-id-card"></i>
                          </div>
                          <div>
                            <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase">駕駛資訊</p>
                            <p className="font-black text-slate-800 text-sm lg:text-base">{assignedVehicle?.driverName || '精神小伙'}</p>
                            <p className="text-[10px] lg:text-xs font-bold text-rose-500">{assignedVehicle?.plateNumber || '1932'}</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                          <i className="fas fa-phone"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              onClick={onResetOrder}
            >
              返回主畫面
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start lg:items-center min-h-full bg-slate-100">
      <div className={containerClasses}>
        <div className="hidden md:block h-6 bg-slate-800 w-1/3 mx-auto rounded-b-2xl mb-4 relative z-20"></div>
        
        <div className="p-6 lg:p-8 pb-24 md:pb-8">
          <div className="flex justify-between items-end mb-6 lg:mb-8">
            <div>
              <p className="text-slate-400 text-[10px] lg:text-sm font-bold uppercase tracking-widest leading-none">Chihiro Dispatch</p>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter mt-1">千尋派車系統</h2>
            </div>
            <div className="w-10 h-10 lg:w-12 h-12 bg-rose-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
              <i className="fas fa-heart text-sm lg:text-base"></i>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2 lg:space-y-3 bg-slate-50 p-4 rounded-2xl lg:rounded-3xl border border-slate-100">
              <p className="text-[9px] lg:text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">上車地點 (Pickup)</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2 text-xs lg:text-sm font-bold outline-none"
                  value={pickup.county}
                  onChange={(e) => setPickup({...pickup, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                >
                  {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2 text-xs lg:text-sm font-bold outline-none"
                  value={pickup.district}
                  onChange={(e) => setPickup({...pickup, district: e.target.value})}
                >
                  {TAIWAN_AREAS[pickup.county].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="輸入路名、巷弄..."
                required
                value={pickup.street}
                onChange={(e) => setPickup({...pickup, street: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs lg:text-sm font-black text-slate-700 outline-none transition-all"
              />
            </div>

            <div className="space-y-2 lg:space-y-3 bg-slate-50 p-4 rounded-2xl lg:rounded-3xl border border-slate-100">
              <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">目的地 (Destination)</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2 text-xs lg:text-sm font-bold outline-none"
                  value={destination.county}
                  onChange={(e) => setDestination({...destination, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                >
                  {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2 text-xs lg:text-sm font-bold outline-none"
                  value={destination.district}
                  onChange={(e) => setDestination({...destination, district: e.target.value})}
                >
                  <option value="" disabled>選擇區域</option>
                  {TAIWAN_AREAS[destination.county].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="輸入終點路名..."
                required
                value={destination.street}
                onChange={(e) => setDestination({...destination, street: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs lg:text-sm font-black text-slate-700 outline-none transition-all"
              />
            </div>

            {showMap && (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center animate-in fade-in slide-in-from-bottom duration-300">
                 <div className="flex justify-around mb-2">
                    <div>
                      <p className="text-[8px] font-black text-rose-400 uppercase">預估車資</p>
                      <p className="text-base font-black text-rose-600">${estimatedPrice}</p>
                    </div>
                    <div className="w-px h-8 bg-rose-200"></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">預計時間</p>
                      <p className="text-base font-black text-slate-700">{estimatedMinutes} 分</p>
                    </div>
                 </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isBooking}
              className={`w-full py-4 lg:py-5 rounded-[1.5rem] lg:rounded-[2rem] font-black text-lg lg:text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
                isBooking 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              {isBooking ? <><i className="fas fa-spinner fa-spin"></i> 規劃中...</> : <>立即叫車 <i className="fas fa-chevron-right text-sm"></i></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;