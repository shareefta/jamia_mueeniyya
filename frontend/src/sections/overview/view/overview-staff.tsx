import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { getProducts } from 'src/api/products';
import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function StaffOverviewAnalyticsView() {
  const [activeProductCount, setActiveProductCount] = useState<number>(0);

  const fetchProductCount = async () => {
      try {
        const response = await getProducts();
        const activeCount = response.data.filter((p) => p.active).length;
        setActiveProductCount(activeCount);

      } catch (error) {
        console.error('Failed to fetch product count:', error);
      }
    };
  
    useEffect(() => {
      fetchProductCount();
    }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Receipts"
            percent={2.6}
            total={500}
            icon={<img alt="Total Receipts" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Payments"
            percent={-0.1}
            total={50}
            color="secondary"
            icon={<img alt="Total Payments" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Students"
            percent={2.8}
            total={activeProductCount}
            color="warning"
            icon={<img alt="Total Students" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Staff"
            percent={3.6}
            total={234}
            color="error"
            icon={<img alt="Total Staff" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Total Receipts"
            chart={{
              series: [
                { label: 'Ajmer', value: 6500 },
                { label: 'Karnataka', value: 4500 },
                { label: 'Chennai', value: 1500 },
              ],
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Total Payments"
            chart={{
              series: [
                { label: 'Ajmer', value: 6500 },
                { label: 'Karnataka', value: 4500 },
                { label: 'Chennai', value: 1500 },
              ],
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Total Students"
            chart={{
              series: [
                { label: 'Ajmer', value: 300 },
                { label: 'Karnataka', value: 300 },
                { label: 'Chennai', value: 200 },
                { label: 'Online', value: 400 },
              ],
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}