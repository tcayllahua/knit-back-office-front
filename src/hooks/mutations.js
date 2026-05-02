import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useMachinesStore } from '../store/machinesStore'
import { supabase } from '../config/supabase'
import imageCompression from 'browser-image-compression'

export const useCreateMachineMutation = () => {
  const queryClient = useQueryClient()
  const createMachine = useMachinesStore((state) => state.createMachine)

  return useMutation({
    mutationFn: async ({ machineData }) => {
      return createMachine(machineData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      queryClient.invalidateQueries({ queryKey: ['machine-stats'] })
      toast.success('Máquina creada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el parámetro de máquina')
    },
  })
}

export const useUpdateMachineMutation = () => {
  const queryClient = useQueryClient()
  const updateMachine = useMachinesStore((state) => state.updateMachine)

  return useMutation({
    mutationFn: async ({ id, machineData }) => {
      return updateMachine(id, machineData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      queryClient.invalidateQueries({ queryKey: ['machine-stats'] })
      toast.success('Máquina actualizada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el parámetro de máquina')
    },
  })
}

export const useDeleteMachineMutation = () => {
  const queryClient = useQueryClient()
  const deleteMachine = useMachinesStore((state) => state.deleteMachine)

  return useMutation({
    mutationFn: async ({ id }) => {
      return deleteMachine(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      queryClient.invalidateQueries({ queryKey: ['machine-stats'] })
      toast.success('Máquina eliminada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar la máquina')
    },
  })
}

export const useUpdateUserProfileMutation = (userId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileData, profileImage }) => {
      // Update profile data
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(profileData)
        .eq('id_auth', userId)

      if (updateError) throw updateError

      // Upload profile image if provided
      if (profileImage) {
        try {
          // Compress image
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }
          const compressedFile = await imageCompression(profileImage, options)

          // Upload to storage
          const fileName = `${userId}_${Date.now()}`
          const { error: uploadError } = await supabase.storage
            .from('kinit-files-01')
            .upload(`profile-photos/${fileName}`, compressedFile)

          if (uploadError) throw uploadError

          // Get public URL and update database
          const { data: publicUrlData } = supabase.storage
            .from('kinit-files-01')
            .getPublicUrl(`profile-photos/${fileName}`)

          const { error: urlUpdateError } = await supabase
            .from('usuarios')
            .update({ foto_perfil: publicUrlData.publicUrl })
            .eq('id_auth', userId)

          if (urlUpdateError) throw urlUpdateError
        } catch (imageError) {
          console.error('Error al procesar imagen:', imageError)
          throw new Error('Error al subir la foto de perfil')
        }
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
      toast.success('Perfil actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar perfil')
    },
  })
}

// ─── Garment Parameters ───────────────────────────────────────────────────────

const buildGarmentPayload = (data) => ({
  garment_type: data.garment_type,
  garment_model: data.garment_model,
  size: data.size,
  length: data.length ? Number(data.length) : null,
  width: data.width ? Number(data.width) : null,
  sleeve_length: data.sleeve_length ? Number(data.sleeve_length) : null,
  chest_circumference: data.chest_circumference ? Number(data.chest_circumference) : null,
  waist_circumference: data.waist_circumference ? Number(data.waist_circumference) : null,
  neck_circumference: data.neck_circumference ? Number(data.neck_circumference) : null,
  stitch_count_horizontal: data.stitch_count_horizontal ? Number(data.stitch_count_horizontal) : null,
  stitch_count_vertical: data.stitch_count_vertical ? Number(data.stitch_count_vertical) : null,
  gauge_horizontal: data.gauge_horizontal ? Number(data.gauge_horizontal) : null,
  gauge_vertical: data.gauge_vertical ? Number(data.gauge_vertical) : null,
  finishing_type: data.finishing_type || null,
  pattern_complexity: data.pattern_complexity || null,
  garment_order: data.garment_order ? Number(data.garment_order) : null,
  is_main_piece: Boolean(data.is_main_piece),
  notes: data.notes || null,
})

export const useCreateGarmentParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('garment_parameters')
        .insert(buildGarmentPayload(data))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garment-parameters'] })
      toast.success('Parámetro de prenda creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el parámetro de prenda')
    },
  })
}

export const useUpdateGarmentParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('garment_parameters')
        .update(buildGarmentPayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garment-parameters'] })
      toast.success('Parámetro de prenda actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el parámetro de prenda')
    },
  })
}

export const useDeleteGarmentParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('garment_parameters')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garment-parameters'] })
      toast.success('Parámetro de prenda eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el parámetro de prenda')
    },
  })
}

