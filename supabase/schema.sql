-- ═══════════════════════════════════════════════════════════════════════════
-- Beta Clinic — Protocolo Omega
-- Script SQL COMPLETO de inicialización para Supabase
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Instrucciones:
--   1. Abre tu proyecto en https://supabase.com/dashboard
--   2. Ve a "SQL Editor" (barra lateral izquierda)
--   3. Clic en "New query"
--   4. Pega TODO este script
--   5. Clic en "Run" (Ctrl/Cmd + Enter)
--   6. Verifica en "Table Editor" que las 8 tablas aparezcan
--
-- ⚠️  Este script hace DROP CASCADE — borra todo y recrea desde cero.
--     Solo córrelo en bases de datos que puedas resetear.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- 0. LIMPIEZA TOTAL
-- ─────────────────────────────────────────────────────────────────────────

-- Eliminar trigger primero (depende de auth.users que no borramos)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar vistas
DROP VIEW IF EXISTS tomorrow_appointments CASCADE;
DROP VIEW IF EXISTS low_stock_items CASCADE;
DROP VIEW IF EXISTS monthly_balance CASCADE;

-- Eliminar tablas en orden inverso de dependencia
DROP TABLE IF EXISTS reminders      CASCADE;
DROP TABLE IF EXISTS lab_orders     CASCADE;
DROP TABLE IF EXISTS dental_labs    CASCADE;
DROP TABLE IF EXISTS finance        CASCADE;
DROP TABLE IF EXISTS transactions   CASCADE;  -- nombre anterior, por si existe
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS inventory      CASCADE;
DROP TABLE IF EXISTS appointments   CASCADE;
DROP TABLE IF EXISTS treatments     CASCADE;
DROP TABLE IF EXISTS patients       CASCADE;
DROP TABLE IF EXISTS profiles       CASCADE;

-- Eliminar tipos enum
DROP TYPE IF EXISTS reminder_channel  CASCADE;
DROP TYPE IF EXISTS lab_order_status  CASCADE;
DROP TYPE IF EXISTS inventory_category CASCADE;
DROP TYPE IF EXISTS patient_status    CASCADE;
DROP TYPE IF EXISTS expense_category  CASCADE;
DROP TYPE IF EXISTS transaction_type  CASCADE;
DROP TYPE IF EXISTS payment_method    CASCADE;
DROP TYPE IF EXISTS clinic_specialty  CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS app_role          CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;


-- ─────────────────────────────────────────────────────────────────────────
-- 1. TIPOS ENUM
-- ─────────────────────────────────────────────────────────────────────────

CREATE TYPE app_role           AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE clinic_specialty   AS ENUM ('general', 'dental', 'pediatrics', 'nutrition');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_method     AS ENUM ('cash', 'card', 'transfer', 'insurance');
CREATE TYPE transaction_type   AS ENUM ('income', 'expense');
CREATE TYPE expense_category   AS ENUM ('rent', 'utilities', 'payroll', 'supplies', 'maintenance', 'marketing', 'other');
CREATE TYPE patient_status     AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE inventory_category AS ENUM ('medication', 'supply', 'equipment');
CREATE TYPE lab_order_status   AS ENUM ('pending', 'sent', 'received', 'delivered');
CREATE TYPE reminder_channel   AS ENUM ('whatsapp', 'sms', 'email');


-- ─────────────────────────────────────────────────────────────────────────
-- 2. TABLA: profiles
--    Vinculada 1:1 a auth.users. Se crea automáticamente al registrarse.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        app_role         NOT NULL DEFAULT 'patient',
  full_name   text             NOT NULL DEFAULT '',
  specialty   clinic_specialty,
  phone       text,
  avatar_url  text,
  license_no  text,
  created_at  timestamptz      NOT NULL DEFAULT now(),
  updated_at  timestamptz      NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles           IS 'Perfil extendido de cada usuario, 1:1 con auth.users';
