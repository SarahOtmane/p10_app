import { MyContext } from '../types/context';

export function requireAuth(context: MyContext) {
  const user = context.req.user;
  if (!user) {
    throw new Error("Accès interdit : utilisateur non authentifié.");
  }
  return user;
}

export function requireAdmin(context: MyContext) {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new Error("Accès interdit : rôle administrateur requis.");
  }
  return user;
}
