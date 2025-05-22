'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function CompletePage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 16 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: 2,
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 80,
            color: 'success.main',
            mb: 3,
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'success.main',
          }}
        >
          請求書のPDFを作成しました！
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          請求書の作成が完了しました。
          ダウンロードしたPDFをご確認ください。
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
            sx={{ minWidth: 200 }}
          >
            ホームへ戻る
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => router.push('/create')}
            sx={{ minWidth: 200 }}
          >
            もう一枚作る
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 