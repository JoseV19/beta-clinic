-- ═══════════════════════════════════════════════════════════════════════════
-- Beta Clinic — Migración: Adaptar schema para Clerk + Supabase
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Problema: Clerk user IDs son texto (e.g. 'user_2NNEq...'), no UUIDs.
--           El schema original usa `uuid` para profiles.id y FKs.
--           `auth.uid()` intenta castear a uuid y falla con Clerk IDs.
--
-- Solución:
--   1. Cambiar profiles.id y todas las FKs de uuid → text
--   2. Reemplazar auth.uid() por (auth.jwt()->>'sub') en RLS
--   3. Eliminar trigger on_auth_user_created (Clerk maneja auth)
--   4. Agregar política INSERT para auto-crear perfil desde el frontend
--
-- Instrucciones: Corre esto en SQL Editor DESPUÉS del schema.sql principal.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- 1. ELIMINAR TRIGGER de auth.users (ya no se usa — Clerk maneja auth)
-- ─────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;


-- ─────────────────────────────────────────────────────────────────────────
-- 2. CAMBIAR COLUMNAS uuid → text
-- ─────────────────────────────────────────────────────────────────────────

-- Primero quitar todas las FKs que apuntan a profiles(id)
ALTER TABLE patients        DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE appointments    DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_doctor_id_fkey;
ALTER TABLE lab_orders      DROP CONSTRAINT IF EXISTS lab_orders_doctor_id_fkey;

-- Quitar FK de profiles → auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Cambiar tipos de columna
ALTER TABLE profiles        ALTER COLUMN id        TYPE text;
ALTER TABLE patients        ALTER COLUMN user_id   TYPE text;
ALTER TABLE appointments    ALTER COLUMN doctor_id TYPE text;
ALTER TABLE medical_records ALTER COLUMN doctor_id TYPE text;
ALTER TABLE lab_orders      ALTER COLUMN doctor_id TYPE text;

-- Recrear PK en profiles
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Recrear FKs
ALTER TABLE patients
  ADD CONSTRAINT patients_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE medical_records
  ADD CONSTRAINT medical_records_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE lab_orders
  ADD CONSTRAINT lab_orders_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────
-- 3. ACTUALIZAR get_my_role() para usar JWT sub
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles
  WHERE id = (SELECT auth.jwt() ->> 'sub');
$$;


-- ─────────────────────────────────────────────────────────────────────────
-- 4. RECREAR TODAS LAS POLÍTICAS RLS (auth.uid() → auth.jwt()->>'sub')
-- ─────────────────────────────────────────────────────────────────────────

-- Helper: función para obtener el sub del JWT
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'sub')::text;
$$;


-- ── profiles ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Usuarios leen su propio perfil"      ON profiles;
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Staff lee todos los perfiles"        ON profiles;

CREATE POLICY "Usuarios leen su propio perfil"
  ON profiles FOR SELECT
  USING (public.requesting_user_id() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  USING (public.requesting_user_id() = id)
  WITH CHECK (public.requesting_user_id() = id);

CREATE POLICY "Staff lee todos los perfiles"
  ON profiles FOR SELECT
  USING (public.get_my_role() IN ('doctor', 'admin'));

-- NUEVO: Permitir auto-crear perfil (el frontend lo hace al primer login)
CREATE POLICY "Usuario crea su propio perfil"
  ON profiles FOR INSERT
  WITH CHECK (public.requesting_user_id() = id);


-- ── patients ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff ve todos los pacientes"   ON patients;
DROP POLICY IF EXISTS "Staff crea pacientes"           ON patients;
DROP POLICY IF EXISTS "Staff actualiza pacientes"      ON patients;
DROP POLICY IF EXISTS "Staff elimina pacientes"        ON patients;
DROP POLICY IF EXISTS "Paciente ve su propio registro" ON patients;

CREATE POLICY "Staff ve todos los pacientes"
  ON patients FOR SELECT
  USING (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff crea pacientes"
  ON patients FOR INSERT
  WITH CHECK (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff actualiza pacientes"
  ON patients FOR UPDATE
  USING (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff elimina pacientes"
  ON patients FOR DELETE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Paciente ve su propio registro"
  ON patients FOR SELECT
  USING (user_id = public.requesting_user_id());


-- ── treatments ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Cualquiera puede ver tratamientos activos" ON treatments;
DROP POLICY IF EXISTS "Staff gestiona tratamientos"              ON treatments;

CREATE POLICY "Cualquiera puede ver tratamientos activos"
  ON treatments FOR SELECT
  USING (active = true);

CREATE POLICY "Staff gestiona tratamientos"
  ON treatments FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── appointments ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Doctor ve sus citas"     ON appointments;
DROP POLICY IF EXISTS "Admin ve todas las citas" ON appointments;
DROP POLICY IF EXISTS "Paciente ve sus citas"   ON appointments;
DROP POLICY IF EXISTS "Staff crea citas"        ON appointments;
DROP POLICY IF EXISTS "Staff actualiza citas"   ON appointments;
DROP POLICY IF EXISTS "Admin elimina citas"     ON appointments;

CREATE POLICY "Doctor ve sus citas"
  ON appointments FOR SELECT
  USING (doctor_id = public.requesting_user_id());

CREATE POLICY "Admin ve todas las citas"
  ON appointments FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Paciente ve sus citas"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = appointments.patient_id
        AND pt.user_id = public.requesting_user_id()
    )
  );

CREATE POLICY "Staff crea citas"
  ON appointments FOR INSERT
  WITH CHECK (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff actualiza citas"
  ON appointments FOR UPDATE
  USING (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Admin elimina citas"
  ON appointments FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ── medical_records ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff ve todos los expedientes" ON medical_records;
DROP POLICY IF EXISTS "Staff crea expedientes"         ON medical_records;
DROP POLICY IF EXISTS "Staff actualiza expedientes"    ON medical_records;
DROP POLICY IF EXISTS "Paciente ve sus expedientes"    ON medical_records;

CREATE POLICY "Staff ve todos los expedientes"
  ON medical_records FOR SELECT
  USING (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff crea expedientes"
  ON medical_records FOR INSERT
  WITH CHECK (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Staff actualiza expedientes"
  ON medical_records FOR UPDATE
  USING (public.get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "Paciente ve sus expedientes"
  ON medical_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = medical_records.patient_id
        AND pt.user_id = public.requesting_user_id()
    )
  );


-- ── inventory ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff gestiona inventario" ON inventory;

CREATE POLICY "Staff gestiona inventario"
  ON inventory FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── dental_labs ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff gestiona laboratorios" ON dental_labs;

CREATE POLICY "Staff gestiona laboratorios"
  ON dental_labs FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── lab_orders ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff gestiona órdenes de lab" ON lab_orders;

CREATE POLICY "Staff gestiona órdenes de lab"
  ON lab_orders FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── finance ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff gestiona finanzas" ON finance;

CREATE POLICY "Staff gestiona finanzas"
  ON finance FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── reminders ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Staff gestiona recordatorios" ON reminders;

CREATE POLICY "Staff gestiona recordatorios"
  ON reminders FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Migración completada
--
-- Cambios:
--   • profiles.id: uuid → text (acepta Clerk user IDs)
--   • Todas las FKs actualizadas a text
--   • auth.uid() → requesting_user_id() en todas las políticas
--   • get_my_role() usa JWT sub
--   • Nueva política INSERT en profiles (auto-crear desde frontend)
--   • Eliminado trigger on_auth_user_created (ya no necesario)
-- ═══════════════════════════════════════════════════════════════════════════
