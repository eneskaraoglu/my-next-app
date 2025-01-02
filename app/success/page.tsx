'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { deleteCookie } from 'cookies-next';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function SuccessPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    deleteCookie('token');
    router.push('/login');
  };

  const handleOpenNewWindow = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-[600px] text-center">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <FaSun className="w-5 h-5 text-yellow-400" />
          )}
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Hoş Geldiniz!</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">Lütfen yapmak istediğiniz işlemi seçin:</p>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button
            onClick={() => router.push('/purchase-requests')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105"
          >
            Satınalma İstekleri Onayla
          </button>
          
          <button
            onClick={() => handleOpenNewWindow('http://localhost:8098/purchase-orders')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105"
          >
            Satınalma Siparişler Onayla
          </button>
          
          <button
            onClick={() => handleOpenNewWindow('http://localhost:8098/swagger-ui/index.html')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-md hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105"
          >
            Swagger UI
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
} 