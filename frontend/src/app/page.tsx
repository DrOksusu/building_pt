'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BuildingCard from '@/components/BuildingCard';
import { Building } from '@/types';
import { fetchBuildings } from '@/lib/api';

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuildings();
  }, []);

  async function loadBuildings() {
    try {
      setLoading(true);
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (err) {
      setError('건물 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-amber-600">빌딩PT</h1>
              <p className="text-gray-500 text-sm">빌딩을 퍼스널트레이닝하다</p>
            </div>
            <Link
              href="/buildings/new"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + 건물 등록
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">건물 목록</h2>
          <p className="text-gray-500">등록된 건물 {buildings.length}개</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : buildings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              등록된 건물이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 건물을 등록해보세요!
            </p>
            <Link
              href="/buildings/new"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              건물 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2024 (주)빌딩PT부동산중개법인</p>
          <p>강남구 강남대로354, 12층 | 등록번호: 11650-2020-00279</p>
        </div>
      </footer>
    </div>
  );
}
