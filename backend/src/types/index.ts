export interface BuildingInput {
  name: string;
  address: string;
  roadStatus?: string;
}

export interface LandInfoInput {
  areaSqm: number;
  areaPyeong: number;
  zoning: string;
  landPricePerPyeong: number;
  landPriceTotal: number;
  landCategory?: string;
}

export interface BuildingInfoInput {
  totalAreaSqm: number;
  totalAreaPyeong: number;
  buildingAreaSqm: number;
  buildingAreaPyeong: number;
  buildingCoverageRatio: number;
  floorAreaRatio: number;
  floors: string;
  basementFloors: number;
  aboveGroundFloors: number;
  parkingSpaces: number;
  completionDate?: Date;
  hasElevator: boolean;
  structure?: string;
  mainUsage?: string;
}

export interface PriceInfoInput {
  salePrice: number;
  deposit: number;
  monthlyRent: number;
  yield: number;
  pricePerPyeong: number;
  aiEstimate?: number;
  aiEstimatePerPyeong?: number;
}

export interface LeaseInput {
  floor: string;
  tenant: string;
  areaSqm: number;
  areaPyeong: number;
  deposit: number;
  monthlyRent: number;
  managementFee?: number;
  notes?: string;
}

export interface AnalysisScoreInput {
  // 1. 입지 및 교통 편의성 (15%)
  accessibilityScore?: number | null;
  transportScore?: number | null;
  developmentPlanScore?: number | null;

  // 2. 건물 현황 및 상태분석 (10%)
  buildingSizeScore?: number | null;
  structureScore?: number | null;
  buildingAgeScore?: number | null;
  maintenanceScore?: number | null;

  // 3. 법적·행정적 검토 (10%)
  illegalBuildingScore?: number | null;
  harmfulFacilityScore?: number | null;
  constructionLimitScore?: number | null;

  // 4. 매각사례 대비 매매가격 (15%)
  salesComparisonScore?: number | null;

  // 5. 주변 시세 대비 매매가격 (10%)
  marketPriceScore?: number | null;

  // 6. AI 추정가 대비 매매가격 (10%)
  aiEstimateScore?: number | null;

  // 7. 공시지가 상승률 (10%)
  landPriceGrowthScore?: number | null;

  // 8. 수익성 및 경제성 분석 (10%)
  rentalStabilityScore?: number | null;
  operatingCostScore?: number | null;
  taxScore?: number | null;
  yieldScore?: number | null;
  vacancyScore?: number | null;

  // 9. 개발 및 신축, 리모델링 계획 (10%)
  usageChangeScore?: number | null;
  newConstructionScore?: number | null;
  remodelingScore?: number | null;
  additionalInvestScore?: number | null;
  profitabilityScore?: number | null;
  vacatingScore?: number | null;
}

export interface CreateBuildingRequest {
  building: BuildingInput;
  landInfo: LandInfoInput;
  buildingInfo: BuildingInfoInput;
  priceInfo: PriceInfoInput;
  leases: LeaseInput[];
  analysisScore?: AnalysisScoreInput;
}
