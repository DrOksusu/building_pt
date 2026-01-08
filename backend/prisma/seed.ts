import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 암사동 바이스트릿 데이터 (PDF 기반)
  const building = await prisma.building.create({
    data: {
      name: '암사동 바이스트릿 (인수)',
      address: '서울 강동구 암사동 452-15',
      roadStatus: '25m*4m (코너)',
      landInfo: {
        create: {
          areaSqm: 423.3,
          areaPyeong: 128.05,
          zoning: '제3종일반주거지역',
          landPricePerPyeong: 27652903,
          landPriceTotal: 3540904500,
          landCategory: '대',
        },
      },
      buildingInfo: {
        create: {
          totalAreaSqm: 731.16,
          totalAreaPyeong: 221.18,
          buildingAreaSqm: 189.71,
          buildingAreaPyeong: 57.39,
          buildingCoverageRatio: 44.82,
          floorAreaRatio: 160.96,
          floors: 'B1/4F',
          basementFloors: 1,
          aboveGroundFloors: 4,
          parkingSpaces: 5,
          completionDate: new Date('1993-08-02'),
          hasElevator: false,
          structure: '철근콘크리트조, 경량철골조',
          mainUsage: '근린생활시설 및 주택',
        },
      },
      priceInfo: {
        create: {
          salePrice: 5500000000, // 55억
          deposit: 200000000, // 2억
          monthlyRent: 13000000, // 1,300만
          yield: 2.94,
          pricePerPyeong: 42950000, // 4,295만
          aiEstimate: 7094310000, // 70억 9,431만
          aiEstimatePerPyeong: 32076319,
        },
      },
      leases: {
        create: [
          {
            floor: '4층',
            tenant: '단독주택',
            areaSqm: 132.58,
            areaPyeong: 40.1055,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
          {
            floor: '3층',
            tenant: '아름다운꿈의교회',
            areaSqm: 189.71,
            areaPyeong: 57.3873,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
          {
            floor: '2층',
            tenant: '암사주짓수 (격투기)',
            areaSqm: 183.38,
            areaPyeong: 55.4724,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
          {
            floor: '1층',
            tenant: '바이스트릿 강동점 (카페)',
            areaSqm: 53.2,
            areaPyeong: 16.093,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
          {
            floor: '1층',
            tenant: '파리바게뜨 암사양지점',
            areaSqm: 122.49,
            areaPyeong: 37.0532,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
          {
            floor: '지하1층',
            tenant: '근린생활시설 (사무실)',
            areaSqm: 49.8,
            areaPyeong: 15.0645,
            deposit: 0,
            monthlyRent: 0,
            notes: '인수조건',
          },
        ],
      },
      analysisScore: {
        create: {
          // 1. 입지 및 교통 편의성 (15%)
          accessibilityScore: 9, // 25m 4차선 대로변 코너
          transportScore: 9, // 암사역사공원역 290m 도보 4분
          developmentPlanScore: 6, // 특별한 개발 계획 없음

          // 2. 건물 현황 및 상태분석 (10%)
          buildingSizeScore: 7, // 중규모
          structureScore: 7, // 철근콘크리트조
          buildingAgeScore: 4, // 1993년 준공 (30년 이상)
          maintenanceScore: 6, // 평균적

          // 3. 법적·행정적 검토 (10%)
          illegalBuildingScore: 10, // 위반건축물 없음
          harmfulFacilityScore: 9, // 유해시설 없음
          constructionLimitScore: 7, // 일부 제한 (역사문화미관지구)

          // 4. 매각사례 대비 매매가격 (15%)
          salesComparisonScore: 8, // 주변 시세 대비 저렴

          // 5. 주변 시세 대비 매매가격 (10%)
          marketPriceScore: 8, // 주변 시세 대비 저렴

          // 6. AI 추정가 대비 매매가격 (10%)
          aiEstimateScore: 10, // AI 추정가 70억 > 매매가 55억

          // 7. 공시지가 상승률 (10%)
          landPriceGrowthScore: 7, // 평균적 상승률

          // 8. 수익성 및 경제성 분석 (10%)
          rentalStabilityScore: 8, // 상가 위주 구성
          operatingCostScore: 7, // 평균적
          taxScore: 6, // 평균적
          yieldScore: 6, // 2.94% (2.5~3% 구간)
          vacancyScore: 10, // 전부 임대 중

          // 9. 개발 및 신축, 리모델링 계획 (10%)
          usageChangeScore: 7, // 용도 변경 가능
          newConstructionScore: 6, // 신축 가능하나 제한 있음
          remodelingScore: 7, // 리모델링 가능
          additionalInvestScore: 6, // 노후 건물로 투자 필요
          profitabilityScore: 7, // 수익성 있음
          vacatingScore: 3, // 인수조건 (명도 어려움)

          // 종합 점수 (가중치 적용)
          totalScore: 7.35,
        },
      },
    },
    include: {
      landInfo: true,
      buildingInfo: true,
      priceInfo: true,
      leases: true,
      analysisScore: true,
    },
  });

  console.log('Created building:', building.name);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
