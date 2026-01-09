import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { section: '主控與派遣', items: [
      { id: 'client', label: '立即叫車', icon: 'fa-mobile-screen-button' },
      { id: 'dispatch', label: '派單中心', icon: 'fa-paper-plane' },
      { id: 'map', label: '即時地圖', icon: 'fa-map-location-dot' },
    ]},
    { section: '營運管理', items: [
      { id: 'dashboard', label: '數據概況', icon: 'fa-chart-pie' },
      { id: 'reports', label: '統計報表', icon: 'fa-file-contract' },
      { id: 'wallet', label: '司機錢包', icon: 'fa-wallet' },
    ]},
    { section: '系統模擬', items: [
      { id: 'driver', label: '司機任務箱', icon: 'fa-steering-wheel' },
      { id: 'line', label: 'LINE 自動化', icon: 'fa-robot' },
      { id: 'settings', label: '計費設定', icon: 'fa-gear' },
    ]}
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex-col z-[100] transition-transform duration-500 ease-out w-72 md:w-64 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex`}>
        
        {/* Logo Section */}
        <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 rotate-3">
              <i className="fas fa-heart text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-black text-xl leading-tight tracking-tight">千尋派車</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Kaohsiung HUB</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((group, idx) => (
            <div key={idx} className="mb-6">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{group.section}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl mb-1.5 transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/30 translate-x-1' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center text-sm`}></i>
                  <span className="font-bold text-sm">{item.label}</span>
                  {activeTab === item.id && <i className="fas fa-chevron-right ml-auto text-[10px] opacity-50"></i>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* System Info Foot */}
        <div className="p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">系統雲端節點</span>
            </div>
            <p className="text-[11px] text-slate-300 font-bold opacity-80 leading-tight">
              KHH-HUB-MAIN-01
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;