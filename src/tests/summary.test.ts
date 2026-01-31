import { describe, it, expect } from 'vitest';

describe('Transaction Summary Logic', () => {
  it('should calculate balance correctly', () => {
    const income = 136998;
    const expense = 244;
    const balance = income - expense;
    
    expect(balance).toBe(136754);
  });

  it('should parse string totals from database', () => {
    const dbResult = [
      { type: 'expense', total: '136998', count: '4' },
      { type: 'income', total: '244', count: '2' },
    ];

    const income = dbResult.find(r => r.type === 'income');
    const expense = dbResult.find(r => r.type === 'expense');

    const totalIncome = parseFloat(income?.total || '0');
    const totalExpense = parseFloat(expense?.total || '0');

    expect(totalIncome).toBe(244);
    expect(totalExpense).toBe(136998);
  });

  it('should handle empty results', () => {
    const dbResult: { type: string; total: string; count: string }[] = [];

    const income = dbResult.find(r => r.type === 'income');
    const expense = dbResult.find(r => r.type === 'expense');

    const totalIncome = parseFloat(income?.total || '0');
    const totalExpense = parseFloat(expense?.total || '0');
    const balance = totalIncome - totalExpense;

    expect(totalIncome).toBe(0);
    expect(totalExpense).toBe(0);
    expect(balance).toBe(0);
  });

  it('should format currency correctly', () => {
    const amount = 136998;
    const formatted = amount.toLocaleString('id-ID');
    
    expect(formatted).toBe('136.998');
  });
});
