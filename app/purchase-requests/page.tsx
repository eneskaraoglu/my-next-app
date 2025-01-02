'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

interface RequestItem {
  istekDtId: number;
  text: string;
  kayitTarihi: string;
}

interface PageResponse {
  onayTalepleri: RequestItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [istekDurum, setIstekDurum] = useState('01');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redGerekcesiMap, setRedGerekcesiMap] = useState<{ [key: number]: string }>({});

  const fetchRequests = useCallback(async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log(`Fetching page ${page} with status ${istekDurum}`);

      const response = await fetch(
        `http://localhost:8098/api/satinalma/istek-onay?page=${page}&size=10&istekDurum=${istekDurum}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }

      const data: PageResponse = await response.json();
      console.log('Received data:', data);
      
      if (Array.isArray(data.onayTalepleri)) {
        setRequests(data.onayTalepleri);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      } else {
        console.error('Invalid data format:', data);
        throw new Error('Geçersiz veri formatı');
      }
      
      setRedGerekcesiMap({});
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [istekDurum, router]);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, fetchRequests]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setIstekDurum(newStatus);
    fetchRequests(0);
  };

  const handleRedGerekcesiChange = (id: number, value: string) => {
    setRedGerekcesiMap(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const confirmAction = (action: 'approve' | 'reject', id: number) => {
    if (window.confirm('İşlem ERP\'ye kaydedilecek. Devam etmek istiyor musunuz?')) {
      if (action === 'approve') {
        handleApprove(id);
      } else {
        handleReject(id);
      }
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8098/api/satinalma/istek-onay/onayla/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Onaylama işlemi başarısız');
      }

      fetchRequests(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleReject = async (id: number) => {
    const redGerekcesi = redGerekcesiMap[id];
    if (!redGerekcesi?.trim()) {
      alert('Lütfen red gerekçesi giriniz');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8098/api/satinalma/istek-onay/reddet/${id}?redGerekcesi=${encodeURIComponent(redGerekcesi)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reddetme işlemi başarısız');
      }

      setRedGerekcesiMap(prev => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
      
      fetchRequests(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    fetchRequests(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-2xl text-gray-700 dark:text-gray-200">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto p-8">
        <div className="relative mb-8">
          <button
            onClick={toggleTheme}
            className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <FaSun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Satınalma İstek Onay Talepleri</h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="istekDurum" className="block mb-2 text-gray-700 dark:text-gray-200">İstek Durumu:</label>
          <select
            id="istekDurum"
            value={istekDurum}
            onChange={handleStatusChange}
            className="w-full md:w-64 p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="01">Onay Bekleyen</option>
            <option value="02">Onaylı</option>
            <option value="07">Red Edilen</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-1/2 p-4 text-left text-gray-700 dark:text-gray-200">İstek Detayı</th>
                <th className="w-1/6 p-4 text-left text-gray-700 dark:text-gray-200">Kayıt Tarihi</th>
                <th className="w-1/3 p-4 text-left text-gray-700 dark:text-gray-200">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.istekDtId} className="border-t border-gray-200 dark:border-gray-600">
                  <td className="p-4 whitespace-pre-line text-gray-800 dark:text-gray-200">{request.text}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200">
                    {new Date(request.kayitTarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4">
                    {istekDurum === '01' ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => confirmAction('approve', request.istekDtId)}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                        >
                          Kabul Et
                        </button>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Red Gerekçesi"
                            value={redGerekcesiMap[request.istekDtId] || ''}
                            onChange={(e) => handleRedGerekcesiChange(request.istekDtId, e.target.value)}
                            className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                          <button
                            onClick={() => confirmAction('reject', request.istekDtId)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-500 dark:text-red-400">
                        Sadece bekleme statüsündeki kayıtlarda işlem yapabilirsiniz.
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center text-gray-800 dark:text-gray-200">
          <div>
            Sayfa: {currentPage + 1}/{totalPages}
          </div>
          <div className="space-x-2">
            {currentPage > 0 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Önceki
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Sonraki
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/success')}
          className="mt-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
} 