import { create } from 'zustand'
import { supabase } from '../config/supabase'

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
      const { data, error } = await supabase
        .from('machine_parameters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      set({ currentMachine: data })
      return data
    } catch (err) {
      console.error('Error fetching machine:', err)
      throw err
    }
  },

  createMachine: async (machineData) => {
    try {
      const payload = buildMachinePayload(machineData)
      const { data: machine, error: insertError } = await supabase
        .from('machine_parameters')
        .insert(payload)
        .select('*')
        .single()

      if (insertError) throw insertError

      set({ currentMachine: machine })
      return machine
    } catch (err) {
      console.error('Error creating machine:', err)
      throw err
    }
  },

  updateMachine: async (id, machineData) => {
    try {
      const payload = buildMachinePayload(machineData)
      const { error: updateError } = await supabase
        .from('machine_parameters')
        .update(payload)
        .eq('id', id)

      if (updateError) throw updateError

      return true
    } catch (err) {
      console.error('Error updating machine:', err)
      throw err
    }
  },

  deleteMachine: async (id) => {
    try {
      const { error } = await supabase.from('machine_parameters').delete().eq('id', id)

      if (error) throw error

      set({ currentMachine: null })
      return true
    } catch (err) {
      console.error('Error deleting machine:', err)
      throw err
    }
  },
}))
