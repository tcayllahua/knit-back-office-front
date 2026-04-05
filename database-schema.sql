BEGIN;

-- =============================================
-- RBAC: Tablas de roles y permisos
-- =============================================

DROP TABLE IF EXISTS public.rol_formulario CASCADE;
DROP TABLE IF EXISTS public.formularios CASCADE;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS public.roles (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de formularios (módulos del sistema)
CREATE TABLE IF NOT EXISTS public.formularios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ruta VARCHAR(100) NOT NULL,
  entidad VARCHAR(100),
  icono VARCHAR(50),
  orden INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla pivot: permisos por rol y formulario
CREATE TABLE IF NOT EXISTS public.rol_formulario (
  id BIGSERIAL PRIMARY KEY,
  rol_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  formulario_id BIGINT NOT NULL REFERENCES public.formularios(id) ON DELETE CASCADE,
  puede_ver BOOLEAN DEFAULT false,
  puede_crear BOOLEAN DEFAULT false,
  puede_editar BOOLEAN DEFAULT false,
  puede_eliminar BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rol_id, formulario_id)
);

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
  rol_id BIGINT REFERENCES public.roles(id),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Si la tabla usuarios ya existe, agregar columna rol_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'rol_id'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN rol_id BIGINT REFERENCES public.roles(id);
  END IF;
END $$;

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
  hqpds_id VARCHAR(7),
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
  id_auth UUID REFERENCES public.usuarios(id_auth),
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

