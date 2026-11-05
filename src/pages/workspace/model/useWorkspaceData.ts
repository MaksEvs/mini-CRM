import { useCallback, useEffect, useState } from 'react'
import type { ConstructionObject, Profile, Task } from '../../../shared/api/database.types'
import { fetchWorkspaceData } from '../../../entities/task'
import { getErrorMessage } from '../../../shared/lib/errors'

export function useWorkspaceData(profile: Profile | null, onError: (message: string) => void) {
  const [objects, setObjects] = useState<ConstructionObject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [executors, setExecutors] = useState<Profile[]>([])

  const refreshData = useCallback(async () => {
    if (!profile) return
    try {
      const data = await fetchWorkspaceData(profile)
      setObjects(data.objects)
      setTasks(data.tasks)
      setExecutors(data.executors)
    } catch (error) {
      onError(getErrorMessage(error))
    }
  }, [onError, profile])

  useEffect(() => {
    let active = true
    if (!profile)
      return () => {
        active = false
      }

    void fetchWorkspaceData(profile)
      .then((data) => {
        if (!active) return
        setObjects(data.objects)
        setTasks(data.tasks)
        setExecutors(data.executors)
      })
      .catch((error: unknown) => {
        if (active) onError(getErrorMessage(error))
      })

    return () => {
      active = false
    }
  }, [onError, profile])

  return { objects, tasks, executors, refreshData }
}
