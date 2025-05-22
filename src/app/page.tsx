'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
          }}
        >
          請求書ジェネレーター
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => router.push('/create')}
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            padding: { xs: '12px 24px', sm: '16px 32px' },
          }}
        >
          新しく作成する
        </Button>
      </Box>
    </Container>
  );
}
