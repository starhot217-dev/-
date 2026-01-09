import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';
import { TAIWAN_AREAS } from '../constants';

interface DispatchCenterProps {
  orders: Order[];
  vehicles: Vehicle[];
  onDispatch: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onAddOrder: (order: Partial<Order>) => void;
  pricingConfig: { baseFare: number; perKm: number; perMinute: number; nightSurcharge: number; };
}

const DispatchCenter: React.FC<DispatchCenterProps> = ({ orders, vehicles, onDispatch, onCancel, onAddOrder, pricingConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupAddr, setPickupAddr] = useState({ county: '高雄市', district: '鳳山區', street: '' });
  const [destAddr, setDestAddr] = useState({ county: '高雄市', district: '', street: '' });
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    price: 0,
    note: '【車上禁菸、禁檳榔】'
  });

  useEffect(() => {
    if (pickupAddr.street && destAddr.district && destAddr.street) {
      const seed = pickupAddr.street.length + destAddr.street.length;
      const mockDistance = (seed % 15) + 5;
      const mockTime = Math.floor(mockDistance * 1.5);
      const price = pricingConfig.baseFare + (mockDistance * pricingConfig.perKm) + (mockTime * pricingConfig.perMinute);
      setFormData(prev => ({ ...prev, price }));
    }
  }, [pickupAddr, destAddr, pricingConfig]);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return 'bg-rose-100 text-rose-700 border-rose-200';
      case OrderStatus.DISPATCHING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.ASSIGNED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case OrderStatus.IN_TRANSIT: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return '待處理';
      case OrderStatus.DISPATCHING: return '派遣中';
      case OrderStatus.ASSIGNED: return '已接單';
      case OrderStatus.IN_TRANSIT: return '行程中';
      case OrderStatus.COMPLETED: return '已完成';
      default: return status;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      pickup: `${pickupAddr.county}${pickupAddr.district}${pickupAddr.street}`,
      destination: `${destAddr.county}${destAddr.district}${destAddr.street}`
    });
    setFormData({ clientName: '', clientPhone: '', price: 0, note: '【車上禁菸、禁檳榔】' });
    setPickupAddr({ county: '高雄市', district: '鳳山區', street: '' });
    setDestAddr({ county: '高雄市', district: '', street: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 relative min-h-full pb-24 lg:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">即時調度中心</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Real-time Control</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white w-10 h-10 lg:w-auto lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl font-bold shadow-lg flex items-center justify-center hover:bg-rose-700 transition-all"
        >
          <i className="fas fa-plus lg:mr-2"></i>
          <span className="hidden lg:inline">手動新增訂單</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:gap-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 lg:p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-inbox text-3xl mb-3"></i>
            <p className="font-bold text-sm">目前尚無進行中的訂單</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="text-[10px] font-mono font-black text-slate-400">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] lg:text-[10px] font-black border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <h3 className="text-lg lg:text-xl font-black text-slate-800 flex items-center justify-between">
                    {order.clientName} 
                    <span className="text-rose-600 font-black text-lg sm:hidden">${order.price}</span>
                  </h3>
                  <p className="text-rose-400 font-bold text-xs">{order.clientPhone}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <i className="fas fa-map-pin text-xs"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] text-slate-400 font-black uppercase leading-none mb-1">Pickup</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{order.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        <i className="fas fa-flag-checkered text-xs"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] text-slate-400 font-black uppercase leading-none mb-1">Dest</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{order.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-around min-h-[60px] sm:min-h-[120px] pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div className="text-right hidden sm:block">
                    <p className="text-2xl font-black text-rose-600">${order.price}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{order.createdAt}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {order.status === OrderStatus.PENDING && (
                      <>
                        <button 
                          onClick={() => onDispatch(order.id)}
                          className="flex-1 sm:flex-none bg-[#00b900] text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-50"
                        >
                          <i className="fab fa-line mr-2"></i>派遣
                        </button>
                        <button 
                          onClick={() => onCancel(order.id)}
                          className="bg-slate-100 text-slate-400 w-10 h-10 rounded-xl hover:text-rose-500 transition-colors shrink-0"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-rose-600 p-6 text-white rounded-t-[2rem] flex justify-between items-center">
              <h3 className="text-lg font-black tracking-tight">手動建立派遣單</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">客戶姓名</label>
                  <input type="text" required value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">電話</label>
                  <input type="text" required value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-rose-500 uppercase">上車地點</p>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold outline-none" value={pickupAddr.district} onChange={(e) => setPickupAddr({...pickupAddr, district: e.target.value})}>
                    {TAIWAN_AREAS[pickupAddr.county].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" placeholder="路名" required value={pickupAddr.street} onChange={(e) => setPickupAddr({...pickupAddr, street: e.target.value})} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-slate-500 uppercase">目的地</p>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold outline-none" value={destAddr.district} onChange={(e) => setDestAddr({...destAddr, district: e.target.value})}>
                    <option value="">選擇區域</option>
                    {TAIWAN_AREAS[destAddr.county].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" placeholder="路名" required value={destAddr.street} onChange={(e) => setDestAddr({...destAddr, street: e.target.value})} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div className="col-span-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase">金額</label>
                   <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-rose-600 outline-none" />
                 </div>
                 <div className="col-span-2">
                   <label className="text-[8px] font-black text-slate-400 uppercase">備註</label>
                   <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                 </div>
              </div>

              <button type="submit" className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-base shadow-lg hover:bg-rose-700 active:scale-95 transition-all">
                建立任務
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchCenter;