BEGIN;

-- =============================================
-- DROP: Eliminar todas las tablas (español e inglés)
-- =============================================
DROP TABLE IF EXISTS public.role_form CASCADE;
DROP TABLE IF EXISTS public.rol_formulario CASCADE;
DROP TABLE IF EXISTS public.forms CASCADE;
DROP TABLE IF EXISTS public.formularios CASCADE;
DROP TABLE IF EXISTS public.machine_parameters CASCADE;
DROP TABLE IF EXISTS public.garment_parameters CASCADE;
DROP TABLE IF EXISTS public.knitting_parameters CASCADE;
DROP TABLE IF EXISTS public.material_parameters CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.hilos CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.proveedores CASCADE;
DROP TABLE IF EXISTS public.hqpds_configurations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.maquinas CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- =============================================
-- RBAC: Roles y permisos
-- =============================================

CREATE TABLE public.roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.forms (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  route VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.role_form (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  form_id BIGINT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, form_id)
);

-- =============================================
-- Usuarios
-- =============================================

CREATE TABLE public.users (
  id BIGSERIAL PRIMARY KEY,
  id_auth UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  paternal_last_name TEXT NOT NULL,
  maternal_last_name TEXT,
  phone TEXT,
  phone_code VARCHAR(10),
  address TEXT,
  country VARCHAR(100),
  country_code VARCHAR(5),
  profile_photo TEXT,
  role_id BIGINT REFERENCES public.roles(id),
  registration_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Configuraciones HQPDS
-- =============================================

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
  id_auth UUID REFERENCES public.users(id_auth),
  version BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Parámetros de máquina
-- =============================================

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
  hqpds_configuration_id BIGINT NOT NULL REFERENCES public.hqpds_configurations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  maintenance_status VARCHAR(20),
  calibration_date DATE,
  notes TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Hilos (threads)
-- =============================================

CREATE TABLE public.threads (
  id BIGSERIAL PRIMARY KEY,
  thread_code VARCHAR(50) NOT NULL UNIQUE,
  thread_name VARCHAR(150),
  composition VARCHAR(200),
  abbreviation VARCHAR(20),
  care_instructions TEXT,
  presentation VARCHAR(100),
  weight DECIMAL(10,2),
  unit_of_measure VARCHAR(30),
  hex_color_code VARCHAR(7),
  color_description VARCHAR(100),
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Parámetros de prendas
-- =============================================

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
  hqpds_configuration_id BIGINT REFERENCES public.hqpds_configurations(id) ON DELETE CASCADE,
  garment_order INTEGER,
  is_main_piece BOOLEAN DEFAULT false,
  notes TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Parámetros de tejido
-- =============================================

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
  hqpds_configuration_id BIGINT REFERENCES public.hqpds_configurations(id) ON DELETE CASCADE,
  parameter_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Parámetros de materiales
-- =============================================

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
  hqpds_configuration_id BIGINT NOT NULL REFERENCES public.hqpds_configurations(id) ON DELETE CASCADE,
  material_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Proveedores (suppliers)
-- =============================================

CREATE TABLE public.suppliers (
  id BIGSERIAL PRIMARY KEY,
  business_name VARCHAR(150) NOT NULL,
  tax_id VARCHAR(20) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Triggers
-- =============================================

-- Normalización de suppliers
CREATE OR REPLACE FUNCTION public.normalize_suppliers_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.business_name := UPPER(TRIM(NEW.business_name));
  NEW.email := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_suppliers_fields
BEFORE INSERT OR UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.normalize_suppliers_fields();

-- updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_hqpds_configurations
BEFORE UPDATE ON public.hqpds_configurations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_machine_parameters
BEFORE UPDATE ON public.machine_parameters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_garment_parameters
BEFORE UPDATE ON public.garment_parameters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_knitting_parameters
BEFORE UPDATE ON public.knitting_parameters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_material_parameters
BEFORE UPDATE ON public.material_parameters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_threads
BEFORE UPDATE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_suppliers
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- Índices
-- =============================================

CREATE INDEX idx_users_id_auth ON public.users(id_auth);
CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_hqpds_configurations_design_name ON public.hqpds_configurations(design_name);
CREATE INDEX idx_hqpds_configurations_is_active ON public.hqpds_configurations(is_active);
CREATE INDEX idx_machine_parameters_type ON public.machine_parameters(machine_type);
CREATE INDEX idx_machine_parameters_gauge ON public.machine_parameters(gauge_number);
CREATE INDEX idx_machine_parameters_status ON public.machine_parameters(maintenance_status);
CREATE INDEX idx_machine_parameters_configuration ON public.machine_parameters(hqpds_configuration_id);
CREATE INDEX idx_garment_parameters_type ON public.garment_parameters(garment_type);
CREATE INDEX idx_garment_parameters_model ON public.garment_parameters(garment_model);
CREATE INDEX idx_garment_parameters_size ON public.garment_parameters(size);
CREATE INDEX idx_knitting_parameters_stitch_type ON public.knitting_parameters(stitch_type);
CREATE INDEX idx_knitting_parameters_canvas_type ON public.knitting_parameters(canvas_type);
CREATE INDEX idx_knitting_parameters_knitting_mode ON public.knitting_parameters(knitting_mode);
CREATE INDEX idx_material_parameters_yarn_type ON public.material_parameters(yarn_type);
CREATE INDEX idx_material_parameters_yarn_brand ON public.material_parameters(yarn_brand);
CREATE INDEX idx_material_parameters_configuration ON public.material_parameters(hqpds_configuration_id);
CREATE INDEX idx_threads_thread_code ON public.threads(thread_code);
CREATE INDEX idx_threads_thread_name ON public.threads(thread_name);
CREATE INDEX idx_suppliers_business_name ON public.suppliers(business_name);
CREATE INDEX idx_suppliers_tax_id ON public.suppliers(tax_id);
CREATE INDEX idx_role_form_role_id ON public.role_form(role_id);
CREATE INDEX idx_role_form_form_id ON public.role_form(form_id);
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_forms_route ON public.forms(route);

-- Partial indexes for active (non-deleted) records
CREATE INDEX idx_hqpds_configurations_active ON public.hqpds_configurations(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_machine_parameters_active ON public.machine_parameters(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_garment_parameters_active ON public.garment_parameters(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knitting_parameters_active ON public.knitting_parameters(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_material_parameters_active ON public.material_parameters(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_threads_active ON public.threads(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_suppliers_active ON public.suppliers(id) WHERE deleted_at IS NULL;

-- =============================================
-- Soft-delete cascade trigger
-- =============================================

CREATE OR REPLACE FUNCTION public.cascade_soft_delete_hqpds()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    UPDATE public.machine_parameters  SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE public.garment_parameters  SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE public.knitting_parameters SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
    UPDATE public.material_parameters SET deleted_at = NEW.deleted_at WHERE hqpds_configuration_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_soft_delete_hqpds
  AFTER UPDATE OF deleted_at ON public.hqpds_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_soft_delete_hqpds();

-- =============================================
-- Funciones RBAC
-- =============================================

DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.has_permission(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT r.name
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id_auth = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.id_auth = auth.uid() AND r.name = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_permission(p_entity TEXT, p_operation TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.role_form rf ON rf.role_id = u.role_id
    JOIN public.forms f ON f.id = rf.form_id
    WHERE u.id_auth = auth.uid()
      AND f.entity = p_entity
      AND f.is_active = true
      AND CASE p_operation
        WHEN 'view' THEN rf.can_view
        WHEN 'create' THEN rf.can_create
        WHEN 'edit' THEN rf.can_edit
        WHEN 'delete' THEN rf.can_delete
        ELSE false
      END
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- RLS
-- =============================================

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id_auth = auth.uid());

CREATE POLICY "Admin can view all users"
  ON public.users FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (id_auth = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id_auth = auth.uid());

CREATE POLICY "Admin can update all users"
  ON public.users FOR UPDATE TO authenticated
  USING (public.is_admin());

-- hqpds_configurations
ALTER TABLE public.hqpds_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read hqpds_configurations"
  ON public.hqpds_configurations FOR SELECT TO authenticated
  USING (public.has_permission('hqpds_configurations', 'view'));

CREATE POLICY "Authenticated users can create hqpds_configurations"
  ON public.hqpds_configurations FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('hqpds_configurations', 'create'));

CREATE POLICY "Authenticated users can update hqpds_configurations"
  ON public.hqpds_configurations FOR UPDATE TO authenticated
  USING (public.has_permission('hqpds_configurations', 'edit'))
  WITH CHECK (public.has_permission('hqpds_configurations', 'edit'));

CREATE POLICY "Authenticated users can delete hqpds_configurations"
  ON public.hqpds_configurations FOR DELETE TO authenticated
  USING (public.has_permission('hqpds_configurations', 'delete'));

-- machine_parameters
ALTER TABLE public.machine_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read machine_parameters"
  ON public.machine_parameters FOR SELECT TO authenticated
  USING (public.has_permission('machine_parameters', 'view'));

CREATE POLICY "Authenticated users can create machine_parameters"
  ON public.machine_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('machine_parameters', 'create'));

CREATE POLICY "Authenticated users can update machine_parameters"
  ON public.machine_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('machine_parameters', 'edit'))
  WITH CHECK (public.has_permission('machine_parameters', 'edit'));

CREATE POLICY "Authenticated users can delete machine_parameters"
  ON public.machine_parameters FOR DELETE TO authenticated
  USING (public.has_permission('machine_parameters', 'delete'));

-- garment_parameters
ALTER TABLE public.garment_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read garment_parameters"
  ON public.garment_parameters FOR SELECT TO authenticated
  USING (public.has_permission('garment_parameters', 'view'));

CREATE POLICY "Authenticated users can create garment_parameters"
  ON public.garment_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('garment_parameters', 'create'));

CREATE POLICY "Authenticated users can update garment_parameters"
  ON public.garment_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('garment_parameters', 'edit'))
  WITH CHECK (public.has_permission('garment_parameters', 'edit'));

CREATE POLICY "Authenticated users can delete garment_parameters"
  ON public.garment_parameters FOR DELETE TO authenticated
  USING (public.has_permission('garment_parameters', 'delete'));

-- knitting_parameters
ALTER TABLE public.knitting_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read knitting_parameters"
  ON public.knitting_parameters FOR SELECT TO authenticated
  USING (public.has_permission('knitting_parameters', 'view'));

CREATE POLICY "Authenticated users can create knitting_parameters"
  ON public.knitting_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('knitting_parameters', 'create'));

CREATE POLICY "Authenticated users can update knitting_parameters"
  ON public.knitting_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('knitting_parameters', 'edit'))
  WITH CHECK (public.has_permission('knitting_parameters', 'edit'));

CREATE POLICY "Authenticated users can delete knitting_parameters"
  ON public.knitting_parameters FOR DELETE TO authenticated
  USING (public.has_permission('knitting_parameters', 'delete'));

-- material_parameters
ALTER TABLE public.material_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read material_parameters"
  ON public.material_parameters FOR SELECT TO authenticated
  USING (public.has_permission('material_parameters', 'view'));

CREATE POLICY "Authenticated users can create material_parameters"
  ON public.material_parameters FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('material_parameters', 'create'));

CREATE POLICY "Authenticated users can update material_parameters"
  ON public.material_parameters FOR UPDATE TO authenticated
  USING (public.has_permission('material_parameters', 'edit'))
  WITH CHECK (public.has_permission('material_parameters', 'edit'));

CREATE POLICY "Authenticated users can delete material_parameters"
  ON public.material_parameters FOR DELETE TO authenticated
  USING (public.has_permission('material_parameters', 'delete'));

-- threads
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read threads"
  ON public.threads FOR SELECT TO authenticated
  USING (public.has_permission('threads', 'view'));

CREATE POLICY "Authenticated users can create threads"
  ON public.threads FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('threads', 'create'));

CREATE POLICY "Authenticated users can update threads"
  ON public.threads FOR UPDATE TO authenticated
  USING (public.has_permission('threads', 'edit'))
  WITH CHECK (public.has_permission('threads', 'edit'));

CREATE POLICY "Authenticated users can delete threads"
  ON public.threads FOR DELETE TO authenticated
  USING (public.has_permission('threads', 'delete'));

-- suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read suppliers"
  ON public.suppliers FOR SELECT TO authenticated
  USING (public.has_permission('suppliers', 'view'));

CREATE POLICY "Authenticated users can create suppliers"
  ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('suppliers', 'create'));

