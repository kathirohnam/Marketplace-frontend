// services/business-hub.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BusinessHubApi } from './business-hub.api';
import {
  BusinessDto,
  BusinessRegistrationDto,
  Page,
  WeightedBusinessHitDto,
} from '../models/business-backend';

export interface BusinessCardVM {
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

export interface DetailedBusinessVM extends BusinessCardVM {
  fullDescription: string;
  services: string[];
  gallery: string[];
  reviews: Array<{ id: number; author: string; rating: number; comment: string; date: string }>;
}

export interface Category {
  name: string;
  value: string;  // serviceId as string
  count: number;
  image: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessHubService {
  private loading = signal(false);
  getLoadingState() { return this.loading.asReadonly(); }

  constructor(private api: BusinessHubApi) {}

  // Categories
  getCategories(): Observable<Category[]> {
    return this.api.listCategoriesVM().pipe(
      map((services) =>
        services.map((s, i) => ({
          name: s.name,
          value: String(s.id),
          count: 0,
          image: this.pickCategoryImage(s.name, i),
          color: this.pickColor(i),
        }))
      )
    );
  }

  // Lists / detail
  getBusinessesByCategory(categoryServiceId: number | string): Observable<BusinessCardVM[]> {
    const id = Number(categoryServiceId);
    return this.api.listBusinesses(id).pipe(map(list => list.map(this.toCardVM)));
  }

  searchWeighted(q: string, page = 0, size = 10): Observable<Page<WeightedBusinessHitDto>> {
    return this.api.searchWeighted(q, page, size);
  }

  getBusinessById(id: number): Observable<DetailedBusinessVM | null> {
    return this.api.getBusiness(id).pipe(map(b => (b ? this.toDetailVM(b) : null)));
  }

  registerBusinessAndOwner(payload: {
    owner: { firstName: string; lastName: string; email: string; phone: string };
    business: {
      serviceId: number;
      businessName: string;
      serviceDescription?: string;
      yearsInBusiness?: number | null;
      businessAddress?: string;
      city?: string;
      zipCode?: string;
      websiteUrl?: string;
      businessHours?: string;
    };
    images?: File[];
    loginUserId?: number;
  }) {
    const body: BusinessRegistrationDto = {
      owner: {
        firstName: payload.owner.firstName,
        lastName: payload.owner.lastName,
        personalEmail: payload.owner.email,
        contactNumber: payload.owner.phone,
      },
      business: {
        businessId: 0 as any,
        ownerId: undefined,
        serviceId: payload.business.serviceId,
        businessName: payload.business.businessName,
        serviceDescription: payload.business.serviceDescription || null,
        yearsInBusiness: payload.business.yearsInBusiness ?? null,
        businessAddress: payload.business.businessAddress || null,
        city: payload.business.city || null,
        zipCode: payload.business.zipCode || null,
        websiteUrl: payload.business.websiteUrl || null,
        businessHours: payload.business.businessHours || null,
        businessEmail: null,
        state: null,
        createdBy: null,
        updatedBy: null,
        createdOn: null,
        updatedOn: null,
      },
    };

    return this.api.registerBusinessOwner(body, payload.loginUserId).pipe(
      map(res => ({ res, images: payload.images || [] }))
    );
  }

  uploadImages(businessId: number, files: File[]) {
    return this.api.uploadImages(businessId, files);
  }

  // Helpers
  private toCardVM(b: BusinessDto): BusinessCardVM {
    return {
      id: b.businessId,
      name: b.businessName,
      description: b.serviceDescription || '',
      rating: 4.6,
      reviewCount: 25,
      address: b.businessAddress || '',
      phone: '',
      email: b.businessEmail || '',
      website: b.websiteUrl || '',
      hours: b.businessHours || '',
      image: '/assets/placeholder-business.jpg',
      tags: [],
      memberSince: (b.createdOn ? new Date(b.createdOn).getFullYear() : 2022),
      verified: true,
      featured: false,
    };
  }

  private toDetailVM(b: BusinessDto): DetailedBusinessVM {
    const card = this.toCardVM(b);
    return {
      ...card,
      fullDescription: card.description || '—',
      services: [],
      gallery: [card.image],
      reviews: [],
    };
  }

  private pickCategoryImage(_name: string, i: number): string {
    const images = [
      'https://images.unsplash.com/photo-1674981208693-de5a9c4c4f44?q=80&w=1080',
      'https://images.unsplash.com/photo-1643391448659-8e58f99958b6?q=80&w=1080',
      'https://images.unsplash.com/photo-1643049751039-5e112a5953ae?q=80&w=1080',
      'https://images.unsplash.com/photo-1660592868727-858d28c3ba52?q=80&w=1080',
      'https://images.unsplash.com/photo-1590764095558-abd89de9db5f?q=80&w=1080',
      'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?q=80&w=1080',
      'https://images.unsplash.com/photo-1564732005956-20420ebdab60?q=80&w=1080',
      'https://images.unsplash.com/photo-1725724812270-b1f4a304bfef?q=80&w=1080',
    ];
    return images[i % images.length];
  }

  private pickColor(i: number): string {
    const colors = [
      'from-gray-800 to-gray-900',
      'from-green-700 to-green-800',
      'from-blue-700 to-blue-800',
      'from-orange-600 to-orange-700',
      'from-amber-600 to-amber-700',
      'from-pink-600 to-pink-700',
      'from-yellow-600 to-yellow-700',
      'from-red-600 to-red-700',
      'from-purple-600 to-purple-700',
      'from-emerald-600 to-emerald-700',
      'from-slate-600 to-slate-700',
      'from-indigo-600 to-indigo-700',
    ];
    return colors[i % colors.length];
  }
}
