
export interface Company {
  id: number;
  companyName: string;
  jurisdiction: string;
  uploadedOn: string; // ISO date string (e.g., '2023-10-01')
  type: string; // Document type (e.g., 'PDF', 'DOC')
  companyId?: number; // Optional, used in some API responses
  viewStatus?: boolean; // Optional, for non-admin view status tracking
  imagePath?: string; // Optional, for company image
}

export interface DocumentType {
  documentTypeId: number;
  typeName: string;
  description?: string;
}
