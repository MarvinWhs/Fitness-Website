/* Autor: Niklas Lobo */

import { Entity } from './entity';

export interface User extends Entity {
  username: string;
  password: string;
  email: string;
}
