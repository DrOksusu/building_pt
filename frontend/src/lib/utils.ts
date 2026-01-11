// 숫자 포맷팅 (억/만원 단위)
export function formatPrice(value: number): string {
  if (value >= 100000000) {
    const eok = Math.floor(value / 100000000);
    const man = Math.floor((value % 100000000) / 10000);
    if (man > 0) {
      return `${eok}억 ${man.toLocaleString()}만원`;
    }
    return `${eok}억원`;
  }
  if (value >= 10000) {
    return `${Math.floor(value / 10000).toLocaleString()}만원`;
  }
  return `${value.toLocaleString()}원`;
}

// 숫자에 콤마 추가
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// 퍼센트 포맷팅
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// 점수에 따른 색상 반환 (5점 만점 기준)
export function getScoreColor(score: number): string {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  if (score >= 2) return 'text-orange-600';
  return 'text-red-600';
}

// 점수에 따른 배경색 반환 (5점 만점 기준)
export function getScoreBgColor(score: number): string {
  if (score >= 4) return 'bg-green-100';
  if (score >= 3) return 'bg-yellow-100';
  if (score >= 2) return 'bg-orange-100';
  return 'bg-red-100';
}

// 총점에 따른 등급 반환 (5점 만점 기준)
export function getGrade(totalScore: number): string {
  if (totalScore >= 4.5) return 'S';
  if (totalScore >= 4) return 'A';
  if (totalScore >= 3.5) return 'B';
  if (totalScore >= 3) return 'C';
  if (totalScore >= 2.5) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S': return 'text-purple-600 bg-purple-100';
    case 'A': return 'text-green-600 bg-green-100';
    case 'B': return 'text-blue-600 bg-blue-100';
    case 'C': return 'text-yellow-600 bg-yellow-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    default: return 'text-red-600 bg-red-100';
  }
}
