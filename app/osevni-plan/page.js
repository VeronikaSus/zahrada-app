'use client';

import { useState } from 'react';
import { rostliny } from '../../data/rostliny';
import RostlinaIlustrace from '../../components/RostlinaIlustrace';
import ZahradkaEditor from '../../components/ZahradkaEditor';

export default function OsevniPlan() {
  const [savedBeds, setSavedBeds] = useState([]);
  const [loadPlanData, setLoadPlanData] = useState(null);

  const handleDragStart = (e, rostlinaTyp) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'rostlina',
      rostlinaTyp: rostlinaTyp
    }));
  };

  const handleLoadPlan = (plan) => {
    setLoadPlanData(plan);
  };

  const handleDeletePlan = (planId, planName) => {
    if (window.confirm(`Opravdu chcete smazat osevní plán "${planName}"? Tato akce je nevratná.`)) {
      const savedPlans = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('osevniPlany') || '[]') : [];
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      localStorage.setItem('osevniPlany', JSON.stringify(updatedPlans));
      // Force re-render by updating state
      setSavedBeds([...savedBeds]); // Trigger re-render
      alert(`Osevní plán "${planName}" byl smazán.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Nadpis */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Osevní plán
        </h1>

        {/* Hlavní grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Oblast pro kreslení zahrádky - zabírá 3/4 šířky */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300">
              <ZahradkaEditor 
                savedBeds={savedBeds} 
                setSavedBeds={setSavedBeds}
                loadPlanData={loadPlanData}
                onPlanLoaded={() => setLoadPlanData(null)}
              />
            </div>
          </div>

          {/* Boční panel - zabírá 1/4 šířky */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seznam rostlin */}
            <div className="bg-white rounded-lg shadow-md p-6 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Seznam rostlin
              </h2>
              
              {/* Grid rostlin */}
              <div className="grid grid-cols-3 gap-3">
                {rostliny.map((rostlina) => (
                  <div 
                    key={rostlina.id}
                    className="group cursor-pointer p-2 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    {/* Obrázek rostliny */}
                    <div className="flex justify-center mb-1">
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        <RostlinaIlustrace 
                          typ={rostlina.obrazek} 
                          isDraggable={true}
                          onDragStart={handleDragStart}
                        />
                      </div>
                    </div>
                    
                    {/* Název rostliny */}
                    <p className="text-xs font-medium text-gray-800 text-center group-hover:text-green-700 transition-colors duration-200">
                      {rostlina.nazev}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Uložené osevní plány */}
            <div className="bg-white rounded-lg shadow-md p-6 h-96 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Uložené osevní plány
              </h2>
              
              {(() => {
                const savedPlans = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('osevniPlany') || '[]') : [];
                
                if (savedPlans.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8">
                      <p>Zatím nemáte uložené osevní plány</p>
                      <p className="text-sm mt-2">Klikněte na &quot;💾 Uložit celý plán&quot; v editoru</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {savedPlans.map((plan) => {
                      // Funkce pro vykreslení miniatury plánu
                      const renderPlanThumbnail = (plan) => {
                        const thumbnailSize = 80;
                        const scale = thumbnailSize / Math.max(plan.gardenSize.width * 100, plan.gardenSize.height * 100);
                        
                        return (
                          <svg width={thumbnailSize} height={thumbnailSize} className="border border-gray-300 rounded bg-white">
                            {/* Grid background */}
                            <defs>
                              <pattern id={`grid-${plan.id}`} width={10 * scale} height={10 * scale} patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth={0.5}/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#grid-${plan.id})`} />
                            
                            {/* Garden border */}
                            <rect
                              x={0}
                              y={0}
                              width={plan.gardenSize.width * 100 * scale}
                              height={plan.gardenSize.height * 100 * scale}
                              fill="none"
                              stroke="#d1d5db"
                              strokeWidth={1}
                            />
                            
                            {/* Beds */}
                            {plan.beds.map((bed) => (
                              <rect
                                key={bed.id}
                                x={bed.x * 100 * scale}
                                y={bed.y * 100 * scale}
                                width={bed.width * 100 * scale}
                                height={bed.height * 100 * scale}
                                fill="#22c55e"
                                stroke="#16a34a"
                                strokeWidth={1}
                              />
                            ))}
                            
                            {/* Plants */}
                            {Object.entries(plan.bedPlants || {}).map(([bedId, plants]) => {
                              const bed = plan.beds.find(b => b.id === parseInt(bedId));
                              if (!bed) return null;
                              
                              return plants.map((plant) => {
                                const plantX = (bed.x + plant.x * bed.width) * 100 * scale;
                                const plantY = (bed.y + plant.y * bed.height) * 100 * scale;
                                const plantSize = 2 * scale;
                                
                                return (
                                  <circle
                                    key={plant.id}
                                    cx={plantX}
                                    cy={plantY}
                                    r={plantSize}
                                    fill="#dc2626"
                                    stroke="#991b1b"
                                    strokeWidth={0.5}
                                  />
                                );
                              });
                            })}
                          </svg>
                        );
                      };

                      return (
                        <div 
                          key={plan.id}
                          className="group relative p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          {/* Tlačítko pro smazání */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id, plan.name);
                            }}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Smazat plán"
                          >
                            ×
                          </button>
                          
                          {/* Kliknutelná oblast pro načtení */}
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              // Načíst plán do editoru
                              if (window.confirm(`Chcete načíst plán "${plan.name}"? Současný plán bude nahrazen.`)) {
                                handleLoadPlan(plan);
                              }
                            }}
                          >
                            {/* Miniatura plánu */}
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {renderPlanThumbnail(plan)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                                  {plan.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Uloženo: {new Date(plan.savedAt).toLocaleDateString('cs-CZ')}
                                </p>
                                <div className="text-xs text-gray-400 mt-1">
                                  <span>{plan.beds.length} záhonů</span>
                                  <span className="mx-1">•</span>
                                  <span>{Object.values(plan.bedPlants || {}).flat().length} rostlin</span>
                                  <span className="mx-1">•</span>
                                  <span>{plan.gardenSize.width}×{plan.gardenSize.height}m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Tlačítko "Vygenerovat plán" - pod hlavním obsahem */}
        <div className="mt-8 text-center">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200">
            Vygenerovat plán
          </button>
        </div>
      </div>
    </div>
  );
}
