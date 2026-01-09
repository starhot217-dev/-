import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeFleetPerformance } from '../services/geminiService';
import { Order, Vehicle } from '../types';

interface DashboardProps {
  orders: Order[];
  vehicles: Vehicle[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, vehicles }) => {
  const [insights, setInsights] = useState<{insight: string, impact: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // 計算實時數據
  const totalGMV = orders.reduce((sum, o) => sum + o.price, 0);
  const activeVehicles = vehicles.filter(v => v.status !== 'OFFLINE').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const avgWallet = Math.round(vehicles.reduce((sum, v) => sum + v.walletBalance, 0) / (vehicles.length || 1));

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await analyzeFleetPerformance({ orders, vehicles });
      setInsights(res);
      setLoading(false);
    };
    fetchInsights();
  }, [orders, vehicles]);

  const chartData = [
    { name: '08:00', trips: 12, revenue: 3200 },
    { name: '10:00', trips: 45, revenue: 15200 },
    { name: '12:00', trips: 35, revenue: 12100 },
    { name: '14:00', trips: 55, revenue: 18400 },
    { name: '16:00', trips: 62, revenue: 21000 },
    { name: '18:00', trips: 48, revenue: 16500 },
    { name: '20:00', trips: 22, revenue: 8200 },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">系統營運概況</h2>
          <p className="text-slate-500 font-medium text-sm">即時監控全台調度節點數據</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">系統狀態：優良</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          { label: '今日總流水', value: `$${totalGMV.toLocaleString()}`, icon: 'fa-coins', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: '待處理訂單', value: `${pendingOrders} 件`, icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '在線司機', value: `${activeVehicles}`, icon: 'fa-id-card', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: '平均錢包', value: `$${avgWallet}`, icon: 'fa-wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className={`w-8 h-8 lg:w-12 h-12 ${stat.bg} ${stat.color} rounded-xl lg:rounded-2xl flex items-center justify-center text-sm lg:text-xl mb-3 lg:mb-4 shadow-inner`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <h3 className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-widest truncate">{stat.label}</h3>
            <p className="text-lg lg:text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h3 className="font-black text-lg lg:text-xl text-slate-800">業務流水趨勢</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">Real-time</span>
          </div>
          <div className="h-[250px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorChihiro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorChihiro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 lg:w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                <i className="fas fa-wand-magic-sparkles text-white text-sm"></i>
              </div>
              <div>
                <h3 className="font-black text-base lg:text-lg">AI 智慧建議</h3>
                <p className="text-[8px] lg:text-[10px] text-rose-400 font-bold uppercase tracking-widest">Powered by Gemini 3</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-slate-800 w-full h-20 rounded-xl border border-slate-700"></div>
                  ))}
                </div>
              ) : (
                insights.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-rose-500/50 transition-all group">
                    <p className="text-xs lg:text-sm font-bold mb-2 text-slate-100 leading-relaxed">{item.insight}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">預期影響</span>
                      <p className="text-[10px] lg:text-xs text-rose-400 font-bold">{item.impact}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;