import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { createTransport } from './transport';

export async function loadCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/customers',
    });
    return response.data.map((customer: any) => ({
      name: customer.name,
      value: customer.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadSuppliers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/suppliers',
    });
    return response.data.map((supplier: any) => ({
      name: supplier.name,
      value: supplier.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadProducts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/products',
    });
    return response.data.map((product: any) => ({
      name: product.label,
      value: product.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/categories',
    });
    return response.data.map((category: any) => ({
      name: category.name,
      value: category.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/customer_invoice_templates',
    });
    return response.data.map((template: any) => ({
      name: template.name,
      value: template.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadLedgerAccounts(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/ledger_accounts',
    });
    return response.data.map((account: any) => ({
      name: `${account.number} - ${account.name}`,
      value: account.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadBankAccounts(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/bank_accounts',
    });
    return response.data.map((account: any) => ({
      name: `${account.name} (${account.bank_name})`,
      value: account.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadJournals(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/journals',
    });
    return response.data.map((journal: any) => ({
      name: `${journal.name} (${journal.code})`,
      value: journal.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadFiscalYears(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/fiscal_years',
    });
    return response.data.map((year: any) => ({
      name: `${year.start_date} - ${year.end_date}`,
      value: year.id,
    }));
  } catch (error) {
    return [];
  }
}

export async function loadUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const transport = await createTransport(this, 'pennylaneTokenApi');
    const response = await transport.request({
      method: 'GET',
      url: '/users',
    });
    return response.data.map((user: any) => ({
      name: `${user.first_name} ${user.last_name} (${user.email})`,
      value: user.id,
    }));
  } catch (error) {
    return [];
  }
}
