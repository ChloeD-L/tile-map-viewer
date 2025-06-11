import { useState } from "react";
import { TileMap } from "./components/TileMap";
import "./index.css";

function App() {
  const token = import.meta.env.VITE_API_TOKEN || "";
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const testApiConnection = async () => {
    const testUrl = `https://challenge-tiler.services.propelleraero.com/tiles/0/0/0?token=${token}`;

    try {
      const response = await fetch(testUrl);
      console.log("API Test Result:", {
        url: testUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        alert("API connection successful! Check console for details.");
      } else {
        alert(`API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("API Test Error:", error);
      alert(`API connection error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="my-10 mx-16 h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">Propeller Tile Map Viewer</h1>

              <div className="flex items-center gap-4">
                {import.meta.env.DEV && (
                  <button
                    onClick={testApiConnection}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Test API
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative">
          {token ? (
            <TileMap token={token} initialZoom={0} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-medium text-gray-900 mb-2">API Token Required</div>
                <div className="text-gray-600 mb-4">Please set VITE_API_TOKEN in your environment variables</div>
                <div className="text-sm text-gray-500">Create a .env file with: VITE_API_TOKEN=your_token_here</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
