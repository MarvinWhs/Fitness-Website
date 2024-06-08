/* Autor Niklas Lobo */

import { Entity } from './entity.js';

export interface Notes extends Entity {
  name: string;
  date: string;
  content: string;
  userId: string;
}
