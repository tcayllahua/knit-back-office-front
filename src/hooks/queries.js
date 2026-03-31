import { useQuery } from '@tanstack/react-query'
import { supabase } from '../config/supabase'

export const useGetMachines = () => {
  return useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_parameters')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        .select('*')
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

export const useGetGarmentParameters = () => {
  return useQuery({
    queryKey: ['garment-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garment_parameters')
        .select('*')
        .order('garment_order', { ascending: true, nullsFirst: false })
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

export const useGetKnittingParameters = () => {
  return useQuery({
    queryKey: ['knitting-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knitting_parameters')
        .select('*')
        .order('parameter_order', { ascending: true, nullsFirst: false })
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

export const useGetMaterialParameters = () => {
  return useQuery({
    queryKey: ['material-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_parameters')
        .select('*')
        .order('material_order', { ascending: true, nullsFirst: false })
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

export const useGetHqpdsConfigurations = () => {
  return useQuery({
    queryKey: ['hqpds-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hqpds_configurations')
        .select('*')
        .order('creation_date', { ascending: false })
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
