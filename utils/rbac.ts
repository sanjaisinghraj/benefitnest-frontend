export function hasRole(session: any, role: string): boolean {
  if (!session || !session.user || !session.user.roles) return false;
  return session.user.roles.includes(role);
}
