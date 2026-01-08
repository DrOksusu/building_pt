import prisma from '../prisma';
import { CreateBuildingRequest, AnalysisScoreInput } from '../types';
import { calculateTotalScore } from '../utils/scoreCalculator';

// 유효한 점수 필드 목록
const VALID_SCORE_FIELDS = [
  'accessibilityScore',
  'transportScore',
  'developmentPlanScore',
  'buildingSizeScore',
  'structureScore',
  'buildingAgeScore',
  'maintenanceScore',
  'illegalBuildingScore',
  'harmfulFacilityScore',
  'constructionLimitScore',
  'salesComparisonScore',
  'marketPriceScore',
  'aiEstimateScore',
  'landPriceGrowthScore',
  'rentalStabilityScore',
  'operatingCostScore',
  'taxScore',
  'yieldScore',
  'vacancyScore',
  'usageChangeScore',
  'newConstructionScore',
  'remodelingScore',
  'additionalInvestScore',
  'profitabilityScore',
  'vacatingScore',
];

// 유효한 점수 필드만 추출하는 함수 (analysisNotes 등 제외)
function extractValidScores(scores: any): Partial<AnalysisScoreInput> {
  const result: any = {};

  for (const key of VALID_SCORE_FIELDS) {
    if (scores[key] !== undefined && scores[key] !== null) {
      result[key] = scores[key];
    }
  }

  return result;
}

export const buildingService = {
  // 모든 건물 조회
  async getAllBuildings() {
    return prisma.building.findMany({
      include: {
        landInfo: true,
        buildingInfo: true,
        priceInfo: true,
        leases: true,
        analysisScore: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // 건물 상세 조회
  async getBuildingById(id: number) {
    return prisma.building.findUnique({
      where: { id },
      include: {
        landInfo: true,
        buildingInfo: true,
        priceInfo: true,
        leases: true,
        floorInfo: true,
        analysisScore: true,
      },
    });
  },

  // 건물 생성
  async createBuilding(data: CreateBuildingRequest) {
    const { building, landInfo, buildingInfo, priceInfo, leases, analysisScore } = data;

    // completionDate 문자열을 Date로 변환
    const buildingInfoData = {
      ...buildingInfo,
      completionDate: buildingInfo.completionDate
        ? new Date(buildingInfo.completionDate)
        : null,
    };

    return prisma.building.create({
      data: {
        name: building.name,
        address: building.address,
        roadStatus: building.roadStatus,
        landInfo: {
          create: landInfo,
        },
        buildingInfo: {
          create: buildingInfoData,
        },
        priceInfo: {
          create: priceInfo,
        },
        leases: {
          create: leases,
        },
        ...(analysisScore && {
          analysisScore: {
            create: (() => {
              const validScores = extractValidScores(analysisScore);
              return {
                ...validScores,
                totalScore: calculateTotalScore(validScores),
              };
            })(),
          },
        }),
      },
      include: {
        landInfo: true,
        buildingInfo: true,
        priceInfo: true,
        leases: true,
        analysisScore: true,
      },
    });
  },

  // 건물 수정
  async updateBuilding(id: number, data: Partial<CreateBuildingRequest>) {
    const { building, landInfo, buildingInfo, priceInfo } = data;

    return prisma.building.update({
      where: { id },
      data: {
        ...(building && {
          name: building.name,
          address: building.address,
          roadStatus: building.roadStatus,
        }),
        ...(landInfo && {
          landInfo: {
            update: landInfo,
          },
        }),
        ...(buildingInfo && {
          buildingInfo: {
            update: buildingInfo,
          },
        }),
        ...(priceInfo && {
          priceInfo: {
            update: priceInfo,
          },
        }),
      },
      include: {
        landInfo: true,
        buildingInfo: true,
        priceInfo: true,
        leases: true,
        analysisScore: true,
      },
    });
  },

  // 건물 삭제
  async deleteBuilding(id: number) {
    return prisma.building.delete({
      where: { id },
    });
  },

  // 분석 점수 업데이트
  async updateAnalysisScore(buildingId: number, scores: Partial<AnalysisScoreInput>) {
    const validScores = extractValidScores(scores);
    const totalScore = calculateTotalScore(validScores);

    return prisma.analysisScore.upsert({
      where: { buildingId },
      update: {
        ...validScores,
        totalScore,
      },
      create: {
        buildingId,
        ...validScores,
        totalScore,
      },
    });
  },

  // 임대차 추가
  async addLease(buildingId: number, lease: CreateBuildingRequest['leases'][0]) {
    return prisma.lease.create({
      data: {
        buildingId,
        ...lease,
      },
    });
  },

  // 임대차 삭제
  async deleteLease(leaseId: number) {
    return prisma.lease.delete({
      where: { id: leaseId },
    });
  },
};