CREATE POLICY "Authenticated users can update suppliers"
  ON public.suppliers FOR UPDATE TO authenticated
  USING (public.has_permission('suppliers', 'edit'))
  WITH CHECK (public.has_permission('suppliers', 'edit'));

CREATE POLICY "Authenticated users can delete suppliers"
  ON public.suppliers FOR DELETE TO authenticated
  USING (public.has_permission('suppliers', 'delete'));

-- roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roles"
  ON public.roles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage roles"
  ON public.roles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- forms
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read forms"
  ON public.forms FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage forms"
  ON public.forms FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- role_form
ALTER TABLE public.role_form ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read role_form"
  ON public.role_form FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage role_form"
  ON public.role_form FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- Grants
-- =============================================

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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.threads TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.threads_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.suppliers TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.suppliers_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.roles TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.roles_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forms TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.forms_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.role_form TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.role_form_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.users_id_seq TO authenticated;

-- =============================================
-- Seed: roles por defecto
-- =============================================

INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrador con acceso total al sistema'),
  ('supervisor', 'Supervisor con acceso de lectura y edición'),
  ('usuario', 'Usuario con acceso básico de lectura');

-- =============================================
-- Seed: forms (módulos del sistema)
-- =============================================

INSERT INTO public.forms (name, route, entity, icon, sort_order) VALUES
  ('Dashboard', '/', NULL, 'Dashboard', 1),
  ('Máquinas', '/maquinas', 'machine_parameters', 'PrecisionManufacturing', 2),
  ('Prendas', '/prendas', 'garment_parameters', 'Checkroom', 3),
  ('Tejido', '/tejido', 'knitting_parameters', 'Insights', 4),
  ('Materiales', '/materiales', 'material_parameters', 'Inventory2', 5),
  ('Programa Hqpds', '/programas', 'hqpds_configurations', 'SdStorage', 6),
  ('Hilos', '/hilos', 'threads', 'Cable', 7),
  ('Proveedores', '/proveedores', 'suppliers', 'LocalShipping', 8),
  ('Gestión de Usuarios', '/admin/usuarios', 'users', 'People', 100),
  ('Gestión de Roles', '/admin/roles', 'roles', 'AdminPanelSettings', 101);

-- =============================================
-- Seed: permisos por rol
-- =============================================

-- Admin: acceso total
INSERT INTO public.role_form (role_id, form_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, f.id, true, true, true, true
FROM public.roles r, public.forms f
WHERE r.name = 'admin';

-- Supervisor: todo excepto admin pages y eliminar
INSERT INTO public.role_form (role_id, form_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, f.id, true, true, true, false
FROM public.roles r, public.forms f
WHERE r.name = 'supervisor' AND f.sort_order < 100;

-- Usuario: solo lectura de módulos básicos
INSERT INTO public.role_form (role_id, form_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, f.id, true, false, false, false
FROM public.roles r, public.forms f
WHERE r.name = 'usuario' AND f.sort_order < 100;

COMMIT;

NOTIFY pgrst, 'reload schema';
