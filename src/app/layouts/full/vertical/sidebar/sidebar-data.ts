import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  { navCap: 'Home' },

  {
    displayName: 'Dashboard',
    iconName: 'tablerHome',
    bgcolor: 'error',
    route: '/apps/dashboard',
  },
  {
    displayName: 'Files',
    iconName: 'tablerTicket',
    bgcolor: 'error',
    route: 'apps/Files',
  },
  {
    displayName: 'Admin',
    iconName: 'tablerShield', // or 'tablerShieldLock' / 'tablerUserCog'
    bgcolor: 'error',
    route: 'apps/admin',
  },
  {
    displayName: 'Consumer',
    iconName: 'tablerUser',
    bgcolor: 'error',
    route: 'apps/consumer',
  },
  

  { navCap: 'Other' },

  {
    displayName: 'Disabled',
    iconName: 'tablerBan',
    bgcolor: 'accent',
    disabled: true,
  },
  {
    displayName: 'Chip',
    iconName: 'tablerMoodSmile',
    bgcolor: 'warning',
    route: '/',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: '9',
  },
  
  {
    displayName: 'Outlined',
    iconName: 'tablerMoodSmile',
    bgcolor: 'success',
    route: '/',
    chip: true,
    chipClass: 'b-1 border-primary text-primary',
    chipContent: 'outlined',
  },
  {
    displayName: 'External Link',
    iconName: 'tablerStar',
    bgcolor: 'error',
    route: 'https://www.google.com/',
    external: true,
  },
  {
    displayName: 'Invoice',
    iconName: 'tablerReceipt',
    bgcolor: 'warning',
    route: '/apps/invoice',
  },
  {
    displayName: 'Document',
    iconName: 'tablerFileDescription',
    bgcolor: 'accent',
    route: 'apps/document',
  },
  {
    displayName: 'Document Upload',
    iconName: 'tablerUpload',
    bgcolor: 'warning',
    route: 'apps/document-upload',
  },
  {
    displayName: 'EIN Filing',
    iconName: 'tablerId', // or 'tablerIdBadge2'
    bgcolor: 'accent',
    route: 'apps/ein-details-list',
  },
  {
    displayName: 'Forum',
    iconName: 'tablerEdit',
    bgcolor: 'accent',
    route: 'apps/forum',
  },
  {
  displayName: 'Taskboard',
  iconName: 'tablerListCheck', // good option for tasks (or use 'tablerChecklist', 'tablerClipboardList')
  bgcolor: 'primary',
  route: 'apps/tasks',
},
{
    displayName: 'Company Details',
    iconName: 'tablerTicket',
    bgcolor: 'error',
    route: 'apps/companyDetails',
  },
  {
  displayName: 'Business Hub',
  iconName: 'tablerBuildingStore',
  bgcolor: 'error',
  route: 'apps/business-hub',
}
];
