// auth-context.ts
import { createContext } from '@lit/context';

export interface AuthState {
  isAuthenticated: boolean;
  user?: unknown;
}

export const authContext = createContext<AuthState>({
  isAuthenticated: false
});
