import Anthropic from '@anthropic-ai/sdk';

interface ParsedBuildingData {
  building: {
    name: string;
    address: string;
    roadStatus?: string;
  };
  landInfo: {
    areaSqm: number;
    areaPyeong: number;
    zoning: string;
    landPricePerPyeong: number;
    landPriceTotal: number;
    landCategory?: string;
  };
  buildingInfo: {
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
  };
  priceInfo: {
    salePrice: number;
    deposit: number;
    monthlyRent: number;
    yield: number;
    pricePerPyeong: number;
    aiEstimate?: number;
  };
  leases: Array<{
    floor: string;
    tenant: string;
    areaSqm: number;
    areaPyeong: number;
    deposit: number;
    monthlyRent: number;
    notes?: string;
  }>;
  analysisScore?: {
    accessibilityScore: number | null;
    transportScore: number | null;
    developmentPlanScore: number | null;
    buildingSizeScore: number | null;
    structureScore: number | null;
    buildingAgeScore: number | null;
    maintenanceScore: number | null;
    illegalBuildingScore: number | null;
    harmfulFacilityScore: number | null;
    constructionLimitScore: number | null;
    salesComparisonScore: number | null;
    marketPriceScore: number | null;
    aiEstimateScore: number | null;
    landPriceGrowthScore: number | null;
    rentalStabilityScore: number | null;
    operatingCostScore: number | null;
    taxScore: number | null;
    yieldScore: number | null;
    vacancyScore: number | null;
    usageChangeScore: number | null;
    newConstructionScore: number | null;
    remodelingScore: number | null;
    additionalInvestScore: number | null;
    profitabilityScore: number | null;
    vacatingScore: number | null;
    analysisNotes?: Record<string, string>;
  };
}

// 숫자 추출 (콤마 제거)
function extractNumber(text: string): number {
  const match = text.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// 억/만원 단위 파싱
function parseKoreanPrice(text: string): number {
  let total = 0;

  const eokMatch = text.match(/(\d+)억/);
  if (eokMatch) {
    total += parseInt(eokMatch[1]) * 100000000;
  }

  const manMatch = text.match(/(\d[\d,]*)만/);
  if (manMatch) {
    total += parseInt(manMatch[1].replace(/,/g, '')) * 10000;
  }

  if (total === 0) {
    const numMatch = text.replace(/,/g, '').match(/(\d+)/);
    if (numMatch) {
      total = parseInt(numMatch[1]);
    }
  }

  return total;
}

// 층 파싱
function parseFloors(floorsStr: string): { basement: number; above: number } {
  const basementMatch = floorsStr.match(/B(\d+)/i);
  const aboveMatch = floorsStr.match(/(\d+)F/i);

  return {
    basement: basementMatch ? parseInt(basementMatch[1]) : 0,
    above: aboveMatch ? parseInt(aboveMatch[1]) : 0,
  };
}

// PDF에서 텍스트 추출 (pdf2json 사용)
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const PDFParser = require('pdf2json');

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let fullText = '';

        // pdf2json의 페이지 데이터에서 텍스트 추출
        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const textItem of page.Texts) {
                if (textItem.R) {
                  for (const r of textItem.R) {
                    if (r.T) {
                      // URL 디코딩 (pdf2json은 텍스트를 URL 인코딩함)
                      fullText += decodeURIComponent(r.T) + ' ';
                    }
                  }
                }
              }
            }
            fullText += '\n';
          }
        }

        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    });

    // 버퍼에서 직접 파싱
    pdfParser.parseBuffer(buffer);
  });
}

