-- =============================================
-- Soft-Delete Migration
-- Adds deleted_at column to all entity tables
-- and cascade trigger for hqpds_configurations
-- =============================================

-- 1. Add deleted_at column to all entity tables
ALTER TABLE hqpds_configurations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE machine_parameters   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE garment_parameters   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE knitting_parameters  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE material_parameters  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE hilos                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE proveedores          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- 2. Partial indexes for active records (optimizes common queries)
CREATE INDEX IF NOT EXISTS idx_hqpds_configurations_active ON hqpds_configurations (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_machine_parameters_active    ON machine_parameters (id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_garment_parameters_active    ON garment_parameters (id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knitting_parameters_active   ON knitting_parameters (id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_material_parameters_active   ON material_parameters (id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hilos_active                 ON hilos (id)                 WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_proveedores_active           ON proveedores (id)           WHERE deleted_at IS NULL;

-- 3. Cascade soft-delete trigger: when hqpds_configurations.deleted_at changes,
--    propagate to child tables (machine, garment, knitting, material parameters)
CREATE OR REPLACE FUNCTION cascade_soft_delete_hqpds()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    UPDATE machine_parameters  SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE garment_parameters  SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE knitting_parameters SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE material_parameters SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cascade_soft_delete_hqpds ON hqpds_configurations;
CREATE TRIGGER trg_cascade_soft_delete_hqpds
  AFTER UPDATE OF deleted_at ON hqpds_configurations
  FOR EACH ROW
  EXECUTE FUNCTION cascade_soft_delete_hqpds();
