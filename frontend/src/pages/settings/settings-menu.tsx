import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import CardActionArea from '@mui/material/CardActionArea';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function SettingsMenuPage() {
  const navigate = useNavigate();

  const menus = [
    { title: 'Users', path: 'users', icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { title: 'Campus', path: 'off-campus', icon: <BusinessIcon />, gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' },
    { title: 'Cash Books', path: 'manage-cash-books', icon: <AccountBalanceIcon />, gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { title: 'Categories', path: 'categories', icon: <CategoryIcon />, gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' },
    { title: 'Opening Balances', path: 'opening-balances', icon: <AccountBalanceWalletIcon />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Payment Modes', path: 'payment-modes', icon: <PaymentIcon />, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  ];

  return (
    <Grid container spacing={4} sx={{ mt: 2 }}>
      {menus.map((menu) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={menu.title}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 5,
              background: menu.gradient,
              color: 'white',
              transition: 'all 0.3s',
              '&:hover': { transform: 'scale(1.05)', boxShadow: 8 },
            }}
          >
            <CardActionArea onClick={() => navigate(menu.path)}>
              <CardContent sx={{ height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                  {menu.icon}
                </Avatar>
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                  {menu.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
