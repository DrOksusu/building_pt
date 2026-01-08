import { Building } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch(`${API_URL}/api/buildings`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchBuilding(id: number): Promise<Building | null> {
  const res = await fetch(`${API_URL}/api/buildings/${id}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data || null;
}

export async function createBuilding(building: any): Promise<Building> {
  const res = await fetch(`${API_URL}/api/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(building),
  });
  const data = await res.json();
  return data.data;
}

export async function updateBuilding(id: number, building: any): Promise<Building> {
  const res = await fetch(`${API_URL}/api/buildings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(building),
  });
  const data = await res.json();
  return data.data;
}

export async function deleteBuilding(id: number): Promise<void> {
  await fetch(`${API_URL}/api/buildings/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAnalysisScore(buildingId: number, scores: any): Promise<any> {
  const res = await fetch(`${API_URL}/api/buildings/${buildingId}/analysis-score`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scores),
  });
  const data = await res.json();
  return data.data;
}

export async function parsePdf(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch(`${API_URL}/api/pdf/parse`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    const errorMsg = data.details || data.error || 'PDF 파싱 실패';
    throw new Error(errorMsg);
  }

  return data.data;
}
