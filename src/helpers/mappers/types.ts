// Common types used across Pennylane API
export interface PennylaneBaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PennylaneAddress {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface PennylaneContact {
  email?: string;
  phone?: string;
  mobile?: string;
}

// Customer types
export interface PennylaneCustomer extends PennylaneBaseEntity {
  name?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  address?: PennylaneAddress;
  contact?: PennylaneContact;
  vat_number?: string;
  siret?: string;
  status: 'active' | 'inactive';
  customer_type: 'individual' | 'company';
}

// Supplier types
export interface PennylaneSupplier extends PennylaneBaseEntity {
  name?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  address?: PennylaneAddress;
  contact?: PennylaneContact;
  vat_number?: string;
  siret?: string;
  status: 'active' | 'inactive';
  supplier_type: 'individual' | 'company';
}

// Product types
export interface PennylaneProduct extends PennylaneBaseEntity {
  name: string;
  description?: string;
  unit_price: number;
  unit: string;
  vat_rate: number;
  category_id?: string;
  status: 'active' | 'inactive';
}

// Invoice line types
export interface PennylaneInvoiceLine {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  total_excl_tax: number;
  total_incl_tax: number;
  category_id?: string;
}

// Customer Invoice types
export interface PennylaneCustomerInvoice extends PennylaneBaseEntity {
  number: string;
  customer_id: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_excl_tax: number;
  total_incl_tax: number;
  vat_amount: number;
  currency: string;
  lines: PennylaneInvoiceLine[];
  template_id?: string;
  notes?: string;
  payment_terms?: string;
}

// Supplier Invoice types
export interface PennylaneSupplierInvoice extends PennylaneBaseEntity {
  number: string;
  supplier_id: string;
  issue_date: string;
  due_date: string;
  status: 'pending' | 'validated' | 'paid' | 'overdue';
  total_excl_tax: number;
  total_incl_tax: number;
  vat_amount: number;
  currency: string;
  lines: PennylaneInvoiceLine[];
  notes?: string;
  payment_terms?: string;
}

// Ledger Account types
export interface PennylaneLedgerAccount extends PennylaneBaseEntity {
  name: string;
  number: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  status: 'active' | 'inactive';
}

// Ledger Entry types
export interface PennylaneLedgerEntry extends PennylaneBaseEntity {
  journal_id: string;
  date: string;
  reference: string;
  description: string;
  lines: PennylaneLedgerEntryLine[];
  status: 'draft' | 'posted' | 'cancelled';
}

export interface PennylaneLedgerEntryLine {
  id?: string;
  ledger_account_id: string;
  debit: number;
  credit: number;
  description?: string;
  category_id?: string;
  customer_id?: string;
  supplier_id?: string;
}

// Transaction types
export interface PennylaneTransaction extends PennylaneBaseEntity {
  bank_account_id: string;
  date: string;
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'matched' | 'unmatched';
  matched_invoice_id?: string;
  matched_type?: 'customer' | 'supplier';
}

// Bank Account types
export interface PennylaneBankAccount extends PennylaneBaseEntity {
  name: string;
  iban?: string;
  bic?: string;
  account_number?: string;
  bank_name?: string;
  currency: string;
  status: 'active' | 'inactive';
}

// Category types
export interface PennylaneCategory extends PennylaneBaseEntity {
  name: string;
  group_id?: string;
  color?: string;
  status: 'active' | 'inactive';
}

export interface PennylaneCategoryGroup extends PennylaneBaseEntity {
  name: string;
  color?: string;
  status: 'active' | 'inactive';
}

// Journal types
export interface PennylaneJournal extends PennylaneBaseEntity {
  name: string;
  code: string;
  type: 'general' | 'sales' | 'purchase' | 'bank' | 'cash';
  status: 'active' | 'inactive';
}

// Fiscal Year types
export interface PennylaneFiscalYear extends PennylaneBaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
}

// Template types
export interface PennylaneTemplate extends PennylaneBaseEntity {
  name: string;
  type: 'customer_invoice' | 'quote' | 'commercial_document';
  content: string;
  status: 'active' | 'inactive';
}

// User types
export interface PennylaneUser extends PennylaneBaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: 'active' | 'inactive';
}

// Quote types
export interface PennylaneQuote extends PennylaneBaseEntity {
  number: string;
  customer_id: string;
  issue_date: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  total_excl_tax: number;
  total_incl_tax: number;
  vat_amount: number;
  currency: string;
  lines: PennylaneInvoiceLine[];
  notes?: string;
}

// Commercial Document types
export interface PennylaneCommercialDocument extends PennylaneBaseEntity {
  number: string;
  type: 'order' | 'delivery_note' | 'credit_note';
  customer_id?: string;
  supplier_id?: string;
  date: string;
  status: 'draft' | 'sent' | 'confirmed' | 'cancelled';
  lines: PennylaneInvoiceLine[];
  notes?: string;
}

// Mandate types
export interface PennylaneMandate extends PennylaneBaseEntity {
  customer_id: string;
  bank_account_id: string;
  type: 'sepa' | 'gocardless';
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  reference: string;
  signature_date?: string;
  start_date?: string;
  end_date?: string;
}

// File Attachment types
export interface PennylaneFileAttachment extends PennylaneBaseEntity {
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  url: string;
  entity_type: string;
  entity_id: string;
}

// Changelog types
export interface PennylaneChangelogEntry extends PennylaneBaseEntity {
  entity_type: string;
  entity_id: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, any>;
  user_id?: string;
}

// Export types
export interface PennylaneExport extends PennylaneBaseEntity {
  type: 'agl' | 'fec';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  parameters: Record<string, any>;
}

// Billing Subscription types
export interface PennylaneBillingSubscription extends PennylaneBaseEntity {
  customer_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'suspended';
  start_date: string;
  end_date?: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
}
