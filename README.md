# Beta Clinic - Sistema de Gestión Clínica

Software de gestión clínica especializado con una estética visual inspirada en el **Protocolo Omega** del universo de *Inazuma Eleven*. Combina una interfaz oscura y futurista con herramientas médicas reales: **Telemedicina** en tiempo real, generación de **Reportes RIPS** (Registro Individual de Prestación de Servicios de Salud) y un **Expediente Electrónico** completo con notas clínicas en formato SOAP, recetas con exportación a PDF y seguimiento de laboratorios con gráficos de tendencia.

---

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Interfaz de usuario basada en componentes |
| **Vite** | Bundler y servidor de desarrollo |
| **Tailwind CSS 4** | Sistema de estilos utility-first con tema personalizado |
| **React Router 7** | Navegación SPA con rutas protegidas y layout compartido |
| **Lucide React** | Iconografía consistente en toda la aplicación |
| **jsPDF** | Generación de recetas médicas en formato PDF |
| **TypeScript** | Tipado estático en todo el proyecto |

---

## Configuración

### Requisitos previos

- Node.js 18 o superior
- npm, pnpm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd beta-clinic

# Instalar dependencias
npm install
```

### Ejecución

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint
```

El servidor de desarrollo se levanta en `http://localhost:5173/` por defecto.

---

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── PatientDetail.tsx    Vista detallada de paciente con pestañas
│   │                        (info general, historial, recetas, laboratorios)
│   ├── PatientList.tsx      Tabla de pacientes con búsqueda y filtro
│   └── StatsCard.tsx        Tarjeta de estadística para dashboards
│
├── pages/             # Páginas principales de la aplicación
│   ├── Login.tsx            Autenticación con estética Protocolo Omega
│   ├── Dashboard.tsx        Panel de control con métricas y citas del día
│   ├── Agenda.tsx           Calendario semanal de citas
│   ├── Pacientes.tsx        Listado general de pacientes
│   ├── Consultas.tsx        Gestión de consultas con notas SOAP
│   ├── Finanzas.tsx         Control de ingresos y gastos
│   ├── Telemedicina.tsx     Videollamadas con sala de espera virtual
│   ├── ReportesRips.tsx     Exportación de reportes RIPS en JSON
│   ├── Recetas.tsx          Prescripción de medicamentos con PDF
│   ├── Laboratorios.tsx     Exámenes, carga de archivos y tendencias
│   └── Directorio.tsx       Directorio de profesionales de salud
│
├── layouts/
│   └── MainLayout.tsx       Layout principal con sidebar responsive
│
├── context/
│   └── ThemeContext.tsx      Proveedor de tema claro/oscuro
│
├── data/
│   └── patients.ts          Datos mock de pacientes compartidos
│
├── utils/
│   └── generateRipsJSON.ts  Generación y descarga de archivos RIPS
│
├── App.tsx                  Configuración de rutas
└── main.tsx                 Punto de entrada de la aplicación
```

---

## Funcionalidades Principales

- **Dashboard** — Métricas en tiempo real con acceso rápido a pacientes y citas.
- **Agenda** — Calendario semanal con bloques de citas por hora y estado.
- **Expediente Electrónico** — Historial clínico, notas SOAP, recetas y laboratorios por paciente.
- **Consultas** — Gestión completa con filtros por estado y formulario de notas médicas.
- **Telemedicina** — Sala de espera virtual con interfaz de videollamada simulada.
- **Recetas** — Prescripción de medicamentos con generación de PDF profesional.
- **Laboratorios** — Carga de resultados, seguimiento de exámenes y gráficos de tendencia.
- **Reportes RIPS** — Filtrado por rango de fechas y exportación en formato JSON.
- **Finanzas** — Registro de ingresos y gastos con balance general.
- **Directorio** — Tarjetas de profesionales con datos de contacto y disponibilidad.
- **Modo Oscuro** — Tema claro/oscuro con persistencia en localStorage.
- **Responsive** — Sidebar colapsable y diseño adaptativo para dispositivos móviles.

---

## Créditos

Desarrollado por **Zionak Studios**.
