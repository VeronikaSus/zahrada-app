'use client';

import { useState, useEffect } from 'react';

export default function N8nReceiver() {
  const [receivedData, setReceivedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const ngrokUrl = 'https://c079f14c427b.ngrok-free.app';
  const webhookUrl = `${ngrokUrl}/receive-from-n8n`;

  // Načítání dat
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receive-from-n8n?limit=20');
      const result = await response.json();
      
      if (result.success) {
        setReceivedData(result.data);
        setRequestCount(result.requestCount);
        setLastUpdate(new Date().toISOString());
      } else {
        setError('Chyba při načítání dat');
      }
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
      setError('Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  // Vyčištění historie
  const clearHistory = async () => {
    try {
      setIsClearing(true);
      const response = await fetch('/api/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReceivedData([]);
        setRequestCount(0);
        setLastUpdate(new Date().toISOString());
        console.log('✅ Historie vyčištěna');
      } else {
        setError('Chyba při vyčišťování historie');
      }
    } catch (error) {
      console.error('Chyba při vyčišťování historie:', error);
      setError('Chyba při vyčišťování historie');
    } finally {
      setIsClearing(false);
    }
  };

  // Automatické obnovování dat každých 5 sekund
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
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
      console.log('URL zkopírována do schránky');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 n8n Data Receiver
              </h1>
              <p className="text-gray-600">
                Aplikace pro příjem a zobrazení dat z n8n workflow
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Celkem requestů</div>
              <div className="text-2xl font-bold text-blue-600">{requestCount}</div>
            </div>
          </div>

          {/* ngrok URL */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">🌐 ngrok URL pro n8n</h3>
            <div className="flex items-center gap-3">
              <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                {webhookUrl}
              </code>
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Kopírovat
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-600">
                {loading ? 'Načítání...' : 'Online'}
              </span>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Poslední aktualizace: {formatTimestamp(lastUpdate)}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Obnovit
            </button>
            <button
              onClick={clearHistory}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isClearing ? '🧹 Čištění...' : '🗑️ Vyčistit historii'}
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

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Nejnovější data */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📥 Nejnovější data z n8n
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Načítání dat...</p>
                </div>
              ) : receivedData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Žádná data zatím nebyla přijata</p>
                  <p className="text-sm mt-2">Pošlete data z n8n na webhook URL</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedData.map((record) => (
                    <div 
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            Request #{record.requestId}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(record.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(record.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Debug Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔧 Debug Panel
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📊 Statistiky</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Celkem requestů:</span>
                        <span className="font-semibold">{requestCount}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Aktuální záznamy:</span>
                        <span className="font-semibold">{receivedData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Poslední aktualizace:</span>
                        <span className="font-semibold">
                          {lastUpdate ? formatTimestamp(lastUpdate) : 'Nikdy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🔗 Endpointy</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <div className="font-semibold">POST /api/receive-from-n8n</div>
                        <div className="text-gray-600">Příjem dat z n8n</div>
                      </div>
                      <div>
                        <div className="font-semibold">GET /api/receive-from-n8n</div>
                        <div className="text-gray-600">Získání historie dat</div>
                      </div>
                      <div>
                        <div className="font-semibold">POST /api/clear-history</div>
                        <div className="text-gray-600">Vyčištění historie</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📝 Test Data</h3>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm">
                      <p className="mb-2">Pro testování můžete poslat POST request s těmito daty:</p>
                      <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`{
  "message": "Test zpráva",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "test": true,
    "value": "example"
  }
}`}
                      </pre>
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