COMMENT ON COLUMN profiles.role      IS 'Rol del usuario en la plataforma (default: patient)';
COMMENT ON COLUMN profiles.license_no IS 'Número de colegiado activo (solo doctores)';


-- ─────────────────────────────────────────────────────────────────────────
-- 3. TABLA: patients
--    Datos médicos. user_id es opcional (se llena si el paciente crea cuenta).
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE patients (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          uuid REFERENCES profiles(id) ON DELETE SET NULL,
  first_name       text             NOT NULL,
  last_name        text             NOT NULL,
  document_id      text,
  gender           char(1)          CHECK (gender IN ('M', 'F')),
  dob              date,
  phone            text,
  email            text,
  blood_type       text,
  allergies        text[]           NOT NULL DEFAULT '{}',
  insurance        text,
  status           patient_status   NOT NULL DEFAULT 'active',
  last_visit       date,
  created_at       timestamptz      NOT NULL DEFAULT now(),
  updated_at       timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_user   ON patients(user_id);
CREATE INDEX idx_patients_name   ON patients(last_name, first_name);
CREATE INDEX idx_patients_status ON patients(status);

COMMENT ON TABLE  patients IS 'Pacientes de la clínica';
COMMENT ON COLUMN patients.document_id IS 'DPI o pasaporte';


-- ─────────────────────────────────────────────────────────────────────────
-- 4. TABLA: treatments
--    Catálogo de servicios/procedimientos y sus precios.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE treatments (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text             NOT NULL,
  description   text,
  specialty     clinic_specialty NOT NULL DEFAULT 'general',
  price_usd     numeric(10,2)   NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  price_gtq     numeric(10,2)   GENERATED ALWAYS AS (price_usd * 7.75) STORED,
  duration_min  integer          NOT NULL DEFAULT 30 CHECK (duration_min > 0),
  active        boolean          NOT NULL DEFAULT true,
  created_at    timestamptz      NOT NULL DEFAULT now(),
  updated_at    timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX idx_treatments_specialty ON treatments(specialty);
CREATE INDEX idx_treatments_active    ON treatments(active) WHERE active = true;

COMMENT ON TABLE  treatments IS 'Catálogo de servicios médicos y sus precios (USD / GTQ)';
COMMENT ON COLUMN treatments.price_gtq IS 'Precio en Quetzales — calculado automáticamente (USD × 7.75)';
COMMENT ON COLUMN treatments.duration_min IS 'Duración estimada del procedimiento en minutos';


-- ─────────────────────────────────────────────────────────────────────────
-- 5. TABLA: appointments
--    Citas con fecha, estado y relación a doctor/paciente.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE appointments (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id     uuid               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id    bigint             NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_id  bigint             REFERENCES treatments(id) ON DELETE SET NULL,
  start_time    timestamptz        NOT NULL,
  end_time      timestamptz        NOT NULL,
  status        appointment_status NOT NULL DEFAULT 'pending',
  type          clinic_specialty   NOT NULL DEFAULT 'general',
  reason        text,
  notes         text,
  room          text,
  created_at    timestamptz        NOT NULL DEFAULT now(),
  updated_at    timestamptz        NOT NULL DEFAULT now(),

  CONSTRAINT chk_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_appt_doctor  ON appointments(doctor_id, start_time);
CREATE INDEX idx_appt_patient ON appointments(patient_id);
CREATE INDEX idx_appt_status  ON appointments(status);
CREATE INDEX idx_appt_time    ON appointments(start_time);

COMMENT ON TABLE appointments IS 'Citas médicas — vincula doctor, paciente y tratamiento';


-- ─────────────────────────────────────────────────────────────────────────
-- 6. TABLA: medical_records
--    Historial clínico — datos flexibles en JSONB.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE medical_records (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id      bigint        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id  bigint        REFERENCES appointments(id) ON DELETE SET NULL,
  record_type     clinic_specialty NOT NULL DEFAULT 'general',
  diagnosis       text,
  notes           text,
  data            jsonb         NOT NULL DEFAULT '{}'::jsonb,
  attachments     text[]        NOT NULL DEFAULT '{}',
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_medrec_patient ON medical_records(patient_id);
CREATE INDEX idx_medrec_doctor  ON medical_records(doctor_id);
CREATE INDEX idx_medrec_type    ON medical_records(record_type);
CREATE INDEX idx_medrec_data    ON medical_records USING gin(data);

COMMENT ON TABLE  medical_records IS 'Historial clínico — notas, diagnósticos y datos específicos por especialidad';
COMMENT ON COLUMN medical_records.data IS 'Datos flexibles en JSONB: odontograma, curvas de crecimiento, planes nutricionales, etc.';
COMMENT ON COLUMN medical_records.attachments IS 'URLs de archivos adjuntos (radiografías, fotos, etc.)';


-- ─────────────────────────────────────────────────────────────────────────
-- 7. TABLA: inventory
--    Stock de insumos, medicamentos y equipos.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE inventory (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_name        text               NOT NULL,
  sku              text               UNIQUE,
  category         inventory_category NOT NULL DEFAULT 'supply',
  quantity         integer            NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock        integer            NOT NULL DEFAULT 5,
  unit_price_usd   numeric(10,2)     NOT NULL DEFAULT 0,
  expiration_date  date,
  supplier         text,
  created_at       timestamptz        NOT NULL DEFAULT now(),
  updated_at       timestamptz        NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_category  ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity) WHERE quantity <= 5;

COMMENT ON TABLE  inventory IS 'Inventario de insumos, medicamentos y equipos';
COMMENT ON COLUMN inventory.min_stock IS 'Cantidad mínima antes de alerta de reabastecimiento';


-- ─────────────────────────────────────────────────────────────────────────
-- 8. TABLA: dental_labs
--    Directorio de laboratorios dentales externos.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE dental_labs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text    NOT NULL,
  contact    text    NOT NULL,
  whatsapp   text    NOT NULL,
  services   text[]  NOT NULL DEFAULT '{}',
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE dental_labs IS 'Laboratorios dentales externos (prótesis, coronas, guardas)';


-- ─────────────────────────────────────────────────────────────────────────
-- 9. TABLA: lab_orders
--    Órdenes de trabajo a laboratorios dentales.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE lab_orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id  bigint           NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lab_id      bigint           NOT NULL REFERENCES dental_labs(id) ON DELETE RESTRICT,
  doctor_id   uuid             NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_type   text             NOT NULL,
  tooth       text             NOT NULL,
  shade_code  text,
  status      lab_order_status NOT NULL DEFAULT 'pending',
  due_date    date             NOT NULL,
  notes       text,
  created_at  timestamptz      NOT NULL DEFAULT now(),
  updated_at  timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX idx_lab_orders_status  ON lab_orders(status);
CREATE INDEX idx_lab_orders_lab     ON lab_orders(lab_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_due     ON lab_orders(due_date);

COMMENT ON TABLE lab_orders IS 'Órdenes de trabajo enviadas a laboratorios dentales (Kanban)';


-- ─────────────────────────────────────────────────────────────────────────
-- 10. TABLA: finance
--     Registro financiero: ingresos y egresos de la clínica.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE finance (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type            transaction_type NOT NULL,
  concept         text             NOT NULL,
  amount_usd      numeric(10,2)   NOT NULL CHECK (amount_usd > 0),
  amount_gtq      numeric(10,2)   GENERATED ALWAYS AS (amount_usd * 7.75) STORED,
  category        expense_category,
  payment_method  payment_method,
  patient_id      bigint          REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id  bigint          REFERENCES appointments(id) ON DELETE SET NULL,
  treatment_id    bigint          REFERENCES treatments(id) ON DELETE SET NULL,
  voided          boolean         NOT NULL DEFAULT false,
  receipt_url     text,
  date            date            NOT NULL DEFAULT CURRENT_DATE,
  notes           text,
  created_at      timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_type    ON finance(type);
CREATE INDEX idx_finance_date    ON finance(date);
CREATE INDEX idx_finance_patient ON finance(patient_id);

COMMENT ON TABLE  finance IS 'Registro financiero: ingresos (consultas) y gastos (nómina, insumos, etc.)';
COMMENT ON COLUMN finance.amount_gtq IS 'Monto en Quetzales — calculado automáticamente (USD × 7.75)';
COMMENT ON COLUMN finance.voided IS 'Transacción anulada — se preserva pero no cuenta en totales';


-- ─────────────────────────────────────────────────────────────────────────
-- 11. TABLA: reminders
--     Log de recordatorios enviados a pacientes.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE reminders (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id  bigint           NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      bigint           NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  channel         reminder_channel NOT NULL DEFAULT 'whatsapp',
  message         text             NOT NULL,
  sent_at         timestamptz      NOT NULL DEFAULT now(),
  delivered       boolean          NOT NULL DEFAULT false
);

CREATE INDEX idx_reminders_appt ON reminders(appointment_id);

COMMENT ON TABLE reminders IS 'Log de recordatorios enviados a pacientes';


-- ═══════════════════════════════════════════════════════════════════════════
-- 12. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helper: función reutilizable para obtener el rol del usuario actual ──

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_role() IS 'Retorna el app_role del usuario autenticado. Usada en políticas RLS.';


-- ── profiles ──────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios leen su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff lee todos los perfiles"
  ON profiles FOR SELECT
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── patients ──────────────────────────────────────────────────────────────

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

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
  USING (user_id = auth.uid());


-- ── treatments ────────────────────────────────────────────────────────────

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver tratamientos activos"
  ON treatments FOR SELECT
  USING (active = true);

CREATE POLICY "Staff gestiona tratamientos"
  ON treatments FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── appointments ──────────────────────────────────────────────────────────

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor ve sus citas"
  ON appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Admin ve todas las citas"
  ON appointments FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Paciente ve sus citas"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = appointments.patient_id
        AND pt.user_id = auth.uid()
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

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

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
        AND pt.user_id = auth.uid()
    )
  );


-- ── inventory ─────────────────────────────────────────────────────────────

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestiona inventario"
  ON inventory FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── dental_labs ───────────────────────────────────────────────────────────

ALTER TABLE dental_labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestiona laboratorios"
  ON dental_labs FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── lab_orders ────────────────────────────────────────────────────────────

ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestiona órdenes de lab"
  ON lab_orders FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── finance ───────────────────────────────────────────────────────────────

ALTER TABLE finance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestiona finanzas"
  ON finance FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ── reminders ─────────────────────────────────────────────────────────────

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestiona recordatorios"
  ON reminders FOR ALL
  USING (public.get_my_role() IN ('doctor', 'admin'));


-- ═══════════════════════════════════════════════════════════════════════════
-- 13. TRIGGERS Y FUNCIONES
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Auto-crear profile cuando un usuario se registra en Supabase Auth ────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      CONCAT_WS(' ',
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
      )
    ),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.app_role,
      'patient'
    )
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger: crea perfil automáticamente al registrarse un usuario nuevo';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── Auto-actualizar updated_at ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar a todas las tablas con updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'patients', 'treatments', 'appointments',
      'medical_records', 'inventory', 'dental_labs', 'lab_orders'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at '
      'BEFORE UPDATE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();',
      tbl
    );
  END LOOP;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- 14. VISTAS ÚTILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Citas de mañana (para el Centro de Recordatorios)
CREATE OR REPLACE VIEW tomorrow_appointments AS
SELECT
  a.id AS appointment_id,
  a.start_time,
  a.end_time,
  a.type,
  a.status,
  a.reason,
  p.first_name || ' ' || p.last_name AS patient_name,
  p.phone AS patient_phone,
  pr.full_name AS doctor_name,
  pr.specialty,
  t.name AS treatment_name
FROM appointments a
JOIN patients p  ON p.id  = a.patient_id
JOIN profiles pr ON pr.id = a.doctor_id
LEFT JOIN treatments t ON t.id = a.treatment_id
WHERE a.start_time::date = CURRENT_DATE + INTERVAL '1 day'
  AND a.status NOT IN ('cancelled')
ORDER BY a.start_time;

-- Inventario bajo stock
CREATE OR REPLACE VIEW low_stock_items AS
SELECT
  id, item_name, sku, category, quantity, min_stock, expiration_date,
  CASE
    WHEN quantity = 0             THEN 'agotado'
    WHEN quantity <= min_stock    THEN 'bajo'
    ELSE 'ok'
  END AS stock_status
FROM inventory
WHERE quantity <= min_stock
ORDER BY quantity ASC;

-- Balance financiero del mes actual
CREATE OR REPLACE VIEW monthly_balance AS
SELECT
  type,
  COUNT(*)                                    AS tx_count,
  SUM(amount_usd) FILTER (WHERE NOT voided)   AS total_usd,
  SUM(amount_gtq) FILTER (WHERE NOT voided)   AS total_gtq,
  SUM(amount_usd) FILTER (WHERE voided)        AS voided_usd
FROM finance
WHERE date >= date_trunc('month', CURRENT_DATE)
  AND date <  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY type;


-- ═══════════════════════════════════════════════════════════════════════════
-- 15. DATOS SEMILLA (Seed Data)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO treatments (name, description, specialty, price_usd, duration_min) VALUES
  -- General
  ('Consulta General',        'Evaluación médica general',                       'general',     25.00,  30),
  ('Control de Seguimiento',  'Visita de seguimiento post-tratamiento',          'general',     15.00,  20),
  ('Certificado Médico',      'Certificado de salud para trabajo o estudios',    'general',     10.00,  15),

  -- Dental
  ('Limpieza Dental',         'Profilaxis dental completa con ultrasonido',      'dental',      35.00,  45),
  ('Extracción Simple',       'Extracción de pieza dental sin complicaciones',   'dental',      30.00,  30),
  ('Resina Dental',           'Restauración con resina compuesta',               'dental',      40.00,  40),
  ('Corona de Zirconia',      'Corona completa de zirconia sobre pilar',         'dental',     250.00,  60),
  ('Blanqueamiento Dental',   'Blanqueamiento LED en consultorio',               'dental',     120.00,  90),
  ('Endodoncia (1 conducto)', 'Tratamiento de conducto — 1 raíz',               'dental',     150.00,  60),
  ('Ortodoncia — Mensualidad','Control mensual de brackets/alineadores',         'dental',      50.00,  30),

  -- Pediatrics
  ('Consulta Pediátrica',     'Evaluación de crecimiento y desarrollo',          'pediatrics',  30.00,  30),
  ('Control de Niño Sano',    'Evaluación preventiva según edad',                'pediatrics',  25.00,  30),
  ('Vacunación',              'Aplicación de vacuna (vacuna no incluida)',        'pediatrics',  10.00,  15),

  -- Nutrition
  ('Consulta Nutricional',    'Evaluación de composición corporal y plan',       'nutrition',   30.00,  45),
  ('Plan Alimenticio',        'Diseño de plan nutricional personalizado',        'nutrition',   45.00,  60),
  ('Control Nutricional',     'Seguimiento de progreso y ajuste de plan',        'nutrition',   20.00,  30);


-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Beta Clinic — Base de datos inicializada exitosamente
--
-- Resumen:
--   • 8 tablas: profiles, patients, treatments, appointments,
--               medical_records, inventory, dental_labs, lab_orders
--   • 2 tablas auxiliares: finance, reminders
--   • 10 tipos enum
--   • RLS habilitado en todas las tablas
--   • Trigger auto-profile en auth.users → profiles
--   • Trigger auto-updated_at en 8 tablas
--   • 3 vistas: tomorrow_appointments, low_stock_items, monthly_balance
--   • 16 tratamientos semilla (4 especialidades)
-- ═══════════════════════════════════════════════════════════════════════════
