'use client';

import { AnalysisScore } from '@/types';
import { getScoreColor, getScoreBgColor, getGrade, getGradeColor } from '@/lib/utils';

interface AnalysisScoreCardProps {
  score: AnalysisScore;
}

interface ScoreItemProps {
  label: string;
  score: number;
  note?: string;
}

function ScoreItem({ label, score, note }: ScoreItemProps) {
  return (
    <div className="relative group flex justify-between items-center py-2">
      <div className="flex items-center gap-1">
        <span className="text-gray-700">{label}</span>
        {note && (
          <span className="text-amber-500 cursor-help text-sm" title={note}>
            ℹ️
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'}`}
            style={{ width: `${score * 10}%` }}
          />
        </div>
        <span className={`font-semibold w-8 text-right ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      {/* 툴팁 */}
      {note && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-[200px] shadow-lg">
            <p className="font-semibold mb-1">{label}: {score}점</p>
            <p>{note}</p>
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

interface CategoryScoreProps {
  title: string;
  weight: string;
  items: { label: string; score: number; key: string }[];
  notes?: Record<string, string>;
}

function CategoryScore({ title, weight, items, notes }: CategoryScoreProps) {
  const avgScore = items.reduce((acc, item) => acc + (item.score || 0), 0) / items.length;

  return (
    <div className={`p-4 rounded-lg ${getScoreBgColor(avgScore)}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-800">{title}</h4>
        <span className="text-sm text-gray-500">{weight}</span>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <ScoreItem
            key={index}
            label={item.label}
            score={item.score || 0}
            note={notes?.[item.key]}
          />
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between">
        <span className="font-semibold">평균</span>
        <span className={`font-bold ${getScoreColor(avgScore)}`}>
          {avgScore.toFixed(1)}점
        </span>
      </div>
    </div>
  );
}

export default function AnalysisScoreCard({ score }: AnalysisScoreCardProps) {
  const grade = getGrade(score.totalScore || 0);
  const notes = (score as any).analysisNotes as Record<string, string> | undefined;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">빌딩 분석 점수</h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">종합점수</div>
            <div className="text-2xl font-bold">{(score.totalScore || 0).toFixed(2)}점</div>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getGradeColor(grade)}`}>
            {grade}
          </div>
        </div>
      </div>

      {notes && Object.keys(notes).length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
          <span className="font-semibold">ℹ️ AI 분석 결과:</span> 각 점수 항목에 마우스를 올리면 AI가 분석한 이유를 확인할 수 있습니다.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CategoryScore
          title="1. 입지 및 교통 편의성"
          weight="15%"
          notes={notes}
          items={[
            { label: '접근성', score: score.accessibilityScore, key: 'accessibilityScore' },
            { label: '교통편의성', score: score.transportScore, key: 'transportScore' },
            { label: '주변 개발 계획', score: score.developmentPlanScore, key: 'developmentPlanScore' },
          ]}
        />

        <CategoryScore
          title="2. 건물 현황 및 상태"
          weight="10%"
          notes={notes}
          items={[
            { label: '건물 규모', score: score.buildingSizeScore, key: 'buildingSizeScore' },
            { label: '구조', score: score.structureScore, key: 'structureScore' },
            { label: '연식', score: score.buildingAgeScore, key: 'buildingAgeScore' },
            { label: '유지관리', score: score.maintenanceScore, key: 'maintenanceScore' },
          ]}
        />

        <CategoryScore
          title="3. 법적·행정적 검토"
          weight="10%"
          notes={notes}
          items={[
            { label: '불법건축물', score: score.illegalBuildingScore, key: 'illegalBuildingScore' },
            { label: '유해시설', score: score.harmfulFacilityScore, key: 'harmfulFacilityScore' },
            { label: '신축제한', score: score.constructionLimitScore, key: 'constructionLimitScore' },
          ]}
        />

        <CategoryScore
          title="4. 매각사례 대비"
          weight="15%"
          notes={notes}
          items={[
            { label: '비교 사례 분석', score: score.salesComparisonScore, key: 'salesComparisonScore' },
          ]}
        />

        <CategoryScore
          title="5. 주변 시세 대비"
          weight="10%"
          notes={notes}
          items={[
            { label: '시장 시세 분석', score: score.marketPriceScore, key: 'marketPriceScore' },
          ]}
        />

        <CategoryScore
          title="6. AI 추정가 대비"
          weight="10%"
          notes={notes}
          items={[
            { label: 'AI 평가', score: score.aiEstimateScore, key: 'aiEstimateScore' },
          ]}
        />

        <CategoryScore
          title="7. 공시지가 상승률"
          weight="10%"
          notes={notes}
          items={[
            { label: '공시지가 변화', score: score.landPriceGrowthScore, key: 'landPriceGrowthScore' },
          ]}
        />

        <CategoryScore
          title="8. 수익성 분석"
          weight="10%"
          notes={notes}
          items={[
            { label: '임대 안정성', score: score.rentalStabilityScore, key: 'rentalStabilityScore' },
            { label: '운영 비용', score: score.operatingCostScore, key: 'operatingCostScore' },
            { label: '세금', score: score.taxScore, key: 'taxScore' },
            { label: '수익률', score: score.yieldScore, key: 'yieldScore' },
            { label: '공실률', score: score.vacancyScore, key: 'vacancyScore' },
          ]}
        />

        <CategoryScore
          title="9. 개발·리모델링"
          weight="10%"
          notes={notes}
          items={[
            { label: '용도 변경', score: score.usageChangeScore, key: 'usageChangeScore' },
            { label: '신축/증축', score: score.newConstructionScore, key: 'newConstructionScore' },
            { label: '리모델링', score: score.remodelingScore, key: 'remodelingScore' },
            { label: '추가 투자', score: score.additionalInvestScore, key: 'additionalInvestScore' },
            { label: '수익성', score: score.profitabilityScore, key: 'profitabilityScore' },
            { label: '명도 가능', score: score.vacatingScore, key: 'vacatingScore' },
          ]}
        />
      </div>
    </div>
  );
}