// Claude API를 사용하여 이미지 기반 PDF 분석
async function extractDataWithClaude(buffer: Buffer): Promise<ParsedBuildingData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일에 API 키를 추가해주세요.');
  }

  const anthropic = new Anthropic({ apiKey });

  const base64Pdf = buffer.toString('base64');

  const systemPrompt = `당신은 빌딩 매물 정보 PDF를 분석하는 부동산 투자 전문가입니다.
PDF에서 정보를 추출하고, 투자 관점에서 각 항목별 점수(1-5점)를 평가해주세요.
숫자는 모두 순수 숫자로 변환해주세요 (억, 만 단위는 원 단위로 변환).
찾을 수 없는 정보는 0 또는 빈 문자열로 반환해주세요.
분석 점수는 1-5점 사이로 평가하고, PDF 정보만으로 판단이 어려운 항목은 null로 표시해주세요.`;

  const userPrompt = `이 빌딩 매물 PDF에서 다음 정보를 추출해주세요:

1. 건물 기본 정보:
   - 건물명
   - 주소
   - 도로상황 (예: 8m * 6m)

2. 토지 정보:
   - 토지면적 (㎡)
   - 토지면적 (평)
   - 용도지역
   - 공시지가 (평당, 원)
   - 공시지가 합계 (원)

3. 건물 정보:
   - 연면적 (㎡)
   - 연면적 (평)
   - 건축면적 (㎡)
   - 건축면적 (평)
   - 건폐율 (%)
   - 용적률 (%)
   - 규모 (예: B1/5F)
   - 지하층수
   - 지상층수
   - 주차대수
   - 준공년도
   - 승강기 유무

4. 금액 정보:
   - 매매가 (원)
   - 보증금 합계 (원)
   - 월 임대료 합계 (원)
   - 수익률 (%)
   - 평단가 (원)
   - AI 추정가 (원, 있는 경우)

5. 임대차 현황 (각 층별):
   - 층
   - 임차인
   - 면적 (㎡)
   - 면적 (평)
   - 보증금 (원)
   - 월세 (원)
   - 비고

6. 투자 분석 점수 (1-5점, PDF 정보로 판단 불가시 null):
   [입지 분석 - 15%]
   - accessibilityScore: 접근성 (대중교통, 도보 접근성)
   - transportScore: 교통 (지하철역 거리, 버스 노선)
   - developmentPlanScore: 개발호재 (주변 개발 계획)

   [건물 분석 - 10%]
   - buildingSizeScore: 건물규모 (연면적, 층수)
   - structureScore: 구조형식 (건물 구조)
   - buildingAgeScore: 건물연식 (준공년도 기준)
   - maintenanceScore: 유지관리 상태

   [권리 분석 - 10%]
   - illegalBuildingScore: 위반건축물 여부
   - harmfulFacilityScore: 혐오시설 여부
   - constructionLimitScore: 건축제한 사항

   [시세 분석 - 20%]
   - salesComparisonScore: 실거래 비교
   - marketPriceScore: 호가 시세 비교
   - aiEstimateScore: AI 추정가 비교
   - landPriceGrowthScore: 공시지가 상승률

   [수익성 분석 - 20%]
   - rentalStabilityScore: 임대 안정성
   - operatingCostScore: 운영비용
   - taxScore: 세금 (취득세, 재산세)
   - yieldScore: 수익률
   - vacancyScore: 공실률

   [사업성 분석 - 25%]
   - usageChangeScore: 용도변경 가능성
   - newConstructionScore: 신축 가능성
   - remodelingScore: 리모델링 가능성
   - additionalInvestScore: 추가투자 필요성
   - profitabilityScore: 사업 수익성
   - vacatingScore: 명도 난이도

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "building": {
    "name": "",
    "address": "",
    "roadStatus": ""
  },
  "landInfo": {
    "areaSqm": 0,
    "areaPyeong": 0,
    "zoning": "",
    "landPricePerPyeong": 0,
    "landPriceTotal": 0
  },
  "buildingInfo": {
    "totalAreaSqm": 0,
    "totalAreaPyeong": 0,
    "buildingAreaSqm": 0,
    "buildingAreaPyeong": 0,
    "buildingCoverageRatio": 0,
    "floorAreaRatio": 0,
    "floors": "",
    "basementFloors": 0,
    "aboveGroundFloors": 0,
    "parkingSpaces": 0,
    "completionDate": "",
    "hasElevator": false
  },
  "priceInfo": {
    "salePrice": 0,
    "deposit": 0,
    "monthlyRent": 0,
    "yield": 0,
    "pricePerPyeong": 0,
    "aiEstimate": 0
  },
  "leases": [
    {
      "floor": "",
      "tenant": "",
      "areaSqm": 0,
      "areaPyeong": 0,
      "deposit": 0,
      "monthlyRent": 0,
      "notes": ""
    }
  ],
  "analysisScore": {
    "accessibilityScore": null,
    "transportScore": null,
    "developmentPlanScore": null,
    "buildingSizeScore": null,
    "structureScore": null,
    "buildingAgeScore": null,
    "maintenanceScore": null,
    "illegalBuildingScore": null,
    "harmfulFacilityScore": null,
    "constructionLimitScore": null,
    "salesComparisonScore": null,
    "marketPriceScore": null,
    "aiEstimateScore": null,
    "landPriceGrowthScore": null,
    "rentalStabilityScore": null,
    "operatingCostScore": null,
    "taxScore": null,
    "yieldScore": null,
    "vacancyScore": null,
    "usageChangeScore": null,
    "newConstructionScore": null,
    "remodelingScore": null,
    "additionalInvestScore": null,
    "profitabilityScore": null,
    "vacatingScore": null,
    "analysisNotes": {}
  }
}`;

  console.log('Calling Claude API for PDF analysis...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Pdf,
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
    system: systemPrompt,
  });

  console.log('Claude API response received');

  // 응답에서 JSON 추출
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Claude API 응답에서 텍스트를 찾을 수 없습니다.');
  }

  let jsonStr = textContent.text.trim();

  // JSON 블록 추출 (```json ... ``` 형태인 경우)
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsedData = JSON.parse(jsonStr) as ParsedBuildingData;

    // note -> notes 변환 (Claude가 잘못된 필드명을 사용할 경우 대비)
    if (parsedData.leases) {
      parsedData.leases = parsedData.leases.map((lease: any) => {
        const { note, ...rest } = lease;
        return {
          ...rest,
          notes: lease.notes || note || undefined,
        };
      });
    }

    return parsedData;
  } catch (parseError) {
    console.error('Failed to parse Claude response as JSON:', jsonStr);
    throw new Error('Claude API 응답을 파싱할 수 없습니다.');
  }
}

