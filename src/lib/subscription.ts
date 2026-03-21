import { isAdmin } from '@/lib/isAdmin';

export function hasAccess(user: { isPaid?: boolean | null, createdAt?: Date | null, email?: string | null }): boolean {
  if (isAdmin(user.email)) return true;
  if (user.isPaid) return true;
  
  if (user.createdAt) {
    // 1-day free trial logic
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return user.createdAt > oneDayAgo;
  }
  
  return false;
}