-- RLS para usuarios (definido más abajo con soporte admin)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Funciones RBAC (deben existir antes de las políticas RLS)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT r.nombre
  FROM public.usuarios u
  JOIN public.roles r ON r.id = u.rol_id
  WHERE u.id_auth = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    JOIN public.roles r ON r.id = u.rol_id
    WHERE u.id_auth = auth.uid() AND r.nombre = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_permission(p_entidad TEXT, p_operacion TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    JOIN public.rol_formulario rf ON rf.rol_id = u.rol_id
    JOIN public.formularios f ON f.id = rf.formulario_id
    WHERE u.id_auth = auth.uid()
      AND f.entidad = p_entidad
      AND f.is_active = true
      AND CASE p_operacion
        WHEN 'ver' THEN rf.puede_ver
        WHEN 'crear' THEN rf.puede_crear
        WHEN 'editar' THEN rf.puede_editar
        WHEN 'eliminar' THEN rf.puede_eliminar
        ELSE false
      END
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS para hqpds_configurations
ALTER TABLE public.hqpds_configurations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar hqpds_configurations" ON public.hqpds_configurations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar hqpds_configurations" ON public.hqpds_configurations;

CREATE POLICY "Usuarios autenticados pueden leer hqpds_configurations"
  ON public.hqpds_configurations FOR SELECT TO authenticated
  USING (public.has_permission('hqpds_configurations'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear hqpds_configurations"
  ON public.hqpds_configurations FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('hqpds_configurations'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar hqpds_configurations"
  ON public.hqpds_configurations FOR UPDATE TO authenticated
  USING (public.has_permission('hqpds_configurations'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('hqpds_configurations'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar hqpds_configurations"
  ON public.hqpds_configurations FOR DELETE TO authenticated
  USING (public.has_permission('hqpds_configurations'::TEXT, 'eliminar'::TEXT));

-- RLS para machine_parameters
ALTER TABLE public.machine_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar machine_parameters" ON public.machine_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar machine_parameters" ON public.machine_parameters;

CREATE POLICY "Usuarios autenticados pueden leer machine_parameters"
  ON public.machine_parameters FOR SELECT TO authenticated
  USING (public.has_permission('machine_parameters'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear machine_parameters"
  ON public.machine_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('machine_parameters'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar machine_parameters"
  ON public.machine_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('machine_parameters'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('machine_parameters'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar machine_parameters"
  ON public.machine_parameters FOR DELETE TO authenticated
  USING (public.has_permission('machine_parameters'::TEXT, 'eliminar'::TEXT));

-- RLS para garment_parameters
ALTER TABLE public.garment_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar garment_parameters" ON public.garment_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar garment_parameters" ON public.garment_parameters;

CREATE POLICY "Usuarios autenticados pueden leer garment_parameters"
  ON public.garment_parameters FOR SELECT TO authenticated
  USING (public.has_permission('garment_parameters'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear garment_parameters"
  ON public.garment_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('garment_parameters'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar garment_parameters"
  ON public.garment_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('garment_parameters'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('garment_parameters'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar garment_parameters"
  ON public.garment_parameters FOR DELETE TO authenticated
  USING (public.has_permission('garment_parameters'::TEXT, 'eliminar'::TEXT));

-- RLS para knitting_parameters
ALTER TABLE public.knitting_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar knitting_parameters" ON public.knitting_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar knitting_parameters" ON public.knitting_parameters;

CREATE POLICY "Usuarios autenticados pueden leer knitting_parameters"
  ON public.knitting_parameters FOR SELECT TO authenticated
  USING (public.has_permission('knitting_parameters'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear knitting_parameters"
  ON public.knitting_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('knitting_parameters'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar knitting_parameters"
  ON public.knitting_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('knitting_parameters'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('knitting_parameters'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar knitting_parameters"
  ON public.knitting_parameters FOR DELETE TO authenticated
  USING (public.has_permission('knitting_parameters'::TEXT, 'eliminar'::TEXT));

-- RLS para material_parameters
ALTER TABLE public.material_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar material_parameters" ON public.material_parameters;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar material_parameters" ON public.material_parameters;

CREATE POLICY "Usuarios autenticados pueden leer material_parameters"
  ON public.material_parameters FOR SELECT TO authenticated
  USING (public.has_permission('material_parameters'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear material_parameters"
  ON public.material_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('material_parameters'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar material_parameters"
  ON public.material_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('material_parameters'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('material_parameters'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar material_parameters"
  ON public.material_parameters FOR DELETE TO authenticated
  USING (public.has_permission('material_parameters'::TEXT, 'eliminar'::TEXT));

-- RLS para hilos
ALTER TABLE public.hilos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar hilos" ON public.hilos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar hilos" ON public.hilos;

CREATE POLICY "Usuarios autenticados pueden leer hilos"
  ON public.hilos FOR SELECT TO authenticated
  USING (public.has_permission('hilos'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear hilos"
  ON public.hilos FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('hilos'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar hilos"
  ON public.hilos FOR UPDATE TO authenticated
  USING (public.has_permission('hilos'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('hilos'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar hilos"
  ON public.hilos FOR DELETE TO authenticated
  USING (public.has_permission('hilos'::TEXT, 'eliminar'::TEXT));

-- RLS para proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar proveedores" ON public.proveedores;

CREATE POLICY "Usuarios autenticados pueden leer proveedores"
  ON public.proveedores FOR SELECT TO authenticated
  USING (public.has_permission('proveedores'::TEXT, 'ver'::TEXT));

CREATE POLICY "Usuarios autenticados pueden crear proveedores"
  ON public.proveedores FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('proveedores'::TEXT, 'crear'::TEXT));

CREATE POLICY "Usuarios autenticados pueden actualizar proveedores"
  ON public.proveedores FOR UPDATE TO authenticated
  USING (public.has_permission('proveedores'::TEXT, 'editar'::TEXT))
  WITH CHECK (public.has_permission('proveedores'::TEXT, 'editar'::TEXT));

CREATE POLICY "Usuarios autenticados pueden eliminar proveedores"
  ON public.proveedores FOR DELETE TO authenticated
  USING (public.has_permission('proveedores'::TEXT, 'eliminar'::TEXT));

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

-- Grants para tablas RBAC
GRANT SELECT ON TABLE public.roles TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.roles_id_seq TO authenticated;

GRANT SELECT ON TABLE public.formularios TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.formularios_id_seq TO authenticated;

GRANT SELECT ON TABLE public.rol_formulario TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.rol_formulario_id_seq TO authenticated;

-- Admin puede escribir en tablas RBAC (controlado por RLS)
GRANT INSERT, UPDATE, DELETE ON TABLE public.roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.formularios TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.rol_formulario TO authenticated;

-- Admin puede leer/actualizar todos los usuarios (controlado por RLS)
GRANT SELECT, UPDATE ON TABLE public.usuarios TO authenticated;

-- =============================================
-- Índices RBAC
-- =============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON public.usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_rol_formulario_rol_id ON public.rol_formulario(rol_id);
CREATE INDEX IF NOT EXISTS idx_rol_formulario_formulario_id ON public.rol_formulario(formulario_id);
CREATE INDEX IF NOT EXISTS idx_roles_nombre ON public.roles(nombre);
CREATE INDEX IF NOT EXISTS idx_formularios_ruta ON public.formularios(ruta);

-- =============================================
-- RLS para tablas RBAC
-- =============================================

-- RLS para roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer roles" ON public.roles;
DROP POLICY IF EXISTS "Admin puede gestionar roles" ON public.roles;

CREATE POLICY "Usuarios autenticados pueden leer roles"
  ON public.roles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin puede gestionar roles"
  ON public.roles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS para formularios
ALTER TABLE public.formularios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer formularios" ON public.formularios;
DROP POLICY IF EXISTS "Admin puede gestionar formularios" ON public.formularios;

CREATE POLICY "Usuarios autenticados pueden leer formularios"
  ON public.formularios FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin puede gestionar formularios"
  ON public.formularios FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS para rol_formulario
ALTER TABLE public.rol_formulario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer rol_formulario" ON public.rol_formulario;
DROP POLICY IF EXISTS "Admin puede gestionar rol_formulario" ON public.rol_formulario;

CREATE POLICY "Usuarios autenticados pueden leer rol_formulario"
  ON public.rol_formulario FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin puede gestionar rol_formulario"
  ON public.rol_formulario FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Actualizar RLS de usuarios para que admin pueda ver/editar todos
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Admin puede ver todos los usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin puede actualizar todos los usuarios" ON public.usuarios;

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.usuarios FOR SELECT
  USING (id_auth = auth.uid());

CREATE POLICY "Admin puede ver todos los usuarios"
  ON public.usuarios FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.usuarios FOR UPDATE
  USING (id_auth = auth.uid());

CREATE POLICY "Admin puede actualizar todos los usuarios"
  ON public.usuarios FOR UPDATE TO authenticated
  USING (public.is_admin());

-- =============================================
-- Seed: roles por defecto
-- =============================================
INSERT INTO public.roles (nombre, descripcion) VALUES
  ('admin', 'Administrador con acceso total al sistema'),
  ('supervisor', 'Supervisor con acceso de lectura y edición'),
  ('usuario', 'Usuario con acceso básico de lectura')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================
-- Seed: formularios (módulos del sistema)
-- =============================================
INSERT INTO public.formularios (nombre, ruta, entidad, icono, orden) VALUES
  ('Dashboard', '/', NULL, 'Dashboard', 1),
  ('Máquinas', '/maquinas', 'machine_parameters', 'PrecisionManufacturing', 2),
  ('Prendas', '/prendas', 'garment_parameters', 'Checkroom', 3),
  ('Tejido', '/tejido', 'knitting_parameters', 'Insights', 4),
  ('Materiales', '/materiales', 'material_parameters', 'Inventory2', 5),
  ('Programa Hqpds', '/configuraciones', 'hqpds_configurations', 'SdStorage', 6),
  ('Hilos', '/hilos', 'hilos', 'Cable', 7),
  ('Proveedores', '/proveedores', 'proveedores', 'LocalShipping', 8),
  ('Gestión de Usuarios', '/admin/usuarios', 'usuarios', 'People', 100),
  ('Gestión de Roles', '/admin/roles', 'roles', 'AdminPanelSettings', 101)
ON CONFLICT DO NOTHING;

-- =============================================
-- Seed: permisos del rol admin (acceso total)
-- =============================================
INSERT INTO public.rol_formulario (rol_id, formulario_id, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT r.id, f.id, true, true, true, true
FROM public.roles r, public.formularios f
WHERE r.nombre = 'admin'
ON CONFLICT (rol_id, formulario_id) DO NOTHING;

-- Permisos del rol supervisor (todo excepto admin pages y eliminar)
INSERT INTO public.rol_formulario (rol_id, formulario_id, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT r.id, f.id, true, true, true, false
FROM public.roles r, public.formularios f
WHERE r.nombre = 'supervisor' AND f.orden < 100
ON CONFLICT (rol_id, formulario_id) DO NOTHING;

-- Permisos del rol usuario (solo lectura de módulos básicos)
INSERT INTO public.rol_formulario (rol_id, formulario_id, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT r.id, f.id, true, false, false, false
FROM public.roles r, public.formularios f
WHERE r.nombre = 'usuario' AND f.orden < 100
ON CONFLICT (rol_id, formulario_id) DO NOTHING;

COMMIT;

-- Forzar recarga de caché de PostgREST
NOTIFY pgrst, 'reload schema';
