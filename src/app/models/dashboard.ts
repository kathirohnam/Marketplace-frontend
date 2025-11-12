export interface Step {
  name: string;
  completed: boolean;
}

export interface UserProgress {
  state: string;
  companyName: string;
  steps: Step[];
  firstIncompleteStepIndex?: number;
  companyId?: number;
  date?: string;
  llcName?: string;
  step?: number; // Added to match API response
  statusName?: string;
}

export interface CompanyDetails {
  companyId?: number;
  state?: string;
  companyName?: string;
  llcName?: string;
  
  step?: number;
  step1: string; // State selection
  step2: { companyName: string };
  step3: string; // Formation date
  step4: {  // ✅ Change from string to object
    
    businessDescription: string;
    tradeName: string;
    principalActivity: string;
  }; // Business description
  step5: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  step6: {
    streetAddress1: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  step7?: boolean; // Operating agreement
  step8?: boolean; // Compliance
  step9?: boolean; // BOI report
  step10?: boolean; // Annual report
  step11?: { totalCharges: number };
  step12?: boolean; // Payment
  step13a?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }>; // Managers
  step13b?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    ownership: number;
    isEinResponsibleParty?: boolean;
  }>; // Members
  step14?: {
    streetAddress1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  step15?: boolean; // Final confirmation
  managementStyle?: 'member' | 'manager'; 
  einDetailsDto?: {
    ssnId?: string;
    
  }
}