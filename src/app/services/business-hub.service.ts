import { Injectable, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BusinessHubApi, BusinessAdminPageDto } from './business-hub.api';
import {
  BusinessDto,
  BusinessRegistrationDto,
  Page,
  WeightedBusinessHitDto,
  BusinessImageDto,
  BusinessServiceDto,
} from '../models/business-backend';

/** Card VM used in lists/grids */
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
  ownerId?: number; // used by click-audit
}

/** Detail VM used in the business detail page */
export interface DetailedBusinessVM extends BusinessCardVM {
  fullDescription: string;
  services: string[];
  gallery: string[];
  reviews: Array<{ id: number; author: string; rating: number; comment: string; date: string }>;
}

/** Dialog VM (business + owner) */
export interface BusinessDialogVM {
  business: any;
  owner: any;
  verified?: boolean;
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

  // ===================== CATEGORIES =====================
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

  getServiceName(serviceId: number): Observable<string> {
    return this.api.getService(serviceId).pipe(map((s: BusinessServiceDto) => s.serviceName));
  }

  // ===================== DIRECTORY / SEARCH (plural path) =====================
  /**
   * Backend search across directory.
   * - categoryValue: 'all' or serviceId (string)
   * - zip: optional
   * - page/size: optional
   */
  searchDirectory(opts: {
    q?: string;
    categoryValue?: string;  // 'all' | '<serviceId>'
    zip?: string;
    page?: number;
    size?: number;
  }): Observable<BusinessCardVM[]> {
    const serviceIdParam =
      opts.categoryValue && opts.categoryValue !== 'all' ? String(opts.categoryValue) : undefined;

    return this.api.searchDirectory({
      q: opts.q ?? undefined,
      serviceId: serviceIdParam,
      zipCode: opts.zip ?? undefined,
      page: opts.page ?? 0,
      size: opts.size ?? 50,
    }).pipe(
      map((res: Page<BusinessDto>) => (res?.content ?? []).map(this.toCardVM))
    );
  }

  /** List businesses for a specific service/category (plural path). */
  getBusinessesByCategory(categoryServiceId: number | string): Observable<BusinessCardVM[]> {
    const sid = String(categoryServiceId);
    return this.api.getBusinessesByService(sid, 0, 50).pipe(
      map((page: Page<BusinessDto>) => (page?.content ?? []).map(this.toCardVM))
    );
  }

  /** Weighted (NLP) search passthrough */
  searchWeighted(q: string, page = 0, size = 10): Observable<Page<WeightedBusinessHitDto>> {
    return this.api.searchWeighted(q, page, size);
  }

  // ===================== DETAIL / DIALOG =====================
  /** Detail for the page (maps to DetailedBusinessVM) */
  getBusinessById(id: number): Observable<DetailedBusinessVM | null> {
    return this.api.getBusiness(id).pipe(map((reg) => (reg ? this.toDetailVMFromRegistration(reg) : null)));
  }

  /** Detail for dialog (business + owner) */
  getDetails(id: number): Observable<BusinessDialogVM> {
    return this.api.getBusiness(id).pipe(map((reg) => this.toDialogVMFromRegistration(reg)));
  }

  // ===================== ADMIN / VERIFY / UPLOADS =====================
  adminList(args: { page: number; size: number; serviceId?: number; zipCode?: string }): Observable<BusinessAdminPageDto> {
    return this.api.adminList(args);
  }

  toggleVerify(businessId: number, loginUserId: number) {
    return this.api.verifyIfPending(businessId, loginUserId);
  }

  uploadImages(businessId: number, files: File[]) {
    return this.api.uploadImages(businessId, files);
  }

  // ===================== GALLERY HELPERS =====================
  /**
   * Used by category cards to swap avatar with first gallery image (if present).
   * Returns URL string or null.
   */
  getFirstGalleryImage(businessId: number): Observable<string | null> {
    return this.api.listImages(businessId).pipe(
      map((arr: BusinessImageDto[]) => this.extractImageUrl(arr?.[0]) ?? null)
    );
  }

  // ===================== REGISTRATION (owner + business) =====================
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

  // ===================== MAPPERS =====================
  /** Base card mapper: BusinessDto -> BusinessCardVM */
  private toCardVM = (b: BusinessDto): BusinessCardVM => {
    // try to discover optional fields from DTO (keeps your UI resilient)
    const anyB: any = b;

    // Derive first gallery image if DTO already carries string[] gallery
    const galleryArr: string[] | undefined = Array.isArray(anyB.gallery) ? anyB.gallery : undefined;
    const firstGallery = galleryArr?.[0];

    return {
      id: b.businessId,
      name: b.businessName,
      description: b.serviceDescription || '',
      rating: Number(anyB.avgRating ?? 0),
      reviewCount: Number(anyB.reviewsCount ?? 0),
      address: b.businessAddress || '',
      phone: anyB.contactPhone || '',
      email: b.businessEmail || '',
      website: b.websiteUrl || '',
      hours: b.businessHours || '',
      // prefer gallery[0], then logoUrl, else placeholder
      image: firstGallery ?? anyB.logoUrl ?? '/assets/placeholder-business.jpg',
      tags: anyB.tags ?? [],
      memberSince: (b.createdOn ? new Date(b.createdOn).getFullYear() : 2022),
      verified:
        anyB.verified === true ||
        anyB.statusName === 'verified' ||
        (typeof anyB.updatedBy === 'string' && anyB.updatedBy.toLowerCase() === 'admin'),
      featured: Boolean(anyB.featured ?? false),
      ownerId: anyB.ownerId, // present on admin/directory list responses sometimes
    };
  };

  /** RegistrationDto -> DetailedBusinessVM (detail page) */
  private toDetailVMFromRegistration(reg: BusinessRegistrationDto): DetailedBusinessVM {
    const anyReg: any = reg;
    const b: BusinessDto = (anyReg.business ?? reg) as BusinessDto;

    const base = this.toCardVM(b);

    // If gallery not present, default to [hero]
    const gallery: string[] = Array.isArray((anyReg.business ?? anyReg).gallery)
      ? (anyReg.business ?? anyReg).gallery
      : [base.image];

    const hero = gallery.length ? gallery[0] : base.image;

    return {
      ...base,
      image: hero,
      fullDescription: (anyReg.fullDescription ?? base.description) || '—',
      services: (anyReg.services ?? []) as string[],
      gallery,
      reviews: ((anyReg.reviews ?? []) as any[]).map((r: any, idx: number) => ({
        id: r?.id ?? idx + 1,
        author: r?.author ?? 'User',
        rating: Number(r?.rating ?? 0),
        comment: r?.comment ?? r?.text ?? '',
        date: r?.date ?? '',
      })),
    };
  }

  /** RegistrationDto -> Dialog VM ({business, owner, verified}) */
  private toDialogVMFromRegistration(reg: BusinessRegistrationDto): BusinessDialogVM {
    const anyReg: any = reg;
    const business = anyReg.business ?? reg ?? {};
    const owner = anyReg.owner ?? {};
    const verified =
      business?.verified === true ||
      anyReg?.verified === true ||
      business?.statusName === 'verified' ||
      (typeof business?.updatedBy === 'string' && business.updatedBy.toLowerCase() === 'admin');

    return { business, owner, verified };
  }

  /** Extract a URL string from a BusinessImageDto-like object */
  private extractImageUrl(img?: BusinessImageDto | any | null): string | null {
    if (!img) return null;
    return img.url ?? img.imageUrl ?? img.presignedUrl ?? null;
  }

  // ===================== STYLE HELPERS =====================
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
