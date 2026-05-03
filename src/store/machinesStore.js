import { create } from 'zustand'
import { supabase } from '../config/supabase'
import logger from '../utils/logger'

const buildMachinePayload = (machineData) => ({
  machine_type: machineData.machine_type,
  gauge_number: machineData.gauge_number ? Number(machineData.gauge_number) : null,
  needle_count: machineData.needle_count ? Number(machineData.needle_count) : null,
  machine_speed: machineData.machine_speed ? Number(machineData.machine_speed) : null,
  working_width: machineData.working_width ? Number(machineData.working_width) : null,
  feeder_count: machineData.feeder_count ? Number(machineData.feeder_count) : null,
  cylinder_diameter: machineData.cylinder_diameter ? Number(machineData.cylinder_diameter) : null,
  machine_brand: machineData.machine_brand || null,
  machine_model: machineData.machine_model || null,
  hqpds_configuration_id: Number(machineData.hqpds_configuration_id),
  is_primary: Boolean(machineData.is_primary),
  maintenance_status: machineData.maintenance_status ? machineData.maintenance_status.toLowerCase() : null,
  calibration_date: machineData.calibration_date || null,
  notes: machineData.notes || null,
})

export const useMachinesStore = create((set) => ({
  currentMachine: null,
  setCurrentMachine: (machine) => set({ currentMachine: machine }),
  clearCurrentMachine: () => set({ currentMachine: null }),

  fetchMachine: async (id) => {
    try {
      logger.info('Machines', `Obteniendo máquina id: ${id}`)
      const { data, error } = await supabase
        .from('machine_parameters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      logger.debug('Machines', `Máquina obtenida: ${data.machine_brand} ${data.machine_model}`)
      set({ currentMachine: data })
      return data
    } catch (err) {
      logger.error('Machines', `Error al obtener máquina id: ${id}`, err)
      throw err
    }
  },

  createMachine: async (machineData) => {
    try {
      logger.info('Machines', 'Creando nueva máquina', { type: machineData.machine_type, brand: machineData.machine_brand })
      const payload = buildMachinePayload(machineData)
      const { data: machine, error: insertError } = await supabase
        .from('machine_parameters')
        .insert(payload)
        .select('*')
        .single()

      if (insertError) throw insertError

      logger.info('Machines', `Máquina creada exitosamente id: ${machine.id}`)
      set({ currentMachine: machine })
      return machine
    } catch (err) {
      logger.error('Machines', 'Error al crear máquina', err)
      throw err
    }
  },

  updateMachine: async (id, machineData) => {
    try {
      logger.info('Machines', `Actualizando máquina id: ${id}`)
      const payload = buildMachinePayload(machineData)
      const { error: updateError } = await supabase
        .from('machine_parameters')
        .update(payload)
        .eq('id', id)

      if (updateError) throw updateError

      logger.info('Machines', `Máquina id: ${id} actualizada exitosamente`)
      return true
    } catch (err) {
      logger.error('Machines', `Error al actualizar máquina id: ${id}`, err)
      throw err
    }
  },

  deleteMachine: async (id) => {
    try {
      logger.info('Machines', `Eliminando (soft-delete) máquina id: ${id}`)
      const now = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
      const limaDate = new Date(now).toISOString()
      const { error } = await supabase
        .from('machine_parameters')
        .update({ deleted_at: limaDate })
        .eq('id', id)

      if (error) throw error

      logger.info('Machines', `Máquina id: ${id} eliminada exitosamente`)
      set({ currentMachine: null })
      return true
    } catch (err) {
      logger.error('Machines', `Error al eliminar máquina id: ${id}`, err)
      throw err
    }
  },

  restoreMachine: async (id) => {
    try {
      logger.info('Machines', `Restaurando máquina id: ${id}`)
      const { error } = await supabase
        .from('machine_parameters')
        .update({ deleted_at: null })
        .eq('id', id)

      if (error) throw error
      logger.info('Machines', `Máquina id: ${id} restaurada exitosamente`)
      return true
    } catch (err) {
      logger.error('Machines', `Error al restaurar máquina id: ${id}`, err)
      throw err
    }
  },
}))
