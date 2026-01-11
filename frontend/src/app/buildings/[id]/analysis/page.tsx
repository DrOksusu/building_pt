'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building } from '@/types';
import { fetchBuilding, updateAnalysisScore } from '@/lib/api';

interface ScoreCategory {
  title: string;
  weight: string;
  fields: { key: string; label: string; description: string }[];
}

const SCORE_CATEGORIES: ScoreCategory[] = [
  {
    title: '1. 입지 및 교통 편의성',
    weight: '15%',
    fields: [
      { key: 'accessibilityScore', label: '접근성', description: '주요 도로와의 접근성 및 도보 접근성' },
      { key: 'transportScore', label: '교통편의성', description: '지하철, 버스 등 대중교통 이용 편의성' },
      { key: 'developmentPlanScore', label: '주변 개발 계획', description: '주변 개발 계획 여부 및 규모' },
    ],
  },
  {
    title: '2. 건물 현황 및 상태분석',
    weight: '10%',
    fields: [
      { key: 'buildingSizeScore', label: '건물 규모', description: '건물의 전체 규모' },
      { key: 'structureScore', label: '구조', description: '건물 구조의 튼튼함과 현대성' },
      { key: 'buildingAgeScore', label: '연식', description: '건물의 준공 연도' },
      { key: 'maintenanceScore', label: '유지관리 상태', description: '건물 유지관리 수준' },
    ],
  },
  {
    title: '3. 법적·행정적 검토',
    weight: '10%',
    fields: [
      { key: 'illegalBuildingScore', label: '불법건축물', description: '불법건축물 유무' },
      { key: 'harmfulFacilityScore', label: '주변 유해시설', description: '주변 유해시설 유무' },
      { key: 'constructionLimitScore', label: '신축제한', description: '신축 제한 여부' },
    ],
  },
  {
    title: '4. 매각사례 대비 매매가격',
    weight: '15%',
    fields: [
      { key: 'salesComparisonScore', label: '비교 사례 분석', description: '매각사례 대비 매매가격 (대지 평단가 기준)' },
    ],
  },
  {
    title: '5. 주변 시세 대비 매매가격',
    weight: '10%',
    fields: [
      { key: 'marketPriceScore', label: '시장 시세 분석', description: '주변 시세 대비 매매가격 (대지 평단가 기준)' },
    ],
  },
  {
    title: '6. AI 추정가 대비 매매가격',
    weight: '10%',
    fields: [
      { key: 'aiEstimateScore', label: 'AI 평가', description: 'AI 추정가 대비 매매가격' },
    ],
  },
  {
    title: '7. 공시지가 상승률',
    weight: '10%',
    fields: [
      { key: 'landPriceGrowthScore', label: '공시지가 변화', description: '최근 10년간 공시지가 상승률' },
    ],
  },
  {
    title: '8. 수익성 및 경제성 분석',
    weight: '10%',
    fields: [
      { key: 'rentalStabilityScore', label: '안정적인 임대 수익', description: '임차 구성 (상가/오피스 비율)' },
      { key: 'operatingCostScore', label: '운영 비용', description: '건물 운영 비용 수준' },
      { key: 'taxScore', label: '세금', description: '세금 부담 수준' },
      { key: 'yieldScore', label: '임대 수익률', description: '임대 수익률 (3.5% = 10점)' },
      { key: 'vacancyScore', label: '공실률', description: '현재 공실률' },
    ],
  },
  {
    title: '9. 개발 및 신축, 리모델링 계획',
    weight: '10%',
    fields: [
      { key: 'usageChangeScore', label: '건물 용도 변경', description: '용도 변경 용이성' },
      { key: 'newConstructionScore', label: '신축 및 증축', description: '신축/증축 용이성' },
      { key: 'remodelingScore', label: '리모델링', description: '리모델링 용이성' },
      { key: 'additionalInvestScore', label: '추가 투자 소요', description: '추가 투자 필요 수준' },
      { key: 'profitabilityScore', label: '수익성 검토', description: '추가 투자 통한 수익성' },
      { key: 'vacatingScore', label: '명도 가능 여부', description: '명도 가능 비율' },
    ],
  },
];

export default function AnalysisScorePage() {
  const params = useParams();
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [analysisNotes, setAnalysisNotes] = useState<Record<string, string>>({});

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

      if (data?.analysisScore) {
        const existingScores: Record<string, number> = {};
        SCORE_CATEGORIES.forEach(cat => {
          cat.fields.forEach(field => {
            existingScores[field.key] = (data.analysisScore as any)[field.key] || 5;
          });
        });
        setScores(existingScores);

        // AI 분석 이유 로드
        if ((data.analysisScore as any).analysisNotes) {
          setAnalysisNotes((data.analysisScore as any).analysisNotes);
        }
      } else {
        const defaultScores: Record<string, number> = {};
        SCORE_CATEGORIES.forEach(cat => {
          cat.fields.forEach(field => {
            defaultScores[field.key] = 5;
          });
        });
        setScores(defaultScores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleScoreChange(key: string, value: number) {
    setScores(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!building) return;

    setSaving(true);
    try {
      await updateAnalysisScore(building.id, scores);
      router.push(`/buildings/${building.id}`);
    } catch (err) {
      console.error(err);
      alert('점수 저장에 실패했습니다.');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href={`/buildings/${building.id}`} className="text-amber-600 hover:underline text-sm">
            ← 건물 상세로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">분석 점수 입력</h1>
          <p className="text-gray-500">{building.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">점수 기준</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• <strong>10점</strong>: 최상 (매우 우수)</li>
            <li>• <strong>8-9점</strong>: 우수</li>
            <li>• <strong>6-7점</strong>: 평균</li>
            <li>• <strong>4-5점</strong>: 미흡</li>
            <li>• <strong>1-3점</strong>: 불량</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {SCORE_CATEGORIES.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                <span className="text-sm text-amber-600 font-medium">가중치: {category.weight}</span>
              </div>

              <div className="space-y-4">
                {category.fields.map((field) => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-1/3">
                      <div className="flex items-center gap-1">
                        <label className="font-medium text-gray-700">{field.label}</label>
                        {analysisNotes[field.key] && (
                          <span className="text-amber-500 cursor-help" title={analysisNotes[field.key]}>
                            ℹ️
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{field.description}</p>
                      {analysisNotes[field.key] && (
                        <p className="text-xs text-green-600 mt-1 italic">
                          AI: {analysisNotes[field.key]}
                        </p>
                      )}
                    </div>
                    <div className="sm:w-2/3 flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[field.key] || 5}
                        onChange={(e) => handleScoreChange(field.key, Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        (scores[field.key] || 5) >= 8 ? 'bg-green-500' :
                        (scores[field.key] || 5) >= 6 ? 'bg-yellow-500' :
                        (scores[field.key] || 5) >= 4 ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {scores[field.key] || 5}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <Link
              href={`/buildings/${building.id}`}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 font-medium"
            >
              {saving ? '저장 중...' : '점수 저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
