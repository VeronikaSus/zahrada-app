'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRequests: 0, totalRecommendations: 0 });

  const webhookUrl = 'https://c079f14c427b.ngrok-free.app/api/receive-from-n8n';

  // Načítání doporučení z API
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/receive-from-n8n?data=true&limit=20');
      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.recommendations || []);
        setStats(result.stats || { totalRequests: 0, totalRecommendations: 0 });
        console.log('🌱 AI doporučení načtena:', result.recommendations?.length || 0, 'záznamů');
      } else {
        setError('Chyba při načítání doporučení');
        console.error('❌ Chyba při načítání doporučení:', result.error);
      }
    } catch (error) {
      console.error('❌ Chyba při načítání doporučení:', error);
      setError('Chyba při načítání doporučení');
    } finally {
      setLoading(false);
    }
  };

  // Automatické obnovování každých 5 sekund
  useEffect(() => {
    fetchRecommendations();
    
    const interval = setInterval(() => {
      fetchRecommendations();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Formátování timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Kopírování URL do schránky
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('📋 Webhook URL zkopírována:', text);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🌱 AI Doporučení Zahradníka
              </h1>
              <p className="text-gray-600">
                Inteligentní doporučení pro vaši zahradu z n8n workflow
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Celkem requestů</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalRequests}</div>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-900 mb-2">🌐 Webhook URL pro n8n</h3>
            <div className="flex items-center gap-3">
              <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                {webhookUrl}
              </code>
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Kopírovat
              </button>
            </div>
          </div>

          {/* Status a ovládání */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-600">
                {loading ? 'Načítání...' : 'Online'}
              </span>
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Obnovit
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* AI Doporučení */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seznam doporučení */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🌿 AI Doporučení Zahradníka
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Načítání doporučení...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Žádná AI doporučení zatím nebyla přijata</p>
                  <p className="text-sm mt-2">Pošlete doporučení z n8n na webhook URL</p>
                  
                  {/* Testovací sekce */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🧪 Testovací data pro n8n:</h4>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`{
  "recommendation": "Dnes je ideální čas na zalévání rajčat. Teplota je optimální a půda je suchá. Doporučuji zalít 2 litry vody na rostlinu.",
  "plants": ["rajčata", "papriky"],
  "action": "zalévání",
  "priority": "vysoká"
}`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Request #{rec.requestId}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(rec.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded p-3">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {rec.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ℹ️ Informace
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📊 Statistiky</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Celkem requestů:</span>
                        <span className="font-semibold">{stats.totalRequests}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Aktuální doporučení:</span>
                        <span className="font-semibold">{stats.totalRecommendations}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🔗 API Endpointy</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <div className="font-semibold">POST /api/receive-from-n8n</div>
                        <div className="text-gray-600">Příjem AI doporučení</div>
                      </div>
                      <div>
                        <div className="font-semibold">GET /api/receive-from-n8n</div>
                        <div className="text-gray-600">Získání historie</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">⚡ Real-time Updates</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm">
                      <p>Doporučení se automaticky obnovují každých 5 sekund</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
