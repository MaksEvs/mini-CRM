export type Role = 'manager' | 'executor'
export type TaskStatus = 'new' | 'in_progress' | 'in_review' | 'accepted' | 'rework'

export type Profile = {
  id: string
  full_name: string
  role: Role
  created_at: string
}

export type ConstructionObject = {
  id: string
  name: string
  address: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  object_id: string
  assignee_id: string
  author_id: string
  status: TaskStatus
  created_at: string
  updated_at: string
  object?: ConstructionObject
  assignee?: Profile
  author?: Profile
}

export type TaskHistory = {
  id: string
  task_id: string
  changed_by: string
  from_status: TaskStatus | null
  to_status: TaskStatus
  comment: string | null
  created_at: string
  profile?: Profile
}

type TaskInsert = Pick<Task, 'title' | 'description' | 'object_id' | 'assignee_id'>
type ObjectInsert = Pick<ConstructionObject, 'name' | 'address'>
type ProfileInsert = Pick<Profile, 'id' | 'full_name' | 'role'>
type TaskUpdate = Partial<TaskInsert>
type ObjectUpdate = Partial<ObjectInsert>

export interface Database {
  __InternalSupabase: { PostgrestVersion: '12' }
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
        Relationships: [
          {
            foreignKeyName: 'profiles_pkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      construction_objects: {
        Row: ConstructionObject
        Insert: ObjectInsert
        Update: ObjectUpdate
        Relationships: [
          {
            foreignKeyName: 'construction_objects_pkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'construction_objects'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
        Relationships: [
          {
            foreignKeyName: 'tasks_object_id_fkey'
            columns: ['object_id']
            isOneToOne: false
            referencedRelation: 'construction_objects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_assignee_id_fkey'
            columns: ['assignee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      task_status_history: {
        Row: TaskHistory
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'task_status_history_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_status_history_changed_by_fkey'
            columns: ['changed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      transition_task_status: {
        Args: {
          p_task_id: string
          p_new_status: TaskStatus
          p_comment?: string | null
        }
        Returns: undefined
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
