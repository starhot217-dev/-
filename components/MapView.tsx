import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
}

declare global {
  interface Window {
    google: any;
    initMapCallback?: () => void;
  }
}

const MapView: React.FC<MapViewProps> = ({ vehicles }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 動態載入 Google Maps 腳本
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      setMapError('Google Maps 腳本載入失敗。請檢查您的 API Key 是否已啟用 Maps JavaScript API。');
    };

    document.head.appendChild(script);
  }, []);

  // 初始化地圖
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      try {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 22.6273, lng: 120.3014 }, // 高雄市中心
          zoom: 13,
          disableDefaultUI: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] }
          ]
        });
        setMap(newMap);
      } catch (e) {
        console.error("Map initialization failed:", e);
        setMapError('地圖初始化失敗，請確認 API Key 權限。');
      }
    }
  }, [isLoaded, map]);

  // 更新車輛 Marker
  useEffect(() => {
    if (map && window.google && window.google.maps) {
      // 移除已不存在的車輛
      const currentVehicleIds = new Set(vehicles.map(v => v.id));
      setMarkers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (!currentVehicleIds.has(id)) {
            next[id].setMap(null);
            delete next[id];
          }
        });
        return next;
      });

      // 更新或新增
      vehicles.forEach(v => {
        const position = { lat: v.location.lat, lng: v.location.lng };
        
        if (markers[v.id]) {
          markers[v.id].setPosition(position);
          const icon = markers[v.id].getIcon();
          icon.fillColor = v.status === 'IDLE' ? "#10b981" : "#f59e0b";
          markers[v.id].setIcon(icon);
        } else {
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: v.plateNumber,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: v.status === 'IDLE' ? "#10b981" : "#f59e0b",
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: "#ffffff",
            },
            animation: window.google.maps.Animation.DROP
          });

          marker.addListener('click', () => {
            setSelectedVehicle(v);
            map.panTo(marker.getPosition());
            if (map.getZoom() < 15) map.setZoom(15);
          });

          setMarkers(prev => ({ ...prev, [v.id]: marker }));
        }
      });
    }
  }, [map, vehicles]);

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const focusOnVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    if (map && markers[v.id]) {
      map.setZoom(16);
      map.panTo(markers[v.id].getPosition());
    }
  };

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md text-center bg-white p-8 rounded-3xl shadow-xl border border-rose-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">地圖載入錯誤</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{mapError}</p>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">解決建議：</p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>確認 Google Cloud 控制台已啟用 <b>Maps JavaScript API</b></li>
              <li>確認 API Key 沒有設定過於嚴格的 HTTP 來源限制</li>
              <li>確認帳戶已建立結算帳戶 (Billing Account)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden flex flex-col bg-slate-100 font-sans">
      <div className="flex-1 relative">
        <div ref={mapRef} id="map-canvas" className="absolute inset-0"></div>
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse">正在初始化高雄調度地圖...</p>
            </div>
          </div>
        )}

        {/* Search Panel - 手機版寬度調整 */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-10 space-y-4">
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-3 group focus-within:ring-2 ring-rose-500/20 transition-all">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
              <i className="fas fa-search text-sm"></i>
            </div>
            <input 
              type="text" 
              placeholder="搜尋高雄區車輛..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Selected Vehicle Card - 調整手機版位置避免遮擋 */}
        {selectedVehicle && (
          <div className="absolute bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white z-[60] animate-in slide-in-from-bottom duration-500">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${selectedVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                <i className="fas fa-car"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg tracking-tight">{selectedVehicle.plateNumber}</h4>
                <p className="text-xs font-bold text-slate-500">{selectedVehicle.driverName} • {selectedVehicle.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[8px] text-slate-400 font-black uppercase mb-1">錢包</p>
                <p className="text-base font-black text-slate-800">${selectedVehicle.walletBalance}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[8px] text-slate-400 font-black uppercase mb-1">狀態</p>
                <p className={`text-xs font-black ${selectedVehicle.status === 'IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedVehicle.status === 'IDLE' ? '待命中' : '任務中'}
                </p>
              </div>
            </div>
            <button className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95">
              發送調度指令
            </button>
          </div>
        )}
      </div>

      {/* Quick Access Fleet List - 桌面版顯示，手機版隱藏以節省空間 */}
      <div className="hidden md:flex bg-white border-t border-slate-100 p-6 gap-6 overflow-x-auto custom-scrollbar">
        {filteredVehicles.map((v) => (
          <div 
            key={v.id} 
            onClick={() => focusOnVehicle(v)}
            className={`flex-shrink-0 w-64 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
              selectedVehicle?.id === v.id ? 'border-rose-600 bg-rose-50/30' : 'border-slate-50 bg-white hover:border-rose-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${v.status === 'IDLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {v.status}
              </span>
              <i className="fas fa-ellipsis-v text-slate-300"></i>
            </div>
            <h4 className="font-black text-slate-900">{v.plateNumber}</h4>
            <p className="text-xs font-bold text-slate-500">{v.driverName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;