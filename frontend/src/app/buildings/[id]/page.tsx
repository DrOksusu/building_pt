'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building } from '@/types';
import { fetchBuilding, deleteBuilding } from '@/lib/api';
import { formatPrice, formatPercent, formatNumber, getGrade, getGradeColor } from '@/lib/utils';
import AnalysisScoreCard from '@/components/AnalysisScoreCard';

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadBuilding(Number(params.id));
    }
  }, [params.id]);

  async function loadBuilding(id: number) {
    try {
      setLoading(true);
      const data = await fetchBuilding(id);
      setBuilding(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!building) return;
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteBuilding(building.id);
      router.push('/');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700">건물을 찾을 수 없습니다</h2>
          <Link href="/" className="text-amber-600 hover:underline mt-4 inline-block">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const grade = building.analysisScore ? getGrade(building.analysisScore.totalScore) : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-amber-600 hover:underline text-sm">
                ← 목록으로
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{building.name}</h1>
              <p className="text-gray-500">{building.address}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/buildings/${building.id}/analysis`}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                분석 점수
              </Link>
              <Link
                href={`/buildings/${building.id}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* 요약 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">매매가</div>
            <div className="text-2xl font-bold text-red-600">
              {building.priceInfo ? formatPrice(building.priceInfo.salePrice) : '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">수익률</div>
            <div className="text-2xl font-bold text-blue-600">
              {building.priceInfo ? formatPercent(building.priceInfo.yield) : '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">AI 추정가</div>
            <div className="text-2xl font-bold text-green-600">
              {building.priceInfo?.aiEstimate ? formatPrice(building.priceInfo.aiEstimate) : '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">종합등급</div>
            <div className={`text-3xl font-bold ${building.analysisScore ? getGradeColor(grade) : ''} inline-block px-4 py-1 rounded-full`}>
              {grade}
            </div>
          </div>
        </div>

        {/* 상세 정보 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 토지 정보 */}
          {building.landInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">토지 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">면적</span>
                  <span>{building.landInfo.areaSqm}㎡ ({building.landInfo.areaPyeong.toFixed(2)}평)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">용도지역</span>
                  <span>{building.landInfo.zoning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">공시지가(평)</span>
                  <span>{formatNumber(building.landInfo.landPricePerPyeong)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">공시지가 합계</span>
                  <span className="font-semibold">{formatPrice(building.landInfo.landPriceTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 건물 정보 */}
          {building.buildingInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">건물 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">연면적</span>
                  <span>{building.buildingInfo.totalAreaSqm}㎡ ({building.buildingInfo.totalAreaPyeong.toFixed(2)}평)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">건축면적</span>
                  <span>{building.buildingInfo.buildingAreaSqm}㎡ ({building.buildingInfo.buildingAreaPyeong.toFixed(2)}평)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">건폐율/용적률</span>
                  <span>{building.buildingInfo.buildingCoverageRatio}% / {building.buildingInfo.floorAreaRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">규모</span>
                  <span>{building.buildingInfo.floors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주차대수</span>
                  <span>{building.buildingInfo.parkingSpaces}대</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">승강기</span>
                  <span>{building.buildingInfo.hasElevator ? '있음' : '없음'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 임대차 현황 */}
        {building.leases && building.leases.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">임대차 현황</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">층</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">형태/임차인</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">면적(평)</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">보증금</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">월세</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {building.leases.map((lease) => (
                    <tr key={lease.id}>
                      <td className="px-4 py-3 text-sm">{lease.floor}</td>
                      <td className="px-4 py-3 text-sm">{lease.tenant}</td>
                      <td className="px-4 py-3 text-sm text-right">{lease.areaPyeong.toFixed(2)}평</td>
                      <td className="px-4 py-3 text-sm text-right">{formatPrice(lease.deposit)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatPrice(lease.monthlyRent)}</td>
                      <td className="px-4 py-3 text-sm text-amber-600">{lease.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 분석 점수 */}
        {building.analysisScore && (
          <AnalysisScoreCard score={building.analysisScore} />
        )}
      </main>
    </div>
  );
}
