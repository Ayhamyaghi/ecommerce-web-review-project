'use client';

import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/ui/Badge';

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
      <div className="mt-4 rounded-lg border border-gray-200 divide-y">
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">Name</span>
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">Email</span>
          <span className="text-sm font-medium text-gray-900">{user.email}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">Role</span>
          <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>{user.role}</Badge>
        </div>
      </div>
    </div>
  );
}
