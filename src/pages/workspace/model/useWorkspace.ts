import { useCallback, useState } from 'react'
import type { Profile } from '../../../shared/api/database.types'
import { useWorkspaceActions } from './useWorkspaceActions'
import { useWorkspaceData } from './useWorkspaceData'
import { useWorkspaceForm } from './useWorkspaceForm'
import type { WorkspaceController } from './workspaceTypes'

export type { WorkspaceDialogKind, WorkspaceFormValues } from './workspaceTypes'
export type { WorkspaceController } from './workspaceTypes'

export function useWorkspace(profile: Profile | null): WorkspaceController {
  const [busy, setBusy] = useState(false)
  const [notice, setNoticeState] = useState('')
  const [filter, setFilter] = useState<WorkspaceController['filter']>('all')
  const setNotice = useCallback((message: string) => setNoticeState(message), [])
  const data = useWorkspaceData(profile, setNotice)
  const form = useWorkspaceForm(setNotice, data.refreshData, setBusy)
  const actions = useWorkspaceActions({
    busy,
    setBusy,
    setNotice,
    refreshData: data.refreshData,
    openReworkDialog: form.openReworkDialog,
  })

  return {
    ...data,
    ...form,
    ...actions,
    busy,
    notice,
    filter,
    setNotice,
    setFilter,
    submitForm: (event) => form.submitForm(event, busy),
  }
}
