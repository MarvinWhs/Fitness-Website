/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { v4 as uuidv4 } from 'uuid';
import { Client } from 'pg';
import { Entity } from './entity.js';
import { GenericDAO } from './generic.dao.js';

export class PsqlGenericDAO<T extends Entity> implements GenericDAO<T> {
  constructor(
    private db: Client,
    private table: string
  ) {}

  public async create(partEntity: Omit<T, keyof Entity>) {
    const entity = { ...partEntity, id: uuidv4(), createdAt: new Date().getTime() };

    const propertyNames = getPropertyNames(entity);
    const columnNames = propertyNames.map(prop => toColumnName(prop));
    const columnValues = propertyNames.map(propertyName => {
      return toColumnValue(entity[propertyName as keyof typeof entity]);
    });
    const stmt =
      'INSERT INTO ' + this.table + '(' + columnNames.join(',') + ')' + ' VALUES(' + columnValues.join(', ') + ')';

    await this.db.query(stmt);
    return entity as T;
  }

  public async findAll(entityFilter?: Partial<T>) {
    const query = 'SELECT * FROM ' + this.table + ' ' + createWhereClause(entityFilter) + ' ORDER BY "createdAt" DESC';
    const result = await this.db.query(query);
    return result.rows as T[];
  }

  public async findOne(entityFilter: Partial<T>) {
    const query = 'SELECT * FROM ' + this.table + ' ' + createWhereClause(entityFilter) + ' LIMIT 1';
    const result = await this.db.query(query);
    return result && result.rows ? (result.rows[0] as T) : null;
  }

  public async update(entity: Partial<T> & Pick<Entity, 'id'>) {
    const query = 'UPDATE ' + this.table + ' ' + createSetClause(entity) + ' WHERE id = ' + toColumnValue(entity.id);
    await this.db.query(query);
    return true;
  }

  public async delete(id: string) {
    const query = 'DELETE FROM ' + this.table + ' WHERE id = ' + toColumnValue(id);
    await this.db.query(query);
    return true;
  }

  public async deleteAll(entityFilter?: Partial<T>) {
    const query = 'DELETE FROM ' + this.table + ' ' + createWhereClause(entityFilter);
    const result = await this.db.query(query);
    return result.rowCount || 0;
  }
}

function getPropertyNames<T extends Entity>(entity: Partial<T>) {
  return Object.getOwnPropertyNames(entity) as Array<Extract<keyof T, string>>;
}

function toColumnName(propertyName: string) {
  return '"' + propertyName + '"';
}

function toColumnValue(value: unknown) {
  if (typeof value === 'string') {
    return `'` + value + `'`;
  } else {
    return value;
  }
}

function createWhereClause<T extends Entity>(entityFilter?: Partial<T>) {
  if (!entityFilter || !Object.getOwnPropertyNames(entityFilter).length) {
    return '';
  }
  const parts = getPropertyNames(entityFilter).map(propertyName => {
    const propertyValue = entityFilter[propertyName];
    return toColumnName(propertyName) + ' = ' + toColumnValue(propertyValue);
  });
  return 'WHERE ' + parts.join(' AND ');
}

function createSetClause<T extends Entity>(entityFilter: Partial<T>) {
  const parts = getPropertyNames(entityFilter).map(propertyName => {
    const propertyValue = entityFilter[propertyName];
    return toColumnName(propertyName) + ' = ' + toColumnValue(propertyValue);
  });
  return 'SET ' + parts.join(', ');
}
