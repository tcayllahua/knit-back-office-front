import { useQuery } from '@tanstack/react-query'
import { supabase } from '../config/supabase'
import logger from '../utils/logger'

const handleQueryError = (queryName, error) => {
  logger.error('Queries', `Error en ${queryName}: ${error.message}`, error)
  throw error
}

export const useGetMachines = (filterByUserId = null, showDeleted = false) => {
  return useQuery({
    queryKey: ['machines', filterByUserId, showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('machine_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('created_at', { ascending: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
      }
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetMachine = (id) => {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_parameters')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetUserProfile = (userId) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(name)')
        .eq('id_auth', userId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetMachineStats = () => {
  return useQuery({
    queryKey: ['machine-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_parameters')
        .select('maintenance_status, is_primary')
      if (error) throw error

      const normalizedStatus = data.map((m) => (m.maintenance_status || '').toLowerCase())

      return {
        total: data.length,
        primarias: data.filter((m) => m.is_primary).length,
        mantenimiento: normalizedStatus.filter((s) => s === 'mantenimiento').length,
        operativas: normalizedStatus.filter((s) => s === 'operativa').length,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetGarmentParameters = (filterByUserId = null, showDeleted = false) => {
  return useQuery({
    queryKey: ['garment-parameters', filterByUserId, showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('garment_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('garment_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
      }
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetGarmentParameter = (id) => {
  return useQuery({
    queryKey: ['garment-parameter', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garment_parameters')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetKnittingParameters = (filterByUserId = null, showDeleted = false) => {
  return useQuery({
    queryKey: ['knitting-parameters', filterByUserId, showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('knitting_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('parameter_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
      }
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetKnittingParameter = (id) => {
  return useQuery({
    queryKey: ['knitting-parameter', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knitting_parameters')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetMaterialParameters = (filterByUserId = null, showDeleted = false) => {
  return useQuery({
    queryKey: ['material-parameters', filterByUserId, showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('material_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('material_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
      }
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetMaterialParameter = (id) => {
  return useQuery({
    queryKey: ['material-parameter', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_parameters')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetThreads = (showDeleted = false) => {
  return useQuery({
    queryKey: ['threads', showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('threads')
        .select('*')
        .order('thread_name', { ascending: true })
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetThread = (id) => {
  return useQuery({
    queryKey: ['thread', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetProviders = (showDeleted = false) => {
  return useQuery({
    queryKey: ['providers', showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select('*')
        .order('business_name', { ascending: true })
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetProvider = (id) => {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetHqpdsConfigurations = (filterByUserId = null, showDeleted = false) => {
  return useQuery({
    queryKey: ['hqpds-configurations', filterByUserId, showDeleted],
    queryFn: async () => {
      let query = supabase
        .from('hqpds_configurations')
        .select('*')
        .order('creation_date', { ascending: false })
      if (filterByUserId) {
        query = query.eq('id_auth', filterByUserId)
      }
      if (!showDeleted) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetRecentHqpdsConfigurations = (limit = 8, filterByUserId = null) => {
  return useQuery({
    queryKey: ['hqpds-configurations-recent', limit, filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('hqpds_configurations')
        .select('id, design_name, garment_type, image_file_design, last_modified_date, updated_at')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(limit)
      if (filterByUserId) {
        query = query.eq('id_auth', filterByUserId)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetHqpdsConfiguration = (id) => {
  return useQuery({
    queryKey: ['hqpds-configuration', String(id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hqpds_configurations')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetNextHqpdsConfigurationId = (enabled = true) => {
  return useQuery({
    queryKey: ['hqpds-configurations-next-id'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hqpds_configurations')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code === 'PGRST116') return 1
      if (error) throw error
      return (data?.id ?? 0) + 1
    },
    enabled,
    staleTime: 0,
  })
}

// =============================================
// RBAC Queries
// =============================================

export const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetRole = (id) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*, role_form(*, forms(*))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useGetForms = () => {
  return useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetUserPermissions = (userId) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('role_id, roles(name, role_form(can_view, can_create, can_edit, can_delete, forms(name, route, icon, sort_order, is_active)))')
        .eq('id_auth', userId)
        .single()
      if (error) throw error

      const role = data?.roles
      if (!role) return { roleName: null, permissions: [] }

      const permissions = (role.role_form || [])
        .filter((rf) => rf.forms?.is_active)
        .map((rf) => ({
          route: rf.forms.route,
          name: rf.forms.name,
          icon: rf.forms.icon,
          sort_order: rf.forms.sort_order,
          can_view: rf.can_view,
          can_create: rf.can_create,
          can_edit: rf.can_edit,
          can_delete: rf.can_delete,
        }))
        .sort((a, b) => a.sort_order - b.sort_order)

      return { roleName: role.name, permissions }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(name)')
        .order('first_name', { ascending: true })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