export async function parseBuildingPdf(buffer: Buffer): Promise<ParsedBuildingData> {
  console.log('Starting PDF parse, buffer size:', buffer.length);

  let text = '';

  try {
    text = await extractTextFromPdf(buffer);
    console.log('PDF text extraction completed, text length:', text.length);
  } catch (pdfError) {
    console.error('pdf2json error:', pdfError);
    // pdf2json 실패시 Claude API로 시도
    console.log('Falling back to Claude API...');
    return await extractDataWithClaude(buffer);
  }

  // 텍스트가 너무 적으면 이미지 기반 PDF로 판단하고 Claude API 사용
  if (!text || text.trim().length < 100) {
    console.log('Text too short, using Claude API for image-based PDF...');
    return await extractDataWithClaude(buffer);
  }

  console.log('PDF Text (first 2000 chars):', text.substring(0, 2000));

  // 기본 정보 추출
  const buildingName = extractBuildingName(text);
  const address = extractAddress(text);
  const roadStatus = extractRoadStatus(text);

  // 토지 정보 추출
  const landAreaSqm = extractLandArea(text, 'sqm');
  const landAreaPyeong = extractLandArea(text, 'pyeong');
  const zoning = extractZoning(text);
  const landPricePerPyeong = extractLandPrice(text, 'perPyeong');
  const landPriceTotal = extractLandPrice(text, 'total');

  // 건물 정보 추출
  const totalAreaSqm = extractBuildingArea(text, 'total', 'sqm');
  const totalAreaPyeong = extractBuildingArea(text, 'total', 'pyeong');
  const buildingAreaSqm = extractBuildingArea(text, 'building', 'sqm');
  const buildingAreaPyeong = extractBuildingArea(text, 'building', 'pyeong');
  const buildingCoverageRatio = extractRatio(text, 'coverage');
  const floorAreaRatio = extractRatio(text, 'floor');
  const floors = extractFloors(text);
  const { basement, above } = parseFloors(floors);
  const parkingSpaces = extractParking(text);
  const completionDate = extractCompletionDate(text);
  const hasElevator = extractElevator(text);

  // 금액 정보 추출
  const salePrice = extractSalePrice(text);
  const deposit = extractDeposit(text);
  const monthlyRent = extractMonthlyRent(text);
  const yieldRate = extractYield(text);
  const pricePerPyeong = extractPricePerPyeong(text);
  const aiEstimate = extractAiEstimate(text);

  // 임대차 현황 추출
  const leases = extractLeases(text);

  return {
    building: {
      name: buildingName,
      address: address,
      roadStatus: roadStatus,
    },
    landInfo: {
      areaSqm: landAreaSqm,
      areaPyeong: landAreaPyeong,
      zoning: zoning,
      landPricePerPyeong: landPricePerPyeong,
      landPriceTotal: landPriceTotal,
    },
    buildingInfo: {
      totalAreaSqm: totalAreaSqm,
      totalAreaPyeong: totalAreaPyeong,
      buildingAreaSqm: buildingAreaSqm,
      buildingAreaPyeong: buildingAreaPyeong,
      buildingCoverageRatio: buildingCoverageRatio,
      floorAreaRatio: floorAreaRatio,
      floors: floors,
      basementFloors: basement,
      aboveGroundFloors: above,
      parkingSpaces: parkingSpaces,
      completionDate: completionDate,
      hasElevator: hasElevator,
    },
    priceInfo: {
      salePrice: salePrice,
      deposit: deposit,
      monthlyRent: monthlyRent,
      yield: yieldRate,
      pricePerPyeong: pricePerPyeong,
      aiEstimate: aiEstimate,
    },
    leases: leases,
  };
}

