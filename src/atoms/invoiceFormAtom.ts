import { atom } from 'jotai';
import { Invoice, InvoiceItem } from '../types/invoice';

const emptyInvoiceItem: InvoiceItem = {
  id: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
};

export const initialInvoiceForm: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  clientCompanyName: '',
  clientContactName: '',
  clientAddress: '',
  clientEmail: '',
  invoiceNumber: '',
  issueDate: new Date(),
  dueDate: new Date(),
  items: [{ ...emptyInvoiceItem, id: '1' }],
  subtotal: 0,
  tax: 0,
  total: 0,
  notes: '',
};

export const invoiceFormAtom = atom(initialInvoiceForm); 