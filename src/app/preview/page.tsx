'use client';

import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { pdf } from '@react-pdf/renderer';
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { invoiceFormAtom } from '@/atoms/invoiceFormAtom';
import { InvoiceDocument } from '@/components/pdf/InvoiceDocument';
import type { Invoice } from '@/types/invoice';

export default function InvoicePreview() {
  const router = useRouter();
  const [invoiceForm] = useAtom(invoiceFormAtom);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年M月d日', { locale: ja });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const generatePdf = async () => {
    try {
      // PDFに渡すデータを整形
      const pdfData: Invoice = {
        ...invoiceForm,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // PDFを生成
      const blob = await pdf(<InvoiceDocument invoice={pdfData} />).toBlob();
      
      // BlobからオブジェクトURLを作成
      const url = URL.createObjectURL(blob);
      
      // aタグを作成してダウンロードを実行
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceForm.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // 不要になったオブジェクトを削除
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 完了画面へ遷移
      router.push('/complete');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 6, backgroundColor: '#fff', position: 'relative', minHeight: '29.7cm' }}>
        {/* ヘッダー部分 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
          {/* 発行元情報 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {invoiceForm.companyName}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {invoiceForm.companyAddress}
            </Typography>
            <Typography variant="body2">
              {invoiceForm.companyEmail}
            </Typography>
          </Box>

          {/* 請求先情報 */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" gutterBottom>
              {invoiceForm.clientCompanyName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {`${invoiceForm.clientContactName} 様`}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {invoiceForm.clientAddress}
            </Typography>
            <Typography variant="body2">
              {invoiceForm.clientEmail}
            </Typography>
          </Box>
        </Box>

        {/* メインコンテンツ */}
        <Box sx={{ 
          minHeight: '50vh',
          mb: 15,
        }}>
          {/* 請求書タイトルと基本情報 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              請求書
            </Typography>
            <Typography variant="body1" gutterBottom>
              請求書番号: {invoiceForm.invoiceNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              発行日: {formatDate(invoiceForm.issueDate)}
            </Typography>
            <Typography variant="body1">
              支払期限: {formatDate(invoiceForm.dueDate)}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 明細テーブル */}
          <Box sx={{ 
            maxHeight: 'calc(100vh - 600px)',
            overflow: 'auto',
            mb: 2,
          }}>
            <TableContainer><Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>品目</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell align="right">単価</TableCell>
                  <TableCell align="right">金額</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceForm.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></TableContainer>
          </Box>

          {/* 備考 */}
          {invoiceForm.notes && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                備考
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {invoiceForm.notes}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 合計金額（右下に固定） */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 120,
            right: 48,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#fff',
            pt: 2,
          }}
        >
          <Box sx={{ width: '200px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>小計:</Typography>
              <Typography>{formatCurrency(invoiceForm.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>消費税（10%）:</Typography>
              <Typography>{formatCurrency(invoiceForm.tax)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">合計:</Typography>
              <Typography variant="h6">{formatCurrency(invoiceForm.total)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* ボタン（合計金額の下に固定） */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            px: 6,
            backgroundColor: '#fff',
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/create')}
          >
            編集に戻る
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={generatePdf}
          >
            PDFをダウンロード
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 