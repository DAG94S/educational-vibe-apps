import { describe, it, expect } from 'vitest';
import { executeQuery, database } from './sqlEngine';

describe('SQL Engine', () => {
  it('should return all rows for a simple SELECT *', () => {
    const result = executeQuery('SELECT * FROM suspects');
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(database.suspects.length);
    expect(result.data?.[0]).toHaveProperty('name');
  });

  it('should parse column names correctly', () => {
    const result = executeQuery('SELECT name, hacker_alias FROM suspects');
    expect(result.error).toBeNull();
    expect(result.data?.[0]).toHaveProperty('name');
    expect(result.data?.[0]).toHaveProperty('hacker_alias');
    expect(result.data?.[0]).not.toHaveProperty('id');
  });

  it('should filter rows with WHERE clause', () => {
    const result = executeQuery("SELECT * FROM suspects WHERE gang_id = 'G1'");
    expect(result.error).toBeNull();
    expect(result.data?.every(row => row.gang_id === 'G1')).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  it('should perform a JOIN between suspects and gangs', () => {
    const result = executeQuery('SELECT suspects.name, gangs.name as gang_name FROM suspects JOIN gangs ON suspects.gang_id = gangs.id');
    expect(result.error).toBeNull();
    expect(result.data?.[0]).toHaveProperty('name');
    expect(result.data?.[0]).toHaveProperty('gang_name');
  });

  it('should return an error for invalid syntax', () => {
    const result = executeQuery('SELECT * FROMM suspects');
    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
  });

  it('should return an error for non-existent tables', () => {
    const result = executeQuery('SELECT * FROM aliens');
    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
  });
});
