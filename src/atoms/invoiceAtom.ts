import { atom } from 'jotai';
import { Invoice } from '../types/invoice';

export const invoicesAtom = atom<Invoice[]>([]);

export const currentInvoiceAtom = atom<Invoice | null>(null); 