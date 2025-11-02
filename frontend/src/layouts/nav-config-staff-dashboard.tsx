import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type StaffNavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const StaffNavData = [
  {
    title: 'Cash Books',
    path: '/staff',
    icon: icon('ic-books'),
  },
];
