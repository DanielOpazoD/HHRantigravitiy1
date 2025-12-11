# Hospital Hanga Roa - Sistema de Gestión de Camas

Sistema web para la gestión de censo hospitalario, seguimiento de pacientes, y reportes estadísticos del Hospital Hanga Roa.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Tests
npm run test

# Build producción
npm run build
```

## 📁 Arquitectura del Proyecto

```
├── App.tsx                    # Componente raíz
├── components/
│   ├── ui/                    # Componentes UI reutilizables
│   │   ├── DebouncedInput.tsx
│   │   └── SyncStatusIndicator.tsx
│   ├── modals/                # Modales
│   ├── patient-row/           # Componentes de fila de paciente
│   ├── PatientRow.tsx
│   ├── Navbar.tsx
│   ├── DateStrip.tsx
│   └── SyncWatcher.tsx        # Observa sync y muestra toasts
│
├── views/
│   ├── census/                # Sub-componentes del censo
│   ├── cudyr/                 # Sub-componentes CUDYR
│   ├── handoff/               # Sub-componentes entrega de turno
│   └── [View].tsx             # Vistas principales
│
├── hooks/
│   ├── useDailyRecord.ts      # Hook principal de datos
│   ├── useBedManagement.ts    # Gestión de camas
│   ├── useClinicalCrib.ts     # Cunas clínicas
│   ├── usePatientDischarges.ts
│   ├── usePatientTransfers.ts
│   └── useNurseManagement.ts
│
├── services/
│   ├── storage/
│   │   └── localStorageService.ts   # Persistencia local
│   ├── repositories/
│   │   └── DailyRecordRepository.ts # Patrón Repository
│   ├── factories/
│   │   └── patientFactory.ts        # Creación de pacientes
│   ├── calculations/
│   │   └── statsCalculator.ts       # Estadísticas
│   ├── utils/
│   │   ├── dateFormatter.ts
│   │   └── demoDataGenerator.ts
│   ├── firestoreService.ts          # Firebase sync
│   └── dataService.ts               # Barrel export (legacy)
│
├── context/
│   ├── DailyRecordContext.tsx
│   ├── ConfirmDialogContext.tsx
│   └── NotificationContext.tsx
│
├── types/
│   ├── index.ts                     # Tipos principales
│   └── valueTypes.ts                # Tipos de valores
│
└── tests/
    ├── statsCalculator.test.ts
    ├── cudyrScoreUtils.test.ts
    └── usePatientDischarges.test.ts
```

## 🏗️ Patrones de Diseño

### Repository Pattern
```typescript
// Acceso a datos unificado
import { DailyRecordRepository } from './services/repositories/DailyRecordRepository';

await DailyRecordRepository.save(record);
const record = DailyRecordRepository.getForDate('2024-01-15');
```

### Composición de Hooks
```typescript
// Hook principal compone sub-hooks
const dailyRecordHook = useDailyRecord(dateString);
// Internamente usa: useBedManagement, useClinicalCrib, usePatientDischarges, etc.
```

### Context para Estado Global
- `DailyRecordContext` - Estado del censo diario
- `ConfirmDialogContext` - Diálogos de confirmación
- `NotificationContext` - Toast notifications

## 🔄 Sincronización

- **localStorage** → Persistencia offline instantánea
- **Firestore** → Sincronización en tiempo real multi-usuario
- **SyncWatcher** → Observa errores y muestra toasts

## 🧪 Testing

```bash
npm run test        # Ejecutar tests
npm run test:watch  # Modo watch
```

Cobertura actual: ~35% (28 tests)

## 📊 Módulos

| Módulo | Descripción |
|--------|-------------|
| Censo Diario | Gestión de pacientes y camas |
| CUDYR | Evaluación de dependencia/riesgo |
| Entrega Turno | Resumen para cambio de turno |
| Reportes | Exportación PDF/Excel |
| Estadísticas | Métricas y análisis |

## 🛠️ Tecnologías

- **React 18** + TypeScript
- **Vite** (build)
- **Firebase** (auth + Firestore)
- **Tailwind CSS** (estilos)
- **Vitest** (testing)
- **Lucide React** (iconos)
