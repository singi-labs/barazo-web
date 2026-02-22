/**
 * ModerationThresholdsTab - Form for editing moderation threshold settings.
 * Auto-block, warn, rate limits, anti-spam, burst detection.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState } from 'react'
import type { ModerationThresholds } from '@/lib/api/types'

interface ModerationThresholdsTabProps {
  thresholds: ModerationThresholds
  onSave: (updated: Partial<ModerationThresholds>) => void
}

export function ModerationThresholdsTab({ thresholds, onSave }: ModerationThresholdsTabProps) {
  const [values, setValues] = useState(thresholds)

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label htmlFor="threshold-autoblock" className="block text-sm font-medium text-foreground">
          Auto-block report count
        </label>
        <input
          id="threshold-autoblock"
          type="number"
          min={1}
          value={values.autoBlockReportCount}
          onChange={(e) =>
            setValues({ ...values, autoBlockReportCount: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-warn" className="block text-sm font-medium text-foreground">
          Warn threshold
        </label>
        <input
          id="threshold-warn"
          type="number"
          min={1}
          value={values.warnThreshold}
          onChange={(e) =>
            setValues({ ...values, warnThreshold: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-fpq" className="block text-sm font-medium text-foreground">
          First-post queue count (0 to disable)
        </label>
        <input
          id="threshold-fpq"
          type="number"
          min={0}
          value={values.firstPostQueueCount}
          onChange={(e) =>
            setValues({ ...values, firstPostQueueCount: parseInt(e.target.value, 10) || 0 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="threshold-ratelimit" className="block text-sm font-medium text-foreground">
          New account rate limit (writes/min)
        </label>
        <input
          id="threshold-ratelimit"
          type="number"
          min={1}
          value={values.newAccountRateLimit}
          onChange={(e) =>
            setValues({ ...values, newAccountRateLimit: parseInt(e.target.value, 10) || 1 })
          }
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Anti-spam settings</legend>
        <div className="flex items-center gap-2">
          <input
            id="threshold-linkhold"
            type="checkbox"
            checked={values.linkPostingHold}
            onChange={(e) => setValues({ ...values, linkPostingHold: e.target.checked })}
            className="rounded border-border"
          />
          <label htmlFor="threshold-linkhold" className="text-sm text-foreground">
            Hold posts with links from new accounts for review
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="threshold-topicdelay"
            type="checkbox"
            checked={values.topicCreationDelay}
            onChange={(e) => setValues({ ...values, topicCreationDelay: e.target.checked })}
            className="rounded border-border"
          />
          <label htmlFor="threshold-topicdelay" className="text-sm text-foreground">
            Delay topic creation for new accounts
          </label>
        </div>
      </fieldset>
      <div className="flex gap-4">
        <div>
          <label
            htmlFor="threshold-burstcount"
            className="block text-sm font-medium text-foreground"
          >
            Burst detection: posts
          </label>
          <input
            id="threshold-burstcount"
            type="number"
            min={1}
            value={values.burstDetectionPostCount}
            onChange={(e) =>
              setValues({
                ...values,
                burstDetectionPostCount: parseInt(e.target.value, 10) || 1,
              })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label htmlFor="threshold-burstmin" className="block text-sm font-medium text-foreground">
            in minutes
          </label>
          <input
            id="threshold-burstmin"
            type="number"
            min={1}
            value={values.burstDetectionMinutes}
            onChange={(e) =>
              setValues({
                ...values,
                burstDetectionMinutes: parseInt(e.target.value, 10) || 1,
              })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSave(values)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Save Thresholds
      </button>
    </div>
  )
}
