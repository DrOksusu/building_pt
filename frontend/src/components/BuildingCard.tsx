'use client';

import Link from 'next/link';
import { Building } from '@/types';
import { formatPrice, formatPercent, getGrade, getGradeColor } from '@/lib/utils';

interface BuildingCardProps {
  building: Building;
}

export default function BuildingCard({ building }: BuildingCardProps) {
  const grade = building.analysisScore ? getGrade(building.analysisScore.totalScore) : '-';
  const gradeColor = building.analysisScore ? getGradeColor(grade) : 'text-gray-400 bg-gray-100';

  return (
    <Link href={`/buildings/${building.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{building.name}</h3>
            <p className="text-sm text-gray-500">{building.address}</p>
          </div>
          <div className={`px-3 py-1 rounded-full font-bold text-lg ${gradeColor}`}>
            {grade}
          </div>
        </div>

        {building.priceInfo && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">매매가</span>
              <span className="font-semibold text-red-600">
                {formatPrice(building.priceInfo.salePrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">수익률</span>
              <span className="font-semibold text-blue-600">
                {formatPercent(building.priceInfo.yield)}
              </span>
            </div>
            {building.priceInfo.aiEstimate && (
              <div className="flex justify-between">
                <span className="text-gray-600">AI 추정가</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(building.priceInfo.aiEstimate)}
                </span>
              </div>
            )}
          </div>
        )}

        {building.buildingInfo && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">규모</span>
              <span>{building.buildingInfo.floors}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">연면적</span>
              <span>{building.buildingInfo.totalAreaPyeong.toFixed(2)}평</span>
            </div>
          </div>
        )}

        {building.analysisScore && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">종합점수</span>
              <span className="font-bold text-xl">
                {building.analysisScore.totalScore.toFixed(2)}점
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
