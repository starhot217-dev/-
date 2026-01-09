import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Blueprint from './components/Blueprint';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Reports from './components/Reports';
import DispatchCenter from './components/DispatchCenter';
import LineAutomation from './components/LineAutomation';
import ClientBooking from './components/ClientBooking';
import Settings from './components/Settings';
import Wallet from './components/Wallet';
import DriverSimulator from './components/DriverSimulator';
import { INITIAL_ORDERS, MOCK_VEHICLES } from './constants';
import { Order, OrderStatus, LineLog, Vehicle } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('client');
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('chihiro_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('chihiro_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });
  const [lineLogs, setLineLogs] = useState<LineLog[]>([]);
  const [currentClientOrderId, setCurrentClientOrderId] = useState<string | null>(null);

  const [pricingConfig, setPricingConfig] = useState(() => {
    const saved = localStorage.getItem('chihiro_pricing');
    return saved ? JSON.parse(saved) : {
      baseFare: 100,
      perKm: 25,
      perMinute: 5,
      nightSurcharge: 50
    };
  });

  useEffect(() => {
    localStorage.setItem('chihiro_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chihiro_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('chihiro_pricing', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  const handleCreateClientOrder = (orderData: Partial<Order>) => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900) + 200}`;
    const newOrder: Order = {
      id: newOrderId,
      clientName: orderData.clientName || '匿名客戶',
      clientPhone: orderData.clientPhone || '0900-000-000',
      pickup: orderData.pickup || '高雄市鳳山區中山西路374號',
      destination: orderData.destination || '目的地資訊',
      status: OrderStatus.PENDING,
      createdAt: new Date().toLocaleString('zh-TW'),
      price: orderData.price || 300,
      commission: Math.round((orderData.price || 300) * 0.1),
      note: '【車上禁菸、禁檳榔】'
    };
    setOrders(prev => [newOrder, ...prev]);
    setCurrentClientOrderId(newOrderId);
  };

  const handleManualAddOrder = (orderData: Partial<Order>) => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900) + 200}`;
    const newOrder: Order = {
      id: newOrderId,
      clientName: orderData.clientName || '手動建立',
      clientPhone: orderData.clientPhone || '0000-000-000',
      pickup: orderData.pickup || '未知起點',
      destination: orderData.destination || '未知終點',
      status: OrderStatus.PENDING,
      createdAt: new Date().toLocaleString('zh-TW'),
      price: orderData.price || 300,
      commission: Math.round((orderData.price || 300) * 0.1),
      note: orderData.note || '【車上禁菸、禁檳榔】'
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleTopUp = (vehicleId: string, amount: number) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, walletBalance: v.walletBalance + amount } : v));
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o));
    if (order?.vehicleId) {
      setVehicles(prev => prev.map(v => v.id === order.vehicleId ? { ...v, status: 'IDLE' } : v));
    }
  };

  const handleDispatchToLine = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.DISPATCHING } : o));
    const newLog: LineLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW'),
      groupName: '高雄司機大群組',
      type: 'OUTGOING',
      message: `📢 任務通知！\n📍 上車：${order.pickup}\n🏁 下車：${order.destination}\n💰 金額：$${order.price}\n\n請回覆「${order.id}」接單。`
    };
    setLineLogs(prev => [...prev, newLog]);
  };

  const handleLineReply = (text: string) => {
    const match = text.match(/ORD-\d+/);
    if (match) {
      const orderId = match[0];
      const order = orders.find(o => o.id === orderId);
      if (order && order.status === OrderStatus.DISPATCHING) {
        const targetVehicle = vehicles.find(v => v.status === 'IDLE') || vehicles[0];
        const commission = order.commission || Math.round(order.price * 0.1);

        if (targetVehicle.walletBalance < commission) {
          setLineLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString('zh-TW'),
            groupName: '高雄司機大群組', type: 'OUTGOING',
            message: `⚠️ 司機 ${targetVehicle.driverName} 儲值金不足 ($${targetVehicle.walletBalance})，接單失敗！`
          }]);
          return;
        }

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.ASSIGNED, vehicleId: targetVehicle.id } : o));
        setVehicles(prev => prev.map(v => v.id === targetVehicle.id ? { ...v, status: 'BUSY', walletBalance: v.walletBalance - commission } : v));
        setLineLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString('zh-TW'),
          groupName: '高雄司機大群組', type: 'OUTGOING',
          message: `✅ 司機 ${targetVehicle.driverName} 已成功承接 ${orderId}！`
        }]);
      }
    }
  };

  const renderContent = () => {
    const currentClientOrder = orders.find(o => o.id === currentClientOrderId);
    switch (activeTab) {
      case 'client': return <ClientBooking activeOrder={currentClientOrder} onCreateOrder={handleCreateClientOrder} onResetOrder={() => setCurrentClientOrderId(null)} pricingConfig={pricingConfig} />;
      case 'wallet': return <Wallet vehicles={vehicles} onTopUp={handleTopUp} />;
      case 'driver': return <DriverSimulator orders={orders} vehicles={vehicles} onCompleteOrder={handleCompleteOrder} />;
      case 'dashboard': return <Dashboard orders={orders} vehicles={vehicles} />;
      case 'dispatch': return <DispatchCenter orders={orders} vehicles={vehicles} onDispatch={handleDispatchToLine} onCancel={(id) => setOrders(prev => prev.filter(o => o.id !== id))} onAddOrder={handleManualAddOrder} pricingConfig={pricingConfig} />;
      case 'map': return <MapView vehicles={vehicles} />;
      case 'reports': return <Reports orders={orders} />;
      case 'settings': return <Settings config={pricingConfig} onSave={(newConfig) => setPricingConfig(newConfig)} />;
      case 'line': return (
        <div className="flex flex-col lg:flex-row h-full p-4 lg:p-8 bg-slate-50 gap-6">
          <div className="flex-1 bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 overflow-y-auto custom-scrollbar border border-slate-100">
             <h3 className="text-xl lg:text-2xl font-black mb-4 lg:mb-8">LINE 派單整合</h3>
             <div className="p-6 lg:p-8 bg-emerald-50 rounded-2xl lg:rounded-[2rem] border border-emerald-100">
               <div className="flex items-center gap-4 mb-4">
                 <i className="fab fa-line text-3xl lg:text-4xl text-[#00b900]"></i>
                 <p className="text-lg lg:text-xl font-black">高雄司機大群組 (已連線)</p>
               </div>
               <p className="text-xs lg:text-sm text-emerald-700 font-medium">自動化機器人已就緒，所有調度中心的「派遣」操作將會自動推送到此群組。</p>
             </div>
          </div>
          <div className="hidden lg:block w-[420px] h-full rounded-[4rem] border-[14px] border-slate-900 bg-slate-900 relative shadow-2xl overflow-hidden">
            <LineAutomation logs={lineLogs} onSendMessage={handleLineReply} />
          </div>
          <div className="lg:hidden h-[500px] rounded-3xl border-4 border-slate-900 bg-slate-900 relative overflow-hidden">
             <LineAutomation logs={lineLogs} onSendMessage={handleLineReply} />
          </div>
        </div>
      );
      default: return <Dashboard orders={orders} vehicles={vehicles} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-rose-100 selection:text-rose-700 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative pb-24 md:pb-0">
        <div className="absolute top-0 right-0 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-rose-50/40 rounded-full blur-[80px] lg:blur-[140px] -mr-40 lg:-mr-80 -mt-40 lg:-mt-80 pointer-events-none"></div>
        
        <header className="h-16 lg:h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-rose-600 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              <span className="text-slate-800 text-[10px] lg:text-xs font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] truncate max-w-[100px] lg:max-w-none">
                千尋 v2.6
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <h2 className="text-slate-800 font-black text-xs lg:text-sm tracking-tight">
              {activeTab.toUpperCase()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] lg:text-xs font-black text-slate-800 tracking-tight leading-none">Dispatcher CHIHIRO</p>
                <p className="text-[8px] lg:text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">Kaohsiung HUB</p>
              </div>
              <div className="w-8 h-8 lg:w-12 h-12 rounded-xl lg:rounded-2xl bg-white p-0.5 lg:p-1 shadow-md lg:shadow-xl border border-slate-100">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chihiro&backgroundColor=ffdfbf" alt="avatar" className="w-full h-full rounded-lg lg:rounded-[0.8rem] bg-rose-50" />
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;