import { AnalysisScoreInput } from '../types';

// 가중치 정의
const WEIGHTS = {
  // 1. 입지 및 교통 편의성 (15%)
  locationTransport: 0.15,
  
  // 2. 건물 현황 및 상태분석 (10%)
  buildingStatus: 0.10,
  
  // 3. 법적·행정적 검토 (10%)
  legalReview: 0.10,
  
  // 4. 매각사례 대비 매매가격 (15%)
  salesComparison: 0.15,
  
  // 5. 주변 시세 대비 매매가격 (10%)
  marketPrice: 0.10,
  
  // 6. AI 추정가 대비 매매가격 (10%)
  aiEstimate: 0.10,
  
  // 7. 공시지가 상승률 (10%)
  landPriceGrowth: 0.10,
  
  // 8. 수익성 및 경제성 분석 (10%)
  profitability: 0.10,
  
  // 9. 개발 및 신축, 리모델링 계획 (10%)
  development: 0.10,
};

export function calculateTotalScore(scores: AnalysisScoreInput): number {
  // null/undefined 값은 기본값 3으로 처리
  const getScore = (score: number | null | undefined): number => score ?? 3;

  // 1. 입지 및 교통 편의성 평균
  const locationTransportAvg = (
    getScore(scores.accessibilityScore) +
    getScore(scores.transportScore) +
    getScore(scores.developmentPlanScore)
  ) / 3;

  // 2. 건물 현황 및 상태분석 평균
  const buildingStatusAvg = (
    getScore(scores.buildingSizeScore) +
    getScore(scores.structureScore) +
    getScore(scores.buildingAgeScore) +
    getScore(scores.maintenanceScore)
  ) / 4;

  // 3. 법적·행정적 검토 평균
  const legalReviewAvg = (
    getScore(scores.illegalBuildingScore) +
    getScore(scores.harmfulFacilityScore) +
    getScore(scores.constructionLimitScore)
  ) / 3;

  // 4. 매각사례 대비 매매가격
  const salesComparisonAvg = getScore(scores.salesComparisonScore);

  // 5. 주변 시세 대비 매매가격
  const marketPriceAvg = getScore(scores.marketPriceScore);

  // 6. AI 추정가 대비 매매가격
  const aiEstimateAvg = getScore(scores.aiEstimateScore);

  // 7. 공시지가 상승률
  const landPriceGrowthAvg = getScore(scores.landPriceGrowthScore);

  // 8. 수익성 및 경제성 분석 평균
  const profitabilityAvg = (
    getScore(scores.rentalStabilityScore) +
    getScore(scores.operatingCostScore) +
    getScore(scores.taxScore) +
    getScore(scores.yieldScore) +
    getScore(scores.vacancyScore)
  ) / 5;

  // 9. 개발 및 신축, 리모델링 계획 평균
  const developmentAvg = (
    getScore(scores.usageChangeScore) +
    getScore(scores.newConstructionScore) +
    getScore(scores.remodelingScore) +
    getScore(scores.additionalInvestScore) +
    getScore(scores.profitabilityScore) +
    getScore(scores.vacatingScore)
  ) / 6;

  // 가중치 적용 총점 계산
  const totalScore =
    locationTransportAvg * WEIGHTS.locationTransport +
    buildingStatusAvg * WEIGHTS.buildingStatus +
    legalReviewAvg * WEIGHTS.legalReview +
    salesComparisonAvg * WEIGHTS.salesComparison +
    marketPriceAvg * WEIGHTS.marketPrice +
    aiEstimateAvg * WEIGHTS.aiEstimate +
    landPriceGrowthAvg * WEIGHTS.landPriceGrowth +
    profitabilityAvg * WEIGHTS.profitability +
    developmentAvg * WEIGHTS.development;

  return Math.round(totalScore * 100) / 100;
}

// 수익률 기반 점수 계산 (3.5% = 5점, 5점 만점)
export function calculateYieldScore(yieldRate: number): number {
  if (yieldRate >= 3.5) return 5;
  if (yieldRate >= 3.0) return 4;
  if (yieldRate >= 2.5) return 3;
  if (yieldRate >= 2.0) return 2;
  return 1;
}

// AI 추정가 대비 점수 계산 (5점 만점)
export function calculateAiEstimateScore(salePrice: number, aiEstimate: number): number {
  if (aiEstimate >= salePrice) return 5;

  const diff = ((salePrice - aiEstimate) / salePrice) * 100;

  if (diff < 10) return 4;
  if (diff < 20) return 3;
  if (diff < 30) return 2;
  return 1;
}

// 건물 연식 기반 점수 계산 (5점 만점)
export function calculateBuildingAgeScore(completionYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - completionYear;

  if (age <= 5) return 5;   // 신축
  if (age <= 10) return 4;  // 준신축
  if (age <= 20) return 3;  // 중간 연식
  if (age <= 30) return 2;  // 오래된 건물
  return 1;                  // 매우 오래된 건물
}
