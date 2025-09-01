import { ILoadOptionsFunctions } from 'n8n-workflow';

export async function loadCustomers(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Customer', value: 'customer_1' }];
}

export async function loadSuppliers(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Supplier', value: 'supplier_1' }];
}

export async function loadProducts(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Product', value: 'product_1' }];
}

export async function loadCategories(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Category', value: 'category_1' }];
}

export async function loadTemplates(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Template', value: 'template_1' }];
}

export async function loadLedgerAccounts(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Account', value: 'account_1' }];
}

export async function loadBankAccounts(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Bank Account', value: 'bank_1' }];
}

export async function loadJournals(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Journal', value: 'journal_1' }];
}

export async function loadFiscalYears(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample Fiscal Year', value: 'fy_1' }];
}

export async function loadUsers(): Promise<{ name: string; value: string }[]> {
  return [{ name: 'Sample User', value: 'user_1' }];
}