const API_BASE_URL = 'https://sih-26099-backend.onrender.com';


// ---------------------------------------------------------
// AUTH / CURRENT USER
// ---------------------------------------------------------

function getCurrentUserId(): string {
  try {
    const storedUser = localStorage.getItem('ncmh_user');

    if (!storedUser) {
      return '';
    }

    const user = JSON.parse(storedUser);

    return String(user.id || '');
  } catch {
    return '';
  }
}


// ---------------------------------------------------------
// GENERIC API REQUEST
// ---------------------------------------------------------

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        'X-User-ID': getCurrentUserId(),

        ...(options.body instanceof FormData
          ? {}
          : {
              'Content-Type': 'application/json',
            }),

        ...(options.headers || {}),
      },
    }
  );


  if (!response.ok) {

    const errorText = await response.text();

    throw new Error(
      `API request failed: ${response.status} ${errorText}`
    );
  }


  return response.json();
}


class PortalApiClient {


  // ---------------------------------------------------------
  // CPSE
  // ---------------------------------------------------------

  public async getCPSEs(): Promise<any[]> {

    return request<any[]>('/cpse');

  }


  // ---------------------------------------------------------
  // MATERIALS
  // ---------------------------------------------------------

  public async getMaterials(): Promise<any[]> {

    return request<any[]>('/materials');

  }


  public async getMaterial(
    materialId: number
  ): Promise<any> {

    return request<any>(
      `/materials/${materialId}`
    );

  }


  public async createMaterial(
    data: {
      cpse_id: number;
      material_code: string;
      original_description: string;
      original_specifications?: string;
      original_unit?: string;
      category?: string;
      technical_parameters?: string;
      raw_record?: string;
    }
  ): Promise<any> {

    return request<any>(
      '/materials',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  }


  public async uploadMaterials(
    file: File
  ): Promise<any> {

    const formData = new FormData();

    formData.append('file', file);

    return request<any>(
      '/materials/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

  }


  // ---------------------------------------------------------
  // AI RECOMMENDATION
  // ---------------------------------------------------------

  public async createAIRecommendation(
    data: {
      original_material_id: number;
      national_material_id: number;
      match_type: string;
      confidence: string;
      explanation: string;
    }
  ): Promise<any> {

    return request<any>(
      '/ai/recommendation',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  }


  // ---------------------------------------------------------
  // MATERIAL INTELLIGENCE ASSISTANT
  // ---------------------------------------------------------

  public async askAssistant(
    query: string
  ): Promise<any> {

    return request<any>(
      '/assistant/query',
      {
        method: 'POST',
        body: JSON.stringify({
          query,
        }),
      }
    );

  }


  // ---------------------------------------------------------
  // MAPPINGS
  // ---------------------------------------------------------

  public async getMappings(): Promise<any[]> {

    return request<any[]>('/mappings');

  }


  public async createMapping(
    data: {
      original_material_id: number;
      national_material_id: number;
      match_type: string;
      confidence: string;
      explanation?: string;
      status?: string;
    }
  ): Promise<any> {

    return request<any>(
      '/mappings',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  }


  public async approveMapping(
    mappingId: number,
    user?: string,
    reason?: string
  ): Promise<any> {

    const params = new URLSearchParams();

    if (user) {
      params.set('user', user);
    }

    if (reason) {
      params.set('reason', reason);
    }

    const query = params.toString();

    return request<any>(
      `/mappings/${mappingId}/approve${
        query ? `?${query}` : ''
      }`,
      {
        method: 'PUT',
      }
    );

  }


  public async rejectMapping(
    mappingId: number,
    user?: string,
    reason?: string
  ): Promise<any> {

    const params = new URLSearchParams();

    if (user) {
      params.set('user', user);
    }

    if (reason) {
      params.set('reason', reason);
    }

    const query = params.toString();

    return request<any>(
      `/mappings/${mappingId}/reject${
        query ? `?${query}` : ''
      }`,
      {
        method: 'PUT',
      }
    );

  }


  // ---------------------------------------------------------
  // NATIONAL MATERIALS
  // ---------------------------------------------------------

  public async getNationalMaterials(): Promise<any[]> {

    return request<any[]>(
      '/national-materials'
    );

  }


  public async getNationalMaterial(
    materialId: number
  ): Promise<any> {

    return request<any>(
      `/national-materials/${materialId}`
    );

  }


  public async createNationalMaterial(
    data: {
      national_code: string;
      standard_description: string;
      category?: string;
      status?: string;
    }
  ): Promise<any> {

    return request<any>(
      '/national-materials',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  }


  // ---------------------------------------------------------
  // TRACEABILITY
  // ---------------------------------------------------------

  public async getMaterialNationalCode(
    materialId: number
  ): Promise<any> {

    return request<any>(
      `/materials/${materialId}/national-code`
    );

  }


  public async getNationalMaterialCPSEMaterials(
    nationalMaterialId: number
  ): Promise<any> {

    return request<any>(
      `/national-materials/${nationalMaterialId}/cpse-materials`
    );

  }


  // ---------------------------------------------------------
  // VERSION CONTROL
  // ---------------------------------------------------------

  public async getMaterialVersions(
    materialId: number
  ): Promise<any[]> {

    return request<any[]>(
      `/national-materials/${materialId}/versions`
    );

  }


  public async createMaterialVersion(
    materialId: number,
    data: {
      standard_description?: string;
      category?: string;
      status?: string;
      changed_by?: string;
      change_reason?: string;
    }
  ): Promise<any> {

    return request<any>(
      `/national-materials/${materialId}/version`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  }


  // ---------------------------------------------------------
  // AUDIT
  // ---------------------------------------------------------

  public async getAuditLogs(): Promise<any[]> {

    return request<any[]>(
      '/audit-logs'
    );

  }


  // ---------------------------------------------------------
  // ANALYTICS
  // ---------------------------------------------------------

  public async getAnalytics(): Promise<any> {

    return request<any>(
      '/analytics'
    );

  }


  // ---------------------------------------------------------
  // ERP
  // ---------------------------------------------------------

  public async syncERP(
    nationalMaterialId: number
  ): Promise<any> {

    return request<any>(
      `/integration/erp/sync/${nationalMaterialId}`,
      {
        method: 'POST',
      }
    );

  }


  // ---------------------------------------------------------
  // MIGRATION
  // ---------------------------------------------------------

  public async exportMigration(): Promise<any> {

    return request<any>(
      '/migration/export'
    );

  }

}


export const portalApi =
  new PortalApiClient();
