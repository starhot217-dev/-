import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
}

declare global {
  interface Window {
    google: any;
  }
}

const MapView: React.FC<MapViewProps> = ({ vehicles }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState(false);

  // 初始化地圖
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && !map && window.google && window.google.maps) {
        try {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: 22.6273, lng: 120.3014 }, // 高雄市中心
            zoom: 13,
            disableDefaultUI: true,
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
          setMapError(true);
        }
      }
    };

    // 如果 API 沒載入，等一下
    if (!window.google) {
      const timer = setTimeout(initMap, 1000);
      return () => clearTimeout(timer);
    } else {
      initMap();
    }
  }, [mapRef, map]);

  // 更新車輛 Marker
  useEffect(() => {
    if (map && window.google && window.google.maps) {
      // 移除
      Object.keys(markers).forEach(id => {
        if (!vehicles.find(v => v.id === id)) {
          markers[id].setMap(null);
          setMarkers(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      });

      // 更新或新增
      vehicles.forEach(v => {
        const position = { lat: v.location.lat, lng: v.location.lng };
        
        if (markers[v.id]) {
          markers[v.id].setPosition(position);
          // 動態更新顏色
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
              scale: 12,
              fillColor: v.status === 'IDLE' ? "#10b981" : "#f59e0b",
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: "#ffffff",
            },
            animation: window.google.maps.Animation.DROP
          });

          marker.addListener('click', () => {
            setSelectedVehicle(v);
            map.panTo(marker.getPosition());
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
      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Google Maps 載入失敗，請檢查 API Key 或網路連線。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden flex flex-col bg-slate-100 font-sans">
      <div className="flex-1 relative">
        <div ref={mapRef} id="map-canvas" className="absolute inset-0"></div>
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse">正在初始化高雄調度地圖...</p>
            </div>
          </div>
        )}

        {/* Search Panel */}
        <div className="absolute top-6 left-6 z-10 space-y-4 w-80">
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

        {/* Selected Vehicle Card */}
        {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white z-[60] animate-in slide-in-from-bottom duration-500">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ${selectedVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                <i className="fas fa-car"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">{selectedVehicle.plateNumber}</h4>
                <p className="text-sm font-bold text-slate-500">{selectedVehicle.driverName} • {selectedVehicle.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">錢包</p>
                <p className="text-lg font-black text-slate-800">${selectedVehicle.walletBalance}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">狀態</p>
                <p className={`text-sm font-black ${selectedVehicle.status === 'IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedVehicle.status === 'IDLE' ? '待命中' : '任務中'}
                </p>
              </div>
            </div>
            <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
              發送指令
            </button>
          </div>
        )}
      </div>

      {/* Quick Access Fleet List */}
      <div className="bg-white border-t border-slate-100 p-6 flex gap-6 overflow-x-auto custom-scrollbar">
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