import { useState } from "react";
import AddWebsite from "./components/AddWebsites.jsx";
import WebsiteTable from "./components/WebsiteTable.jsx";
import "./App.css";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleAdded = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-full bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 12A10 10 0 1 1 12 2" />
              <path d="M22 2 12 12" />
              <path d="M16 2h6v6" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight text-gray-100">
              Website Monitor
            </h1>
            <p className="text-sm leading-tight text-gray-400">
              Track uptime and availability
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <AddWebsite onAdded={handleAdded} />
        <WebsiteTable refreshKey={refreshKey} />
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-gray-600">
        Website Monitoring Tool
      </footer>
    </div>
  );
}

export default App;