const buildKnittingPayload = (data) => ({
  stitch_type: data.stitch_type,
  canvas_type: data.canvas_type || null,
  knitting_mode: data.knitting_mode || null,
  knitting_submode: data.knitting_submode || null,
  thread_count: data.thread_count ? Number(data.thread_count) : null,
  stitch_density: data.stitch_density ? Number(data.stitch_density) : null,
  pattern_repeat: data.pattern_repeat ? Number(data.pattern_repeat) : null,
  tension_setting: data.tension_setting ? Number(data.tension_setting) : null,
  parameter_order: data.parameter_order ? Number(data.parameter_order) : null,
  is_primary: Boolean(data.is_primary),
  notes: data.notes || null,
})

export const useCreateKnittingParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('knitting_parameters')
        .insert(buildKnittingPayload(data))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knitting-parameters'] })
      toast.success('Parámetro de tejido creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el parámetro de tejido')
    },
  })
}

export const useUpdateKnittingParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('knitting_parameters')
        .update(buildKnittingPayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knitting-parameters'] })
      toast.success('Parámetro de tejido actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el parámetro de tejido')
    },
  })
}

export const useDeleteKnittingParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('knitting_parameters')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knitting-parameters'] })
      toast.success('Parámetro de tejido eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el parámetro de tejido')
    },
  })
}

const buildMaterialPayload = (data) => ({
  yarn_type: data.yarn_type || null,
  yarn_weight: data.yarn_weight || null,
  yarn_color: data.yarn_color || null,
  yarn_brand: data.yarn_brand || null,
  yarn_composition: data.yarn_composition || null,
  yarn_thickness: data.yarn_thickness ? Number(data.yarn_thickness) : null,
  yarn_count: data.yarn_count || null,
  quantity_used: data.quantity_used ? Number(data.quantity_used) : null,
  quantity_unit: data.quantity_unit || null,
  cost_per_unit: data.cost_per_unit ? Number(data.cost_per_unit) : null,
  supplier: data.supplier || null,
  lot_number: data.lot_number || null,
  hqpds_configuration_id: Number(data.hqpds_configuration_id),
  material_order: data.material_order ? Number(data.material_order) : null,
  is_primary: Boolean(data.is_primary),
  notes: data.notes || null,
})

export const useCreateMaterialParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('material_parameters')
        .insert(buildMaterialPayload(data))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-parameters'] })
      toast.success('Parámetro de material creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el parámetro de material')
    },
  })
}

export const useUpdateMaterialParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('material_parameters')
        .update(buildMaterialPayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-parameters'] })
      toast.success('Parámetro de material actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el parámetro de material')
    },
  })
}

export const useDeleteMaterialParameterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('material_parameters')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-parameters'] })
      toast.success('Parámetro de material eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el parámetro de material')
    },
  })
}

const buildThreadPayload = (data) => ({
  codigo_hilo: data.codigo_hilo?.trim() || null,
  nombre_hilo: data.nombre_hilo?.trim() || null,
  composicion: data.composicion?.trim() || null,
  abrev: data.abrev?.trim() || null,
  instrucciones_cuidado: data.instrucciones_cuidado?.trim() || null,
  presentacion: data.presentacion?.trim() || null,
  peso: data.peso ? Number(data.peso) : null,
  unidad_medida: data.unidad_medida?.trim() || null,
  codigo_color_hex: data.codigo_color_hex?.trim() || null,
  color_descripcion: data.color_descripcion?.trim() || null,
})

export const useCreateThreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('hilos')
        .insert(buildThreadPayload(data))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Hilo creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el hilo')
    },
  })
}

export const useUpdateThreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('hilos')
        .update(buildThreadPayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Hilo actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el hilo')
    },
  })
}

export const useDeleteThreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('hilos')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Hilo eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el hilo')
    },
  })
}

export const useCreateThreadsBulkMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows) => {
      const payload = rows.map(buildThreadPayload)
      const { error } = await supabase
        .from('hilos')
        .insert(payload)
      if (error) throw error
      return payload.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success(`Carga masiva completada: ${count} hilos registrados`)
    },
    onError: (error) => {
      toast.error(error.message || 'Error en la carga masiva de hilos')
    },
  })
}

const buildProviderPayload = (data) => ({
  razon_social: data.razon_social?.trim().toUpperCase() || null,
  ruc: data.ruc?.trim() || null,
  direccion: data.direccion?.trim() || null,
  email: data.email?.trim().toLowerCase() || null,
  telefono: data.telefono?.trim() || null,
  celular: data.celular?.trim() || null,
})

export const useCreateProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('proveedores')
        .insert(buildProviderPayload(data))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el proveedor')
    },
  })
}

export const useUpdateProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('proveedores')
        .update(buildProviderPayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el proveedor')
    },
  })
}

export const useDeleteProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el proveedor')
    },
  })
}

export const useCreateProvidersBulkMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows) => {
      const payload = rows.map(buildProviderPayload)
      const { error } = await supabase
        .from('proveedores')
        .insert(payload)
      if (error) throw error
      return payload.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success(`Carga masiva completada: ${count} proveedores registrados`)
    },
    onError: (error) => {
      toast.error(error.message || 'Error en la carga masiva de proveedores')
    },
  })
}

