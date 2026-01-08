export interface Building {
  id: number;
  name: string;
  address: string;
  roadStatus?: string;
  createdAt: string;
  updatedAt: string;
  landInfo?: LandInfo;
  buildingInfo?: BuildingInfo;
  priceInfo?: PriceInfo;
  leases?: Lease[];
  analysisScore?: AnalysisScore;
}

export interface LandInfo {
  id: number;
  areaSqm: number;
  areaPyeong: number;
  zoning: string;
  landPricePerPyeong: number;
  landPriceTotal: number;
  landCategory?: string;
}

export interface BuildingInfo {
  id: number;
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
  completionDate?: string;
  hasElevator: boolean;
  structure?: string;
  mainUsage?: string;
}

export interface PriceInfo {
  id: number;
  salePrice: number;
  deposit: number;
  monthlyRent: number;
  yield: number;
  pricePerPyeong: number;
  aiEstimate?: number;
  aiEstimatePerPyeong?: number;
}

export interface Lease {
  id: number;
  floor: string;
  tenant: string;
  areaSqm: number;
  areaPyeong: number;
  deposit: number;
  monthlyRent: number;
  managementFee?: number;
  notes?: string;
}

export interface AnalysisScore {
  id: number;
  accessibilityScore: number;
  transportScore: number;
  developmentPlanScore: number;
  buildingSizeScore: number;
  structureScore: number;
  buildingAgeScore: number;
  maintenanceScore: number;
  illegalBuildingScore: number;
  harmfulFacilityScore: number;
  constructionLimitScore: number;
  salesComparisonScore: number;
  marketPriceScore: number;
  aiEstimateScore: number;
  landPriceGrowthScore: number;
  rentalStabilityScore: number;
  operatingCostScore: number;
  taxScore: number;
  yieldScore: number;
  vacancyScore: number;
  usageChangeScore: number;
  newConstructionScore: number;
  remodelingScore: number;
  additionalInvestScore: number;
  profitabilityScore: number;
  vacatingScore: number;
  totalScore: number;
}
