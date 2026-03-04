/**
 * Admin plugin management page.
 * URL: /admin/plugins
 * Lists installed plugins with enable/disable, settings, and uninstall controls.
 * Backend endpoints not yet implemented (planned for P3.2).
 * @see specs/prd-web.md Section M13
 */

import { PuzzlePiece } from '@phosphor-icons/react/dist/ssr'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminPluginsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Plugins</h1>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <PuzzlePiece className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-foreground">Coming in P3</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Plugin management (install, enable/disable, configure) is planned for the P3.2
            milestone. The plugin API endpoints are not yet available.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
