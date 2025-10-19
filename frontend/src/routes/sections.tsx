import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { StaffDashboardLayout } from 'src/layouts/dashboard/layout-staff';

import ProtectedRoute from './components/ProtectedRoute';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const StaffDashboardPage = lazy( () => import ('src/pages/dashboard-staff'))
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const CategoryPage = lazy(() => import('src/pages/category'));
export const LocationPage = lazy(() => import('src/pages/location'));
export const PurchasePage = lazy(() => import('src/pages/purchase'));

export const SalesLayout = lazy(() => import('src/sections/sales/sales-layout'));
export const SalesMenuPage = lazy(() => import('src/sections/sales/sales-menu'));
export const SalesPage = lazy(() => import('src/pages/sales'));
export const SalesReportPage = lazy(() => import('src/sections/sales/sales-report'));
export const SalesReturnReport = lazy(() => import('src/sections/sales/sales-return-report'));
export const NewSalesReturnPage = lazy(() => import('src/sections/sales/new-sales-return'));
export const TransactionsPage = lazy(() => import('src/pages/transactions'));
export const TransactionListPage = lazy(() => import('src/pages/transaction-list'));

export const SettingsView = lazy(() => import('src/pages/settings'));
export const SettingsLayout = lazy(() => import('src/pages/settings/settings-layout'));
export const SettingsMenuPage = lazy(() => import('src/pages/settings/settings-menu'));
export const SalesChannelsPage = lazy(() => import('src/pages/settings/sales-channels'));
export const OffCampusPage = lazy(() => import('src/pages/settings/off-campus'));
export const UsersPage = lazy(() => import('src/pages/settings/users'));
export const PaymentModesPage = lazy(() => import('src/pages/settings/payment-modes'));
export const CategoriesPage = lazy(() => import('src/pages/settings/categories'));
export const PurchasedByPage = lazy(() => import('src/pages/settings/purchased-by'));
export const OpeningBalancesPage = lazy(() => import('src/pages/settings/opening-balances'));

export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transaction-list', element: <TransactionListPage /> },
      { path: 'new-sales-return', element: <NewSalesReturnPage /> },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsMenuPage /> },
          { path: 'channels', element: <SalesChannelsPage /> },
          { path: 'off-campus', element: <OffCampusPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'location', element: <LocationPage /> },
          { path: 'payment-modes', element: <PaymentModesPage /> },
          { path: 'opening-balances', element: <OpeningBalancesPage /> },
        ],
      },
      {
        path: 'sales',
        element: <SalesLayout />,
        children: [
          { index: true, element: <SalesMenuPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'sales-report', element: <SalesReportPage /> },
          { path: 'sales-return-report', element: <SalesReturnReport /> },
          { path: 'new-sales-return/:saleId', element: <NewSalesReturnPage /> },
        ],
      },
    ],
  },
  {
    path: 'staff',
    element: (
      <ProtectedRoute>
        <StaffDashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </StaffDashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StaffDashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
