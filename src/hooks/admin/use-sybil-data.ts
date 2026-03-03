/**
 * Hook for managing sybil detection page state and API interactions.
 * @see specs/prd-web.md Section P2.10
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getSybilClusters,
  getSybilClusterDetail,
  updateSybilClusterStatus,
  getTrustGraphStatus,
  recomputeTrustGraph,
  getBehavioralFlags,
  updateBehavioralFlag,
} from '@/lib/api/client'
import type {
  SybilCluster,
  SybilClusterDetail,
  SybilClusterStatus,
  TrustGraphStatus,
  BehavioralFlag,
} from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function useSybilData() {
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const [clusters, setClusters] = useState<SybilCluster[]>([])
  const [graphStatus, setGraphStatus] = useState<TrustGraphStatus | null>(null)
  const [flags, setFlags] = useState<BehavioralFlag[]>([])
  const [selectedDetail, setSelectedDetail] = useState<SybilClusterDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [recomputing, setRecomputing] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const fetchData = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const token = getAccessToken() ?? ''
      const [clustersRes, statusRes, flagsRes] = await Promise.all([
        getSybilClusters(token),
        getTrustGraphStatus(token),
        getBehavioralFlags(token),
      ])
      setClusters(clustersRes.clusters)
      setGraphStatus(statusRes)
      setFlags(flagsRes.flags)
    } catch {
      setLoadError('Failed to load sybil detection data. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filteredClusters =
    statusFilter === 'all' ? clusters : clusters.filter((c) => c.status === statusFilter)

  const handleViewDetail = async (id: number) => {
    setActionError(null)
    try {
      const detail = await getSybilClusterDetail(id, getAccessToken() ?? '')
      setSelectedDetail(detail)
    } catch {
      setActionError('Failed to load cluster details.')
    }
  }

  const handleClusterAction = (status: SybilClusterStatus) => {
    if (!selectedDetail) return
    const actionLabel = status === 'banned' ? 'ban' : status === 'dismissed' ? 'dismiss' : status
    setConfirmAction({
      title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} cluster`,
      message: `Are you sure you want to ${actionLabel} this cluster with ${selectedDetail.memberCount} members?`,
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          const updated = await updateSybilClusterStatus(
            selectedDetail.id,
            status,
            getAccessToken() ?? ''
          )
          setClusters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
          setSelectedDetail({ ...selectedDetail, ...updated })
          toast({ title: 'Cluster status updated' })
        } catch {
          setActionError('Failed to update cluster status.')
        }
      },
    })
  }

  const handleRecompute = async () => {
    setRecomputing(true)
    try {
      await recomputeTrustGraph(getAccessToken() ?? '')
      toast({ title: 'Trust graph recomputation started' })
    } catch {
      setActionError('Failed to start recomputation.')
    } finally {
      setRecomputing(false)
    }
  }

  const handleDismissFlag = async (id: number) => {
    setActionError(null)
    try {
      const updated = await updateBehavioralFlag(id, 'dismissed', getAccessToken() ?? '')
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      toast({ title: 'Flag dismissed' })
    } catch {
      setActionError('Failed to dismiss flag.')
    }
  }

  return {
    clusters: filteredClusters,
    graphStatus,
    flags,
    selectedDetail,
    setSelectedDetail,
    statusFilter,
    setStatusFilter,
    loading,
    loadError,
    actionError,
    setActionError,
    recomputing,
    confirmAction,
    setConfirmAction,
    fetchData,
    handleViewDetail,
    handleClusterAction,
    handleRecompute,
    handleDismissFlag,
  }
}
