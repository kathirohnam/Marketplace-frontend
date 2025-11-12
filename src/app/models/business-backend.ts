// === Shared ===
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number;
}

// === Business DTOs (from backend) ===
export interface BusinessDto {
  businessId: number;
  ownerId?: number | null;
  serviceId?: number | null;

  businessName: string;
  serviceDescription?: string | null;
  yearsInBusiness?: number | null;
  zipCode?: string | null;
  businessAddress?: string | null;
  websiteUrl?: string | null;
  businessLicense?: string | null;
  businessEmail?: string | null;
  businessHours?: string | null;
  city?: string | null;
  state?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;
  createdOn?: string | null; // ISO
  updatedOn?: string | null; // ISO
}

export interface BusinessOwnerDto {
  ownerId?: number | null;
  firstName: string;
  lastName: string;
  personalEmail: string;
  contactNumber: string;
  createdOn?: string | null; // ISO
}

export interface BusinessRegistrationDto {
  owner: BusinessOwnerDto;
  business: BusinessDto;
}

// Weighted (NLP) search response item
export interface WeightedBusinessHitDto {
  business: BusinessDto;
  score: number;
  wordWeights: Record<string, number>;
  fieldWeights: Record<string, number>;
}

// Audit clicks
export interface AuditClickRequestDto {
  businessId: number;
  ownerId?: number | null;
  sessionId: string;
}

export interface AuditClickResponseDto {
  id: number;
  businessId: number;
  ownerId?: number | null;
  sessionId: string;
  occurredAt: string; // ISO
  deduped: boolean;
}

export interface AuditClickStatsDto {
  today: number;
  last7d: number;
  last30d: number;
  allTime: number;
}

// Business image DTO (record)
export interface BusinessImageDto {
  imageId: number;
  key: string;
  size: number;
  lastModified: string;
  eTag: string;
}

// Business Services
export interface BusinessServiceDto {
  serviceId: number;
  serviceName: string;
  description?: string | null;
}

// If your projection returns "serviceId" + "serviceName", we just reuse BusinessServiceDto.
export type ServiceIdName = BusinessServiceDto;

// === Frontend view models (light) ===
export interface CategoryVM {
  id: number;         // serviceId
  name: string;       // serviceName
}
