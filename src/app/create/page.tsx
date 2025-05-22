'use client';

import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { invoiceFormAtom } from '@/atoms/invoiceFormAtom';
import { invoiceSchema, InvoiceItem } from '@/types/invoice';
import { InvoiceDocument } from '@/components/pdf/InvoiceDocument';

export default function CreateInvoice() {
  const router = useRouter();
  const [invoiceForm, setInvoiceForm] = useAtom(invoiceFormAtom);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | Date) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceForm((prev) => {
      const newItems = [...prev.items];

      // 更新対象の項目を取得
      const targetItem = { ...newItems[index] };

      // フィールドを更新
      if (field === 'description') {
        targetItem.description = String(value);
      } else if (field === 'quantity') {
        targetItem.quantity = Number(value);
      } else if (field === 'unitPrice') {
        targetItem.unitPrice = Number(value);
      }

      // 単価または数量が更新された場合、金額を再計算
      if (field === 'quantity' || field === 'unitPrice') {
        targetItem.amount = targetItem.quantity * targetItem.unitPrice;
      }

      // 更新した項目を配列に反映
      newItems[index] = targetItem;
      
      // 小計と消費税を再計算
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = Math.floor(subtotal * 0.1); // 10%
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total: subtotal + tax,
      };
    });
  };

  const addItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: String(prev.items.length + 1),
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceForm((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = Math.floor(subtotal * 0.1);
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total: subtotal + tax,
      };
    });
  };

  const handleSubmit = async (action: 'preview' | 'pdf') => {
    try {
      const validatedData = invoiceSchema.parse({
        ...invoiceForm,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (action === 'preview') {
        router.push('/preview');
      } else {
        // PDFを生成
        const blob = await pdf(<InvoiceDocument invoice={validatedData} />).toBlob();
        
        // BlobからオブジェクトURLを作成
        const url = URL.createObjectURL(blob);
        
        // aタグを作成してダウンロードを実行
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${validatedData.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // 不要になったオブジェクトを削除
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 完了画面へ遷移
        router.push('/complete');
      }
      
      setErrors({});
    } catch (error: unknown) {
      const formErrors: { [key: string]: string } = {};
      if (error instanceof Error && 'errors' in error) {
        (error as { errors: Array<{ path: string[], message: string }> }).errors.forEach((err) => {
          formErrors[err.path.join('.')] = err.message;
        });
      }
      setErrors(formErrors);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            請求書作成
          </Typography>

          {/* 発行元情報 */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            発行元情報
          </Typography>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="会社名"
                value={invoiceForm.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                error={!!errors['companyName']}
                helperText={errors['companyName']}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="住所"
                value={invoiceForm.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                error={!!errors['companyAddress']}
                helperText={errors['companyAddress']}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={invoiceForm.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                error={!!errors['companyEmail']}
                helperText={errors['companyEmail']}
                required
              />
            </Box>
          </Box>

          {/* 請求先情報 */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            請求先情報
          </Typography>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="会社名"
                value={invoiceForm.clientCompanyName}
                onChange={(e) => handleInputChange('clientCompanyName', e.target.value)}
                error={!!errors['clientCompanyName']}
                helperText={errors['clientCompanyName']}
                required
              />
              <TextField
                fullWidth
                label="担当者名"
                value={invoiceForm.clientContactName}
                onChange={(e) => handleInputChange('clientContactName', e.target.value)}
                error={!!errors['clientContactName']}
                helperText={errors['clientContactName']}
                required
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="住所"
                value={invoiceForm.clientAddress}
                onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                error={!!errors['clientAddress']}
                helperText={errors['clientAddress']}
                required
              />
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={invoiceForm.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                error={!!errors['clientEmail']}
                helperText={errors['clientEmail']}
                required
              />
            </Box>
          </Box>

          {/* 請求書情報 */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            請求書情報
          </Typography>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
              <TextField
                fullWidth
                label="請求書番号"
                value={invoiceForm.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                error={!!errors['invoiceNumber']}
                helperText={errors['invoiceNumber']}
                required
              />
              <Box>
                <DatePicker
                  label="発行日"
                  value={invoiceForm.issueDate}
                  onChange={(date) => handleInputChange('issueDate', date || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Box>
              <Box>
                <DatePicker
                  label="支払期日"
                  value={invoiceForm.dueDate}
                  onChange={(date) => handleInputChange('dueDate', date || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* 明細 */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            明細
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>品目名</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell align="right">単価</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell padding="checkbox"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceForm.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        error={!!errors[`items.${index}.description`]}
                        helperText={errors[`items.${index}.description`]}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        error={!!errors[`items.${index}.quantity`]}
                        helperText={errors[`items.${index}.quantity`]}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        error={!!errors[`items.${index}.unitPrice`]}
                        helperText={errors[`items.${index}.unitPrice`]}
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell padding="checkbox">
                      <IconButton
                        onClick={() => removeItem(index)}
                        disabled={invoiceForm.items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            sx={{ mt: 2 }}
          >
            行を追加
          </Button>

          {/* 合計金額 */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1">
                小計: {invoiceForm.subtotal.toLocaleString()}円
              </Typography>
              <Typography variant="subtitle1">
                消費税（10%）: {invoiceForm.tax.toLocaleString()}円
              </Typography>
              <Typography variant="h6">
                合計: {invoiceForm.total.toLocaleString()}円
              </Typography>
            </Box>
          </Box>

          {/* 備考 */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            備考
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={invoiceForm.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />

          {/* ボタン */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit('preview')}
            >
              プレビューへ
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleSubmit('pdf')}
            >
              PDF作成
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
} 