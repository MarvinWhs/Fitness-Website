/* Autor: Lucas Berlage */

import { Entity } from './entity.js';

export interface Food extends Entity {
  name: string;
  calories: number;
  description: string;
  quantity: number;
  userId?: string;
}
