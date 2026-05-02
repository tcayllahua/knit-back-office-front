import { useQuery } from '@tanstack/react-query'
import { supabase } from '../config/supabase'

export const useGetMachines = (filterByUserId = null) => {
  return useQuery({
    queryKey: ['machines', filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('machine_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('created_at', { ascending: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
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
        .from('usuarios')
        .select('*, roles(nombre)')
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

export const useGetGarmentParameters = (filterByUserId = null) => {
  return useQuery({
    queryKey: ['garment-parameters', filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('garment_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('garment_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
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

export const useGetKnittingParameters = (filterByUserId = null) => {
  return useQuery({
    queryKey: ['knitting-parameters', filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('knitting_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('parameter_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
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

export const useGetMaterialParameters = (filterByUserId = null) => {
  return useQuery({
    queryKey: ['material-parameters', filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('material_parameters')
        .select(filterByUserId ? '*, hqpds_configurations!inner(id_auth)' : '*')
        .order('material_order', { ascending: true, nullsFirst: false })
      if (filterByUserId) {
        query = query.eq('hqpds_configurations.id_auth', filterByUserId)
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

export const useGetThreads = () => {
  return useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hilos')
        .select('*')
        .order('nombre_hilo', { ascending: true })
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
        .from('hilos')
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

export const useGetProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('razon_social', { ascending: true })
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
        .from('proveedores')
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

export const useGetHqpdsConfigurations = (filterByUserId = null) => {
  return useQuery({
    queryKey: ['hqpds-configurations', filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('hqpds_configurations')
        .select('*')
        .order('creation_date', { ascending: false })
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

export const useGetRecentHqpdsConfigurations = (limit = 8, filterByUserId = null) => {
  return useQuery({
    queryKey: ['hqpds-configurations-recent', limit, filterByUserId],
    queryFn: async () => {
      let query = supabase
        .from('hqpds_configurations')
        .select('id, design_name, garment_type, image_file_design, last_modified_date, updated_at')
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
        .order('nombre', { ascending: true })
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
        .select('*, rol_formulario(*, formularios(*))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useGetFormularios = () => {
  return useQuery({
    queryKey: ['formularios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formularios')
        .select('*')
        .order('orden', { ascending: true })
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
        .from('usuarios')
        .select('rol_id, roles(nombre, rol_formulario(puede_ver, puede_crear, puede_editar, puede_eliminar, formularios(nombre, ruta, icono, orden, is_active)))')
        .eq('id_auth', userId)
        .single()
      if (error) throw error

      const role = data?.roles
      if (!role) return { roleName: null, permissions: [] }

      const permissions = (role.rol_formulario || [])
        .filter((rf) => rf.formularios?.is_active)
        .map((rf) => ({
          ruta: rf.formularios.ruta,
          nombre: rf.formularios.nombre,
          icono: rf.formularios.icono,
          orden: rf.formularios.orden,
          puede_ver: rf.puede_ver,
          puede_crear: rf.puede_crear,
          puede_editar: rf.puede_editar,
          puede_eliminar: rf.puede_eliminar,
        }))
        .sort((a, b) => a.orden - b.orden)

      return { roleName: role.nombre, permissions }
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
        .from('usuarios')
        .select('*, roles(nombre)')
        .order('nombre', { ascending: true })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
