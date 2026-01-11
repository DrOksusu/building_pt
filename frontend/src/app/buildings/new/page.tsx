'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBuilding, parsePdf } from '@/lib/api';

export default function NewBuildingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [step, setStep] = useState(1);
  const [parsedLeases, setParsedLeases] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    address: '',
    roadStatus: '',
    // 토지 정보
    areaSqm: '',
    areaPyeong: '',
    zoning: '',
    landPricePerPyeong: '',
    landPriceTotal: '',
    // 건물 정보
    totalAreaSqm: '',
    totalAreaPyeong: '',
    buildingAreaSqm: '',
    buildingAreaPyeong: '',
    buildingCoverageRatio: '',
    floorAreaRatio: '',
    floors: '',
    basementFloors: '',
    aboveGroundFloors: '',
    parkingSpaces: '',
    completionDate: '',
    hasElevator: false,
    structure: '',
    // 금액 정보
    salePrice: '',
    deposit: '',
    monthlyRent: '',
    yieldRate: '',
    pricePerPyeong: '',
    aiEstimate: '',
  });

  // 분석 점수 상태
  const [analysisScores, setAnalysisScores] = useState<Record<string, number | null>>({
    accessibilityScore: null,
    transportScore: null,
    developmentPlanScore: null,
    buildingSizeScore: null,
    structureScore: null,
    buildingAgeScore: null,
    maintenanceScore: null,
    illegalBuildingScore: null,
    harmfulFacilityScore: null,
    constructionLimitScore: null,
    salesComparisonScore: null,
    marketPriceScore: null,
    aiEstimateScore: null,
    landPriceGrowthScore: null,
    rentalStabilityScore: null,
    operatingCostScore: null,
    taxScore: null,
    yieldScore: null,
    vacancyScore: null,
    usageChangeScore: null,
    newConstructionScore: null,
    remodelingScore: null,
    additionalInvestScore: null,
    profitabilityScore: null,
    vacatingScore: null,
  });

  // 분석 점수 이유 (AI 설명)
  const [analysisNotes, setAnalysisNotes] = useState<Record<string, string>>({});

  const scoreLabels: Record<string, { label: string; category: string }> = {
    accessibilityScore: { label: '접근성', category: '입지 분석' },
    transportScore: { label: '교통', category: '입지 분석' },
    developmentPlanScore: { label: '개발호재', category: '입지 분석' },
    buildingSizeScore: { label: '건물규모', category: '건물 분석' },
    structureScore: { label: '구조형식', category: '건물 분석' },
    buildingAgeScore: { label: '건물연식', category: '건물 분석' },
    maintenanceScore: { label: '유지관리', category: '건물 분석' },
    illegalBuildingScore: { label: '위반건축물', category: '권리 분석' },
    harmfulFacilityScore: { label: '혐오시설', category: '권리 분석' },
    constructionLimitScore: { label: '건축제한', category: '권리 분석' },
    salesComparisonScore: { label: '실거래비교', category: '시세 분석' },
    marketPriceScore: { label: '호가시세', category: '시세 분석' },
    aiEstimateScore: { label: 'AI추정가', category: '시세 분석' },
    landPriceGrowthScore: { label: '공시지가상승', category: '시세 분석' },
    rentalStabilityScore: { label: '임대안정성', category: '수익성 분석' },
    operatingCostScore: { label: '운영비용', category: '수익성 분석' },
    taxScore: { label: '세금', category: '수익성 분석' },
    yieldScore: { label: '수익률', category: '수익성 분석' },
    vacancyScore: { label: '공실률', category: '수익성 분석' },
    usageChangeScore: { label: '용도변경', category: '사업성 분석' },
    newConstructionScore: { label: '신축가능성', category: '사업성 분석' },
    remodelingScore: { label: '리모델링', category: '사업성 분석' },
    additionalInvestScore: { label: '추가투자', category: '사업성 분석' },
    profitabilityScore: { label: '사업수익성', category: '사업성 분석' },
    vacatingScore: { label: '명도난이도', category: '사업성 분석' },
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    setParsing(true);
    try {
      const data = await parsePdf(file);
      console.log('Parsed data:', data);

      // 폼 데이터 채우기
      setFormData({
        name: data.building?.name || '',
        address: data.building?.address || '',
        roadStatus: data.building?.roadStatus || '',
        areaSqm: data.landInfo?.areaSqm?.toString() || '',
        areaPyeong: data.landInfo?.areaPyeong?.toString() || '',
        zoning: data.landInfo?.zoning || '',
        landPricePerPyeong: data.landInfo?.landPricePerPyeong?.toString() || '',
        landPriceTotal: data.landInfo?.landPriceTotal?.toString() || '',
        totalAreaSqm: data.buildingInfo?.totalAreaSqm?.toString() || '',
        totalAreaPyeong: data.buildingInfo?.totalAreaPyeong?.toString() || '',
        buildingAreaSqm: data.buildingInfo?.buildingAreaSqm?.toString() || '',
        buildingAreaPyeong: data.buildingInfo?.buildingAreaPyeong?.toString() || '',
        buildingCoverageRatio: data.buildingInfo?.buildingCoverageRatio?.toString() || '',
        floorAreaRatio: data.buildingInfo?.floorAreaRatio?.toString() || '',
        floors: data.buildingInfo?.floors || '',
        basementFloors: data.buildingInfo?.basementFloors?.toString() || '',
        aboveGroundFloors: data.buildingInfo?.aboveGroundFloors?.toString() || '',
        parkingSpaces: data.buildingInfo?.parkingSpaces?.toString() || '',
        completionDate: data.buildingInfo?.completionDate?.split('T')[0] || '',
        hasElevator: data.buildingInfo?.hasElevator || false,
        structure: data.buildingInfo?.structure || '',
        salePrice: data.priceInfo?.salePrice?.toString() || '',
        deposit: data.priceInfo?.deposit?.toString() || '',
        monthlyRent: data.priceInfo?.monthlyRent?.toString() || '',
        yieldRate: data.priceInfo?.yield?.toString() || '',
        pricePerPyeong: data.priceInfo?.pricePerPyeong?.toString() || '',
        aiEstimate: data.priceInfo?.aiEstimate?.toString() || '',
      });

      // 임대차 정보 저장
      if (data.leases && data.leases.length > 0) {
        setParsedLeases(data.leases);
      }

      // AI 분석 점수 저장
      if (data.analysisScore) {
        const { analysisNotes: notes, ...scores } = data.analysisScore;
        setAnalysisScores(prev => ({
          ...prev,
          ...scores,
        }));
        // 분석 이유 저장
        if (notes && typeof notes === 'object') {
          setAnalysisNotes(notes);
        }
      }

      alert('PDF 정보가 입력되었습니다. 내용을 확인해주세요.');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || 'PDF 파싱에 실패했습니다.';
      alert(`PDF 파싱 오류: ${errorMessage}\n\n수동으로 정보를 입력해주세요.`);
    } finally {
      setParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        building: {
          name: formData.name,
          address: formData.address,
          roadStatus: formData.roadStatus,
        },
        landInfo: {
          areaSqm: parseFloat(formData.areaSqm) || 0,
          areaPyeong: parseFloat(formData.areaPyeong) || 0,
          zoning: formData.zoning,
          landPricePerPyeong: parseFloat(formData.landPricePerPyeong) || 0,
          landPriceTotal: parseFloat(formData.landPriceTotal) || 0,
        },
        buildingInfo: {
          totalAreaSqm: parseFloat(formData.totalAreaSqm) || 0,
          totalAreaPyeong: parseFloat(formData.totalAreaPyeong) || 0,
          buildingAreaSqm: parseFloat(formData.buildingAreaSqm) || 0,
          buildingAreaPyeong: parseFloat(formData.buildingAreaPyeong) || 0,
          buildingCoverageRatio: parseFloat(formData.buildingCoverageRatio) || 0,
          floorAreaRatio: parseFloat(formData.floorAreaRatio) || 0,
          floors: formData.floors,
          basementFloors: parseInt(formData.basementFloors) || 0,
          aboveGroundFloors: parseInt(formData.aboveGroundFloors) || 0,
          parkingSpaces: parseInt(formData.parkingSpaces) || 0,
          completionDate: formData.completionDate || undefined,
          hasElevator: formData.hasElevator,
          structure: formData.structure,
        },
        priceInfo: {
          salePrice: parseFloat(formData.salePrice) || 0,
          deposit: parseFloat(formData.deposit) || 0,
          monthlyRent: parseFloat(formData.monthlyRent) || 0,
          yield: parseFloat(formData.yieldRate) || 0,
          pricePerPyeong: parseFloat(formData.pricePerPyeong) || 0,
          aiEstimate: parseFloat(formData.aiEstimate) || undefined,
        },
        leases: parsedLeases,
      };

      // 분석 점수가 하나라도 있으면 포함
      const nonNullScores = Object.entries(analysisScores).filter(([_, v]) => v !== null);
      if (nonNullScores.length > 0) {
        (payload as any).analysisScore = {
          ...Object.fromEntries(nonNullScores.map(([k, v]) => [k, v])),
          // 분석 이유도 함께 저장
          ...(Object.keys(analysisNotes).length > 0 && { analysisNotes }),
        };
      }

      await createBuilding(payload);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('건물 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/" className="text-amber-600 hover:underline text-sm">
            ← 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">건물 등록</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* PDF 업로드 영역 */}
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-lg font-medium text-amber-800 mb-2">
              빌딩PT PDF 업로드
            </h3>
            <p className="text-sm text-amber-600 mb-4">
              PDF를 업로드하면 자동으로 정보가 입력됩니다
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className={`inline-block px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors ${
                parsing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {parsing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> 분석 중...
                </span>
              ) : (
                'PDF 파일 선택'
              )}
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 진행 표시 */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div className={`w-12 h-1 ${step > s ? 'bg-amber-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">건물명 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="예: 암사동 바이스트릿"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="예: 서울 강동구 암사동 452-15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">도로상황</label>
                  <input
                    type="text"
                    name="roadStatus"
                    value={formData.roadStatus}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="예: 25m*4m (코너)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 토지 정보 */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">토지 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">면적 (㎡)</label>
                  <input
                    type="number"
                    name="areaSqm"
                    value={formData.areaSqm}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">면적 (평)</label>
                  <input
                    type="number"
                    name="areaPyeong"
                    value={formData.areaPyeong}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">용도지역</label>
                  <input
                    type="text"
                    name="zoning"
                    value={formData.zoning}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="예: 제3종일반주거지역"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공시지가 (평당, 원)</label>
                  <input
                    type="number"
                    name="landPricePerPyeong"
                    value={formData.landPricePerPyeong}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공시지가 합계 (원)</label>
                  <input
                    type="number"
                    name="landPriceTotal"
                    value={formData.landPriceTotal}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 건물 정보 */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">건물 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연면적 (㎡)</label>
                  <input
                    type="number"
                    name="totalAreaSqm"
                    value={formData.totalAreaSqm}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연면적 (평)</label>
                  <input
                    type="number"
                    name="totalAreaPyeong"
                    value={formData.totalAreaPyeong}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">건폐율 (%)</label>
                  <input
                    type="number"
                    name="buildingCoverageRatio"
                    value={formData.buildingCoverageRatio}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">용적률 (%)</label>
                  <input
                    type="number"
                    name="floorAreaRatio"
                    value={formData.floorAreaRatio}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">규모</label>
                  <input
                    type="text"
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="예: B1/4F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주차대수</label>
                  <input
                    type="number"
                    name="parkingSpaces"
                    value={formData.parkingSpaces}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">준공년도</label>
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasElevator"
                    checked={formData.hasElevator}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">승강기 있음</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 금액 정보 */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">금액 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">매매가 (원) *</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">보증금 (원)</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">월 임대료 (원)</label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수익률 (%)</label>
                  <input
                    type="number"
                    name="yieldRate"
                    value={formData.yieldRate}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">평단가 (원)</label>
                  <input
                    type="number"
                    name="pricePerPyeong"
                    value={formData.pricePerPyeong}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI 추정가 (원)</label>
                  <input
                    type="number"
                    name="aiEstimate"
                    value={formData.aiEstimate}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* 임대차 현황 미리보기 */}
              {parsedLeases.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-md font-bold text-gray-800 mb-3">임대차 현황 (PDF에서 추출)</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    {parsedLeases.map((lease, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b last:border-0">
                        <span>{lease.floor} - {lease.tenant}</span>
                        <span className="text-gray-500">{lease.areaPyeong?.toFixed(2)}평</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: 분석 점수 */}
          {step === 5 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">분석 점수</h2>
              <p className="text-sm text-gray-500 mb-4">
                AI가 PDF에서 추출한 점수입니다. 필요시 수동으로 수정할 수 있습니다.
              </p>

              {/* 카테고리별 그룹 */}
              {['입지 분석', '건물 분석', '권리 분석', '시세 분석', '수익성 분석', '사업성 분석'].map((category) => (
                <div key={category} className="mb-6">
                  <h3 className="text-md font-semibold text-amber-700 mb-3 pb-2 border-b border-amber-200">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(scoreLabels)
                      .filter(([_, info]) => info.category === category)
                      .map(([key, info]) => (
                        <div key={key} className="relative group flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-700">{info.label}</span>
                              {analysisNotes[key] && (
                                <span className="text-amber-500 cursor-help" title={analysisNotes[key]}>
                                  ℹ️
                                </span>
                              )}
                            </div>
                            {analysisScores[key] === null && (
                              <p className="text-xs text-orange-500 mt-1">
                                주어진 자료로는 알기가 어렵습니다
                              </p>
                            )}
                            {analysisScores[key] !== null && analysisNotes[key] && (
                              <p className="text-xs text-green-600 mt-1 truncate max-w-[180px]" title={analysisNotes[key]}>
                                {analysisNotes[key]}
                              </p>
                            )}
                            {analysisScores[key] !== null && !analysisNotes[key] && (
                              <p className="text-xs text-green-600 mt-1">
                                AI 추천 점수
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => setAnalysisScores(prev => ({
                                  ...prev,
                                  [key]: score,
                                }))}
                                className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                                  analysisScores[key] === score
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                          {/* 툴팁 */}
                          {analysisNotes[key] && (
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                              <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-[250px] shadow-lg">
                                <p className="font-semibold mb-1">{info.label}: {analysisScores[key]}점</p>
                                <p>{analysisNotes[key]}</p>
                              </div>
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {/* 전체 초기화 버튼 */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setAnalysisScores(Object.fromEntries(
                    Object.keys(analysisScores).map(key => [key, null])
                  ))}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  모든 점수 초기화
                </button>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                이전
              </button>
            ) : (
              <div />
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? '등록 중...' : '건물 등록'}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
