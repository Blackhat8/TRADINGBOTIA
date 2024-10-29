import React from 'react';
import { Bot, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold">TradingBotIA</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={logout} className="text-gray-500 hover:text-gray-700">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}