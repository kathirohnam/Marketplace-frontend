// src/app/interfaces/business.interface.ts

export interface Business {
  id: number;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  image: string;
  tags: string[];
  memberSince: number;
  verified: boolean;
  featured: boolean;
}

export interface DetailedBusiness extends Business {
  fullDescription: string;
  services: string[];
  gallery: string[];
  reviews: Review[];
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SearchParams {
  query: string;
  category: string;
  zipCode: string;
}

export interface Category {
  name: string;
  value: string;
  count: number;
  image: string;
  color: string;
}

/**
 * UPDATED: split owner name into firstName/lastName.
 * `ownerName` is optional and computed on submit for backward compatibility.
 */
export interface BusinessRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  businessName: string;
  serviceType: string;
  description: string;
  yearsExperience: string;

  address: string;
  city: string;
  zipCode: string;
  website: string;
  hours: string;

  /** Optional; component joins first+last when submitting to API */
  ownerName?: string;
}

export interface BusinessRegistrationFormData extends BusinessRegistrationData {
  isPreviousUser: boolean;
  businessImages: File[];
}
