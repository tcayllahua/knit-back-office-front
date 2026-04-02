BEGIN;

-- Tabla de usuarios (no se elimina para preservar datos)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id BIGSERIAL PRIMARY KEY,
  id_auth UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  foto_perfil TEXT,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Eliminar tabla antigua del módulo máquinas
DROP TABLE IF EXISTS public.maquinas CASCADE;

-- Recrear módulos de parámetros para evitar inconsistencias de esquema
DROP TABLE IF EXISTS public.machine_parameters CASCADE;
DROP TABLE IF EXISTS public.garment_parameters CASCADE;
DROP TABLE IF EXISTS public.knitting_parameters CASCADE;
DROP TABLE IF EXISTS public.material_parameters CASCADE;
DROP TABLE IF EXISTS public.hilos CASCADE;
DROP TABLE IF EXISTS public.proveedores CASCADE;
DROP TABLE IF EXISTS public.hqpds_configurations CASCADE;

-- Tabla de configuración principal HQPDS
CREATE TABLE public.hqpds_configurations (
  id BIGSERIAL PRIMARY KEY,
  hqpds_id VARCHAR(6),
  design_name VARCHAR(100) NOT NULL,
  description TEXT,
  creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_modified_date TIMESTAMP,
  image_file_design JSONB DEFAULT '[]'::jsonb,
  pds_file JSONB DEFAULT '[]'::jsonb,
  hcd_file JSONB DEFAULT '[]'::jsonb,
  configuration_mode VARCHAR(50),
  estimated_knitting_time INTEGER,
  thread_guide JSONB DEFAULT '[]'::jsonb,
  stitch_density JSONB DEFAULT '[]'::jsonb,
  garment_type VARCHAR(50),
  garment_size VARCHAR(20),
  created_by_user VARCHAR(100),
  version BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de parámetros de máquina
CREATE TABLE public.machine_parameters (
  id BIGSERIAL PRIMARY KEY,
  machine_type VARCHAR(5) CHECK (machine_type IN ('A', 'B', 'C', 'D', 'E')),
  gauge_number INTEGER CHECK (gauge_number IN (3, 6, 7, 9)),
  needle_count INTEGER,
  machine_speed INTEGER,
  working_width DECIMAL(8,2),
  feeder_count INTEGER,
  cylinder_diameter DECIMAL(8,2),
  machine_brand VARCHAR(50),
  machine_model VARCHAR(50),
  hqpds_configuration_id BIGINT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  maintenance_status VARCHAR(20),
  calibration_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_machine_parameters_hqpds_configuration'
  ) THEN
    ALTER TABLE public.machine_parameters
      ADD CONSTRAINT fk_machine_parameters_hqpds_configuration
      FOREIGN KEY (hqpds_configuration_id)
      REFERENCES public.hqpds_configurations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Tabla de hilos
CREATE TABLE public.hilos (
  id BIGSERIAL PRIMARY KEY,
  codigo_hilo VARCHAR(50) NOT NULL,
  nombre_hilo VARCHAR(150),
  composicion VARCHAR(200),
  abrev VARCHAR(20),
  instrucciones_cuidado TEXT,
  presentacion VARCHAR(100),
  peso DECIMAL(10,2),
  unidad_medida VARCHAR(30),
  codigo_color_hex VARCHAR(7),
  color_descripcion VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT hilos_codigo_hilo_unique UNIQUE (codigo_hilo)
);

-- Tabla de parámetros de prendas
CREATE TABLE public.garment_parameters (
  id BIGSERIAL PRIMARY KEY,
  garment_type VARCHAR(50) NOT NULL,
  garment_model VARCHAR(50) NOT NULL,
  size VARCHAR(10) NOT NULL,
  length DECIMAL(8,2),
  width DECIMAL(8,2),
  sleeve_length DECIMAL(8,2),
  chest_circumference DECIMAL(8,2),
  waist_circumference DECIMAL(8,2),
  neck_circumference DECIMAL(8,2),
  stitch_count_horizontal INTEGER,
  stitch_count_vertical INTEGER,
  gauge_horizontal DECIMAL(5,2),
  gauge_vertical DECIMAL(5,2),
  finishing_type VARCHAR(50),
  pattern_complexity VARCHAR(20),
  hqpds_configuration_id BIGINT,
  garment_order INTEGER,
  is_main_piece BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_garment_parameters_hqpds_configuration'
  ) THEN
    ALTER TABLE public.garment_parameters
      ADD CONSTRAINT fk_garment_parameters_hqpds_configuration
      FOREIGN KEY (hqpds_configuration_id)
      REFERENCES public.hqpds_configurations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Tabla de parámetros de tejido
CREATE TABLE public.knitting_parameters (
  id BIGSERIAL PRIMARY KEY,
  stitch_type VARCHAR(50) NOT NULL,
  canvas_type VARCHAR(10),
  knitting_mode VARCHAR(30),
  knitting_submode VARCHAR(50),
  thread_count INTEGER,
  stitch_density DECIMAL(10,2),
  pattern_repeat INTEGER,
  tension_setting DECIMAL(5,2),
  hqpds_configuration_id BIGINT,
  parameter_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_knitting_parameters_hqpds_configuration'
  ) THEN
    ALTER TABLE public.knitting_parameters
      ADD CONSTRAINT fk_knitting_parameters_hqpds_configuration
      FOREIGN KEY (hqpds_configuration_id)
      REFERENCES public.hqpds_configurations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Tabla de parámetros de materiales
CREATE TABLE public.material_parameters (
  id BIGSERIAL PRIMARY KEY,
  yarn_type VARCHAR(50),
  yarn_weight VARCHAR(20),
  yarn_color VARCHAR(50),
  yarn_brand VARCHAR(50),
  yarn_composition VARCHAR(100),
  yarn_thickness DECIMAL(5,2),
  yarn_count VARCHAR(20),
  quantity_used DECIMAL(10,2),
  quantity_unit VARCHAR(10),
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(100),
  lot_number VARCHAR(50),
  hqpds_configuration_id BIGINT NOT NULL,
  material_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_material_parameters_hqpds_configuration'
  ) THEN
    ALTER TABLE public.material_parameters
      ADD CONSTRAINT fk_material_parameters_hqpds_configuration
      FOREIGN KEY (hqpds_configuration_id)
      REFERENCES public.hqpds_configurations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Tabla de proveedores
CREATE TABLE public.proveedores (
  id BIGSERIAL PRIMARY KEY,
  razon_social VARCHAR(150) NOT NULL,
  ruc VARCHAR(20) NOT NULL,
  direccion TEXT NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  celular VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT proveedores_ruc_unique UNIQUE (ruc)
);

-- Normalización de datos en proveedores
CREATE OR REPLACE FUNCTION public.normalize_proveedores_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.razon_social := UPPER(TRIM(NEW.razon_social));
  NEW.email := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_proveedores_fields ON public.proveedores;
CREATE TRIGGER trg_normalize_proveedores_fields
BEFORE INSERT OR UPDATE ON public.proveedores
FOR EACH ROW
EXECUTE FUNCTION public.normalize_proveedores_fields();

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_id_auth ON public.usuarios(id_auth);
CREATE INDEX IF NOT EXISTS idx_hqpds_configurations_design_name ON public.hqpds_configurations(design_name);
CREATE INDEX IF NOT EXISTS idx_hqpds_configurations_is_active ON public.hqpds_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_machine_parameters_type ON public.machine_parameters(machine_type);
CREATE INDEX IF NOT EXISTS idx_machine_parameters_gauge ON public.machine_parameters(gauge_number);
CREATE INDEX IF NOT EXISTS idx_machine_parameters_status ON public.machine_parameters(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_machine_parameters_configuration ON public.machine_parameters(hqpds_configuration_id);
CREATE INDEX IF NOT EXISTS idx_garment_parameters_type ON public.garment_parameters(garment_type);
CREATE INDEX IF NOT EXISTS idx_garment_parameters_model ON public.garment_parameters(garment_model);
CREATE INDEX IF NOT EXISTS idx_garment_parameters_size ON public.garment_parameters(size);
CREATE INDEX IF NOT EXISTS idx_knitting_parameters_stitch_type ON public.knitting_parameters(stitch_type);
CREATE INDEX IF NOT EXISTS idx_knitting_parameters_canvas_type ON public.knitting_parameters(canvas_type);
CREATE INDEX IF NOT EXISTS idx_knitting_parameters_knitting_mode ON public.knitting_parameters(knitting_mode);
CREATE INDEX IF NOT EXISTS idx_material_parameters_yarn_type ON public.material_parameters(yarn_type);
CREATE INDEX IF NOT EXISTS idx_material_parameters_yarn_brand ON public.material_parameters(yarn_brand);
CREATE INDEX IF NOT EXISTS idx_material_parameters_configuration ON public.material_parameters(hqpds_configuration_id);
CREATE INDEX IF NOT EXISTS idx_hilos_codigo_hilo ON public.hilos(codigo_hilo);
CREATE INDEX IF NOT EXISTS idx_hilos_nombre_hilo ON public.hilos(nombre_hilo);
CREATE INDEX IF NOT EXISTS idx_proveedores_razon_social ON public.proveedores(razon_social);
CREATE INDEX IF NOT EXISTS idx_proveedores_ruc ON public.proveedores(ruc);

-- RLS para usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuarios;

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.usuarios
  FOR SELECT
  USING (id_auth = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.usuarios
  FOR UPDATE
  USING (id_auth = auth.uid());

-- RLS para hqpds_configurations
ALTER TABLE public.hqpds_configurations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar hqpds_configurations" ON public.hqpds_configurations;

CREATE POLICY "Usuarios autenticados pueden leer hqpds_configurations"
  ON public.hqpds_configurations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear hqpds_configurations"
  ON public.hqpds_configurations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar hqpds_configurations"
  ON public.hqpds_configurations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar hqpds_configurations"
  ON public.hqpds_configurations FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para machine_parameters
ALTER TABLE public.machine_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar machine_parameters" ON public.machine_parameters;

CREATE POLICY "Usuarios autenticados pueden leer machine_parameters"
  ON public.machine_parameters FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear machine_parameters"
  ON public.machine_parameters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar machine_parameters"
  ON public.machine_parameters FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar machine_parameters"
  ON public.machine_parameters FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para garment_parameters
ALTER TABLE public.garment_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar garment_parameters" ON public.garment_parameters;

CREATE POLICY "Usuarios autenticados pueden leer garment_parameters"
  ON public.garment_parameters FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear garment_parameters"
  ON public.garment_parameters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar garment_parameters"
  ON public.garment_parameters FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar garment_parameters"
  ON public.garment_parameters FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para knitting_parameters
ALTER TABLE public.knitting_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar knitting_parameters" ON public.knitting_parameters;

CREATE POLICY "Usuarios autenticados pueden leer knitting_parameters"
  ON public.knitting_parameters FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear knitting_parameters"
  ON public.knitting_parameters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar knitting_parameters"
  ON public.knitting_parameters FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar knitting_parameters"
  ON public.knitting_parameters FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para material_parameters
ALTER TABLE public.material_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar material_parameters" ON public.material_parameters;

CREATE POLICY "Usuarios autenticados pueden leer material_parameters"
  ON public.material_parameters FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear material_parameters"
  ON public.material_parameters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar material_parameters"
  ON public.material_parameters FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar material_parameters"
  ON public.material_parameters FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para hilos
ALTER TABLE public.hilos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar hilos" ON public.hilos;

CREATE POLICY "Usuarios autenticados pueden leer hilos"
  ON public.hilos FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear hilos"
  ON public.hilos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar hilos"
  ON public.hilos FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar hilos"
  ON public.hilos FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS para proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar proveedores" ON public.proveedores;

CREATE POLICY "Usuarios autenticados pueden leer proveedores"
  ON public.proveedores FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden crear proveedores"
  ON public.proveedores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar proveedores"
  ON public.proveedores FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar proveedores"
  ON public.proveedores FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Grants para evitar errores de permisos con PostgREST
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hqpds_configurations TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.hqpds_configurations_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.machine_parameters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.machine_parameters_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.garment_parameters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.garment_parameters_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.knitting_parameters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.knitting_parameters_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.material_parameters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.material_parameters_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hilos TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.hilos_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.proveedores TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.proveedores_id_seq TO authenticated;

COMMIT;

-- Forzar recarga de caché de PostgREST
NOTIFY pgrst, 'reload schema';
