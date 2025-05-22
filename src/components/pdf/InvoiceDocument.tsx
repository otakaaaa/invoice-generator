import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Invoice } from '@/types/invoice';

// フォントの登録（日本語対応）
Font.register({
  family: 'NotoSansJP',
  src: 'https://fonts.gstatic.com/ea/notosansjp/v5/NotoSansJP-Regular.otf',
});

Font.register({
  family: 'NotoSansJP-Bold',
  src: 'https://fonts.gstatic.com/ea/notosansjp/v5/NotoSansJP-Bold.otf',
});

// スタイルの定義
const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    padding: 40,
    position: 'relative',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  companyInfo: {
    width: '40%',
  },
  clientInfo: {
    width: '40%',
    textAlign: 'right',
  },
  title: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  invoiceInfo: {
    textAlign: 'center',
    marginBottom: 30,
  },
  table: {
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  description: {
    width: '40%',
  },
  quantity: {
    width: '20%',
    textAlign: 'right',
  },
  unitPrice: {
    width: '20%',
    textAlign: 'right',
  },
  amount: {
    width: '20%',
    textAlign: 'right',
  },
  totalsWrapper: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: '100%',
  },
  totals: {
    width: '30%',
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalBorder: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    marginTop: 5,
    paddingTop: 5,
  },
  notes: {
    marginTop: 40,
  },
  notesTitle: {
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 5,
  },
  contentWrapper: {
    flexGrow: 1,
    minHeight: '75%',
  },
});

// 日付フォーマット
const formatDate = (date: Date) => {
  return format(date, 'yyyy年M月d日', { locale: ja });
};

// 金額フォーマット
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP').format(amount);
};

interface Props {
  invoice: Invoice;
}

export const InvoiceDocument = ({ invoice }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        {/* 発行元情報 */}
        <View style={styles.companyInfo}>
          <Text>{invoice.companyName}</Text>
          <Text>{invoice.companyAddress}</Text>
          <Text>{invoice.companyEmail}</Text>
        </View>

        {/* 請求先情報 */}
        <View style={styles.clientInfo}>
          <Text>{invoice.clientCompanyName}</Text>
          <Text>{`${invoice.clientContactName} 様`}</Text>
          <Text>{invoice.clientAddress}</Text>
          <Text>{invoice.clientEmail}</Text>
        </View>
      </View>

      {/* メインコンテンツをラップ */}
      <View style={styles.contentWrapper}>
        {/* 請求書タイトルと基本情報 */}
        <Text style={styles.title}>請求書</Text>
        <View style={styles.invoiceInfo}>
          <Text>{`請求書番号: ${invoice.invoiceNumber}`}</Text>
          <Text>{`発行日: ${formatDate(invoice.issueDate)}`}</Text>
          <Text>{`支払期限: ${formatDate(invoice.dueDate)}`}</Text>
        </View>

        {/* 明細テーブル */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>品目</Text>
            <Text style={styles.quantity}>数量</Text>
            <Text style={styles.unitPrice}>単価</Text>
            <Text style={styles.amount}>金額</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.unitPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* 備考 */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>備考</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </View>

      {/* 合計金額（右下に固定） */}
      <View style={styles.totalsWrapper}>
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>小計:</Text>
            <Text>{formatCurrency(invoice.subtotal)}円</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>消費税（10%）:</Text>
            <Text>{formatCurrency(invoice.tax)}円</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBorder]}>
            <Text>合計:</Text>
            <Text>{formatCurrency(invoice.total)}円</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
); 