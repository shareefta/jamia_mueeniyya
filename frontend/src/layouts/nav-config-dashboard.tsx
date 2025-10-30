import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Transactions',
    path: '/transaction-list',
    icon: icon('ic-transaction'),
  },
  {
    title: 'Cash Books',
    path: '/cash-books',
    icon: icon('ic-books'),
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: icon('ic-settings'),
  },
];
