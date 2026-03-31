-- =============================================
-- Políticas RLS para Supabase Storage
-- Bucket: kinit-files-01
--
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Crear el bucket si no existe (idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kinit-files-01', 'kinit-files-01', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Eliminar políticas existentes del bucket para evitar duplicados
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar archivos" ON storage.objects;

-- SELECT: usuarios autenticados pueden leer archivos del bucket
CREATE POLICY "Usuarios autenticados pueden leer archivos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kinit-files-01');

-- INSERT: usuarios autenticados pueden subir archivos al bucket
CREATE POLICY "Usuarios autenticados pueden subir archivos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kinit-files-01');

-- UPDATE: usuarios autenticados pueden actualizar (upsert) archivos del bucket
CREATE POLICY "Usuarios autenticados pueden actualizar archivos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'kinit-files-01')
  WITH CHECK (bucket_id = 'kinit-files-01');

-- DELETE: usuarios autenticados pueden eliminar archivos del bucket
CREATE POLICY "Usuarios autenticados pueden eliminar archivos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kinit-files-01');
