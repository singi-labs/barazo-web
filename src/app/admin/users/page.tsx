/**
 * Admin user management page.
 * URL: /admin/users
 * User list with ban controls and cross-community ban warnings.
 * Backend endpoint not yet implemented (planned for P3.2).
 * @see specs/prd-web.md Section M11
 */

import { Users } from '@phosphor-icons/react/dist/ssr'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">User management</h1>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-foreground">Coming in P3</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            User management (search, role assignment, ban controls) is planned for the P3.2
            milestone. The admin API endpoint is not yet available.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
