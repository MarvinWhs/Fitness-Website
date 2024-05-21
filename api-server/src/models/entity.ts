/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { UUID } from "mongodb";

export interface Entity {
  id: string;
  createdAt: number;
}
