/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Db, Filter } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Entity } from './entity.js';
import { GenericDAO } from './generic.dao.js';

export class MongoGenericDAO<T extends Entity> implements GenericDAO<T> {
  constructor(
    private db: Db,
    private collection: string
  ) {}

  public async create(partEntity: Omit<T, keyof Entity>) {
    const entity = { ...partEntity, id: uuidv4(), createdAt: new Date().getTime() };
    await this.db.collection(this.collection).insertOne(entity);
    return entity as T;
  }

  public async findAll(entityFilter?: Partial<T>) {
    return this.db
      .collection<T>(this.collection)
      .find((entityFilter as Filter<T>) ?? {})
      .sort({ createdAt: -1 })
      .toArray() as Promise<T[]>;
  }

  public async findOne(entityFilter: Partial<T>) {
    return this.db.collection<T>(this.collection).findOne(entityFilter as Filter<T>) as Promise<T | null>;
  }

  public async update(entity: Partial<T> & Pick<Entity, 'id'>) {
    const result = await this.db.collection(this.collection).updateOne({ id: entity.id }, { $set: entity });
    return !!result.modifiedCount;
  }

  public async delete(id: string) {
    const result = await this.db.collection(this.collection).deleteOne({ id });
    return !!result.deletedCount;
  }

  public async deleteAll(entityFilter?: Partial<T>) {
    if (!entityFilter) {
      await this.db.collection(this.collection).drop();
      return -1;
    } else {
      const result = await this.db.collection(this.collection).deleteMany(entityFilter);
      return result.deletedCount || 0;
    }
  }
}