const getNowLima = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Lima' }).replace(' ', 'T')

const buildHqpdsConfigurationPayload = (data) => {
  return {
    hqpds_id: data.hqpds_id || null,
    design_name: data.design_name,
    description: data.description || null,
    image_file_design: Array.isArray(data.image_file_design) ? data.image_file_design : [],
    pds_file: Array.isArray(data.pds_file) ? data.pds_file : [],
    hcd_file: Array.isArray(data.hcd_file) ? data.hcd_file : [],
    configuration_mode: data.configuration_mode || null,
    estimated_knitting_time: data.estimated_knitting_time ? Number(data.estimated_knitting_time) : null,
    thread_guide: Array.isArray(data.thread_guide) ? data.thread_guide : [],
    stitch_density: Array.isArray(data.stitch_density) ? data.stitch_density : [],
    garment_type: data.garment_type || null,
    garment_size: data.garment_size || null,
    id_auth: data.id_auth || null,
    version: data.version ? Number(data.version) : 1,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  }
}

export const useCreateHqpdsConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const payload = buildHqpdsConfigurationPayload(data)
      const { data: createdConfiguration, error } = await supabase
        .from('hqpds_configurations')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      return createdConfiguration
    },
    onSuccess: (createdConfiguration) => {
      queryClient.setQueryData(['hqpds-configurations'], (current = []) => [
        createdConfiguration,
        ...current,
      ])
      queryClient.setQueryData(['hqpds-configuration', String(createdConfiguration.id)], createdConfiguration)
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations'] })
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations-recent'] })
      queryClient.invalidateQueries({ queryKey: ['hqpds-configuration', String(createdConfiguration.id)] })
      toast.success('Configuración HQPDS creada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear la configuración HQPDS')
    },
  })
}

export const useUpdateHqpdsConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = buildHqpdsConfigurationPayload(data)
      const now = getNowLima()

      const { data: updatedConfiguration, error } = await supabase
        .from('hqpds_configurations')
        .update({ ...payload, last_modified_date: now, updated_at: now })
        .eq('id', Number(id))
        .select('*')
        .single()
      if (error) throw error
      return updatedConfiguration
    },
    onSuccess: (updatedConfiguration) => {
      queryClient.setQueryData(['hqpds-configurations'], (current = []) =>
        current.map((item) => (item.id === updatedConfiguration.id ? updatedConfiguration : item))
      )
      queryClient.setQueryData(['hqpds-configuration', String(updatedConfiguration.id)], updatedConfiguration)
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations'] })
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations-recent'] })
      queryClient.invalidateQueries({ queryKey: ['hqpds-configuration', String(updatedConfiguration.id)] })
      toast.success('Configuración HQPDS actualizada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar la configuración HQPDS')
    },
  })
}

export const useDeleteHqpdsConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('hqpds_configurations')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['hqpds-configurations'], (current = []) =>
        current.filter((item) => item.id !== deletedId)
      )
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations'] })
      queryClient.invalidateQueries({ queryKey: ['hqpds-configurations-recent'] })
      toast.success('Configuración HQPDS eliminada exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar la configuración HQPDS')
    },
  })
}

// =============================================
// RBAC Mutations
// =============================================

const buildRolePayload = (data) => ({
  nombre: (data.nombre || '').trim().toLowerCase(),
  descripcion: (data.descripcion || '').trim() || null,
  is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
})

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const { data: created, error } = await supabase
        .from('roles')
        .insert(buildRolePayload(data))
        .select('*')
        .single()
      if (error) throw error
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el rol')
    },
  })
}

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('roles')
        .update(buildRolePayload(data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el rol')
    },
  })
}

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el rol')
    },
  })
}

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rolId, permisos }) => {
      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from('rol_formulario')
        .delete()
        .eq('rol_id', rolId)
      if (deleteError) throw deleteError

      // Insert new permissions
      if (permisos.length > 0) {
        const payload = permisos.map((p) => ({
          rol_id: rolId,
          formulario_id: p.formulario_id,
          puede_ver: Boolean(p.puede_ver),
          puede_crear: Boolean(p.puede_crear),
          puede_editar: Boolean(p.puede_editar),
          puede_eliminar: Boolean(p.puede_eliminar),
        }))
        const { error: insertError } = await supabase
          .from('rol_formulario')
          .insert(payload)
        if (insertError) throw insertError
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', variables.rolId] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permisos del rol actualizados exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar los permisos del rol')
    },
  })
}

export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, rolId }) => {
      const { error } = await supabase
        .from('usuarios')
        .update({ rol_id: rolId })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Rol del usuario actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el rol del usuario')
    },
  })
}
