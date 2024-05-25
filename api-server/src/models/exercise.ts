import { Entity } from './entity.js';

export interface Exercise extends Entity {
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  image?: string;
}
