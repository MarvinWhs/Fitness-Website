import { Entity } from './entity.js';

export interface Food extends Entity {
  name: string;
  calories: number;
  description: string;
}