// 건물명 추출
function extractBuildingName(text: string): string {
  // "암사동 바이스트릿 (인수)" 패턴 또는 첫 줄
  const patterns = [
    /([가-힣]+동\s+[가-힣a-zA-Z]+(?:\s*\([^)]+\))?)/,
    /빌딩PT\s+프레젠테이션\s*([가-힣a-zA-Z\s()]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return '';
}

// 주소 추출
function extractAddress(text: string): string {
  const match = text.match(/서울[시]?\s*[가-힣]+구\s*[가-힣]+동\s*[\d-]+/);
  return match ? match[0].trim() : '';
}

// 도로상황 추출
function extractRoadStatus(text: string): string {
  const patterns = [
    /도로상황\s*([\d]+m\s*\*\s*[\d]+m[^가-힣]*(?:\([^)]+\))?)/i,
    /([\d]+m\s*\*\s*[\d]+m\s*(?:\([^)]+\))?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return '';
}

// 토지 면적 추출
function extractLandArea(text: string, unit: 'sqm' | 'pyeong'): number {
  if (unit === 'sqm') {
    const patterns = [
      /면적\s*([\d,.]+)\s*㎡/,
      /토지[^]*?면적[^]*?([\d,.]+)\s*㎡/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return extractNumber(match[1]);
    }
  } else {
    const patterns = [
      /([\d,.]+)\s*㎡\s*([\d,.]+)\s*평/,
      /면적[^]*?([\d,.]+)\s*평/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return extractNumber(match[2] || match[1]);
    }
  }
  return 0;
}

// 용도지역 추출
function extractZoning(text: string): string {
  const match = text.match(/용도지역\s*([가-힣\d]+지역)/);
  return match ? match[1].trim() : '';
}

// 공시지가 추출
function extractLandPrice(text: string, type: 'perPyeong' | 'total'): number {
  if (type === 'perPyeong') {
    const patterns = [
      /공시지가\s*\(평\)\s*([\d,]+)\s*원/i,
      /공시지가[^합]*?([\d,]+)\s*원/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return extractNumber(match[1]);
    }
  } else {
    const match = text.match(/합계\s*([\d,]+)\s*원/);
    return match ? extractNumber(match[1]) : 0;
  }
  return 0;
}

// 건물 면적 추출
function extractBuildingArea(text: string, type: 'total' | 'building', unit: 'sqm' | 'pyeong'): number {
  if (type === 'total') {
    if (unit === 'sqm') {
      const match = text.match(/연면적\s*([\d,.]+)\s*㎡/);
      return match ? extractNumber(match[1]) : 0;
    } else {
      const match = text.match(/연면적[^]*?([\d,.]+)\s*㎡[^]*?([\d,.]+)\s*평/);
      return match ? extractNumber(match[2]) : 0;
    }
  } else {
    if (unit === 'sqm') {
      const match = text.match(/건축면적\s*([\d,.]+)\s*㎡/);
      return match ? extractNumber(match[1]) : 0;
    } else {
      const match = text.match(/건축면적[^]*?([\d,.]+)\s*㎡[^]*?([\d,.]+)\s*평/);
      return match ? extractNumber(match[2]) : 0;
    }
  }
}

// 건폐율/용적률 추출
function extractRatio(text: string, type: 'coverage' | 'floor'): number {
  if (type === 'coverage') {
    const match = text.match(/건폐율\s*([\d.]+)\s*%/);
    return match ? extractNumber(match[1]) : 0;
  } else {
    const match = text.match(/용적률\s*([\d.]+)\s*%/);
    return match ? extractNumber(match[1]) : 0;
  }
}

// 규모 추출
function extractFloors(text: string): string {
  const match = text.match(/규모\s*(B?\d+\/?\d*F?)/i);
  return match ? match[1].trim() : '';
}

// 주차대수 추출
function extractParking(text: string): number {
  const patterns = [
    /주차대수\s*(?:총\s*)?([\d]+)\s*대/,
    /총\s*([\d]+)\s*대/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return 0;
}

// 준공년도 추출
function extractCompletionDate(text: string): string | undefined {
  const match = text.match(/준공년도\s*([\d-]+)/);
  return match ? match[1].trim() : undefined;
}

// 승강기 추출
function extractElevator(text: string): boolean {
  const match = text.match(/승강기\s*([^\s]+)/);
  if (match) {
    return !match[1].includes('-') && !match[1].includes('없');
  }
  return false;
}

// 매매가 추출
function extractSalePrice(text: string): number {
  const patterns = [
    /매매가\s*([\d]+억)/,
    /매매가\s*([\d억만,]+원?)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseKoreanPrice(match[1]);
  }
  return 0;
}

// 보증금 추출
function extractDeposit(text: string): number {
  const match = text.match(/보증금\s*([\d억만,]+)/);
  return match ? parseKoreanPrice(match[1]) : 0;
}

// 월 임대료 추출
function extractMonthlyRent(text: string): number {
  const patterns = [
    /임대료\s*([\d,]+)\s*만/,
    /월세\s*([\d,]+)\s*만/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return extractNumber(match[1]) * 10000;
  }
  return 0;
}

// 수익률 추출
function extractYield(text: string): number {
  const match = text.match(/수익률\s*([\d.]+)\s*%/);
  return match ? extractNumber(match[1]) : 0;
}

// 평단가 추출
function extractPricePerPyeong(text: string): number {
  const match = text.match(/평단가\s*([\d,]+)\s*만/);
  return match ? extractNumber(match[1]) * 10000 : 0;
}

// AI 추정가 추출
function extractAiEstimate(text: string): number {
  const patterns = [
    /AI\s*추정가?\s*([\d억만,]+)/i,
    /AI시세[^]*?([\d억만,]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseKoreanPrice(match[1]);
  }
  return 0;
}

// 임대차 현황 추출
function extractLeases(text: string): ParsedBuildingData['leases'] {
  const leases: ParsedBuildingData['leases'] = [];

  const leasePattern = /(지하?\d+층|[1-9]층)\s+([가-힣a-zA-Z\s()]+?)\s+([\d.]+)㎡\s+([\d.]+)평\s+([\d,]+만?)\s+([\d,]+만?)\s*([가-힣]*)/g;

  let match;
  while ((match = leasePattern.exec(text)) !== null) {
    const [, floor, tenant, areaSqm, areaPyeong, deposit, monthlyRent, notes] = match;

    leases.push({
      floor: floor.trim(),
      tenant: tenant.trim(),
      areaSqm: parseFloat(areaSqm),
      areaPyeong: parseFloat(areaPyeong),
      deposit: parseKoreanPrice(deposit),
      monthlyRent: parseKoreanPrice(monthlyRent),
      notes: notes?.trim() || undefined,
    });
  }

  return leases;
}
