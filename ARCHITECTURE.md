# Arquitectura del Sistema

## Visión General

Sistema de escritorio Electron con arquitectura en capas que separa la lógica de presentación (React), lógica de negocio (Services), acceso a datos (Repositories) y base de datos (Prisma + SQLite).

## Diagrama de Capas

```
┌─────────────────────────────────────────┐
│         Renderer Process (React)        │
│  - Componentes UI                       │
│  - Páginas / Vistas                     │
│  - Estado global (Zustand)              │
└─────────────────┬───────────────────────┘
                  │ IPC (contextBridge)
┌─────────────────▼───────────────────────┐
│          Main Process (Electron)        │
│  ┌───────────────────────────────────┐  │
│  │    IPC Handlers                   │  │
│  │    - auth, students, teachers...  │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │    Services (Business Logic)      │  │
│  │    - Validación                   │  │
│  │    - Reglas de negocio            │  │
│  │    - Auditoría                    │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │    Repositories (Data Access)     │  │
│  │    - CRUD operations              │  │
│  │    - Queries complejas            │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │    Prisma Client                  │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │
         ┌─────────▼─────────┐
         │   SQLite Database │
         └───────────────────┘
```

## Componentes Principales

### 1. Renderer Process (Frontend)

**Ubicación**: `src/renderer/`

Aplicación React que corre en el contexto del navegador de Electron. No tiene acceso directo a Node.js por seguridad.

**Responsabilidades**:
- Renderizar interfaz de usuario
- Capturar interacciones del usuario
- Comunicarse con main process via IPC
- Gestionar estado local de UI

**Tecnologías**:
- React 18
- React Router (navegación)
- Zustand (estado global)
- Tailwind CSS (estilos)

**Estructura**:
```
src/renderer/src/
├── components/        # Componentes reutilizables
│   └── Layout.tsx    # Layout principal con sidebar
├── pages/            # Páginas/vistas de la app
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Students.tsx
│   └── ...
├── stores/           # Zustand stores
│   └── authStore.ts
├── styles/           # CSS y configuración Tailwind
└── App.tsx           # Componente raíz + routing
```

### 2. Main Process (Backend)

**Ubicación**: `src/main/`

Proceso principal de Electron que tiene acceso completo a Node.js y el sistema operativo.

**Responsabilidades**:
- Crear ventanas de la aplicación
- Manejar IPC desde renderer
- Ejecutar lógica de negocio
- Acceder a base de datos
- Gestionar sesión de usuario
- Crear backups

**Componentes Clave**:

#### main.ts
Entry point que:
- Inicializa base de datos
- Crea ventana principal
- Registra IPC handlers
- Configura backups automáticos

#### preload.ts
Script que expone API segura al renderer via contextBridge:
```typescript
window.electronAPI = {
  auth: { login, logout, ... },
  students: { list, create, ... },
  // ...
}
```

#### database.ts
Gestión de base de datos:
- Inicialización de Prisma
- Path de DB en AppData
- Backups y restauración
- Cleanup de backups antiguos

#### session.ts
Gestión de sesión:
- Almacenamiento en memoria de sesión actual
- Timeout por inactividad
- Verificación de permisos por rol
- Middlewares de autenticación

#### handlers/
IPC handlers organizados por dominio:
- `auth.ts` - Login/logout
- `students.ts` - CRUD estudiantes
- `teachers.ts` - CRUD profesores
- `courses.ts` - CRUD cursos
- `grades.ts` - CRUD notas
- `users.ts` - Gestión de usuarios

Cada handler:
1. Verifica autenticación/permisos
2. Llama al service correspondiente
3. Retorna `{ success: boolean, data?, error? }`

### 3. Services (Lógica de Negocio)

**Ubicación**: `src/services/`

Capa que contiene reglas de negocio y validaciones.

**Responsabilidades**:
- Validar datos de entrada
- Aplicar reglas de negocio
- Coordinar operaciones complejas
- Registrar auditoría
- Calcular promedios, estadísticas

**Ejemplo** (studentService.ts):
```typescript
class StudentService {
  async create(data: CreateStudentDto, userId: number) {
    // 1. Validar datos
    this.validateStudentData(data)

    // 2. Llamar repository
    const student = await studentRepository.create(data)

    // 3. Registrar auditoría
    await auditLog.create({ userId, action: 'CREATE', ... })

    return student
  }
}
```

### 4. Repositories (Acceso a Datos)

**Ubicación**: `src/repositories/`

Capa de acceso a datos. Abstrae operaciones de base de datos.

**Responsabilidades**:
- Ejecutar queries con Prisma
- Aplicar filtros y búsquedas
- Joins y relaciones
- Paginación
- Ordenamiento

**Ejemplo** (studentRepository.ts):
```typescript
class StudentRepository {
  async findAll(filter?: StudentFilter) {
    const where: any = {}

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search } },
        { lastName: { contains: filter.search } }
      ]
    }

    return db.student.findMany({ where })
  }
}
```

### 5. Base de Datos (Prisma + SQLite)

**Ubicación**: `prisma/schema.prisma`

ORM type-safe que genera cliente TypeScript desde schema.

**Ventajas de Prisma**:
- Type safety completo
- Migraciones automáticas
- Query builder intuitivo
- Introspección de DB
- Studio GUI para explorar datos

**Ubicación de archivos**:
- **Desarrollo**: `./dev.db`
- **Producción**: `%APPDATA%/sistema-educativo/data/database.db`
- **Backups**: `%APPDATA%/sistema-educativo/backups/`

## Flujo de Datos

### Ejemplo: Crear Estudiante

```
1. Usuario llena formulario en Students.tsx
   ↓
2. Click en "Guardar"
   ↓
3. React llama: window.electronAPI.students.create(data)
   ↓
4. IPC envía mensaje al main process
   ↓
5. Handler students.ts recibe mensaje
   ↓
6. requireRole(['admin', 'teacher']) verifica permisos
   ↓
7. studentService.create(data, userId)
   - Valida datos (nombre, email, etc.)
   ↓
8. studentRepository.create(data)
   - Ejecuta INSERT en DB via Prisma
   ↓
9. Service registra auditoría
   ↓
10. Handler retorna { success: true, data: student }
    ↓
11. IPC envía respuesta a renderer
    ↓
12. React actualiza UI con nuevo estudiante
```

## Seguridad

### Context Isolation

Renderer NO tiene acceso directo a Node.js. Solo puede usar la API expuesta en preload.ts.

```typescript
// ❌ NO disponible en renderer
const fs = require('fs')

// ✅ Disponible via API segura
window.electronAPI.students.create(...)
```

### Validación en Capas

Los datos se validan en múltiples niveles:

1. **Frontend**: Validación básica (campos requeridos, formatos)
2. **Service**: Validación de negocio (email único, rangos válidos)
3. **Prisma**: Constraints de DB (unique, foreign keys)

### Sesión y Autenticación

- Sesión almacenada solo en memoria del main process
- No se persiste en disco
- Timeout automático por inactividad
- Todos los handlers verifican sesión

### Passwords

- Hash con Argon2 (resistente a GPU attacks)
- Salt automático
- Nunca se almacenan en texto plano
- No se exponen en logs

## Gestión de Estado

### Estado Global (Zustand)

Solo para estado que necesita compartirse entre componentes:
- Sesión de usuario (`authStore`)
- Próximamente: notificaciones, configuración

### Estado Local (useState)

Para estado específico de componente:
- Formularios
- Modales
- Filtros de listados

### Estado del Servidor

Los datos de backend NO se duplican en stores globales. Se consultan cuando se necesitan y se cachean temporalmente en componente.

## Patrones de Diseño

### Repository Pattern

Separa lógica de acceso a datos de lógica de negocio.

**Ventajas**:
- Fácil cambiar DB (SQLite → PostgreSQL)
- Testing más fácil (mock repositories)
- Queries centralizadas

### Service Layer Pattern

Encapsula lógica de negocio independiente de UI y DB.

**Ventajas**:
- Reutilizable desde diferentes handlers
- Testing de reglas de negocio aislado
- Validaciones centralizadas

### Dependency Injection (Simple)

Services y repositories se exportan como singletons:

```typescript
export const studentService = new StudentService()
```

Fácil mockear en tests si es necesario.

## Migraciones de Base de Datos

### Crear Nueva Migración

```bash
npx prisma migrate dev --name descripcion_cambio
```

Genera:
- SQL en `prisma/migrations/`
- Actualiza `schema.prisma`
- Regenera Prisma Client

### Aplicar Migraciones en Producción

```bash
npx prisma migrate deploy
```

Solo aplica migraciones pendientes, no crea nuevas.

## Testing (Próximo)

### Unit Tests

- Services: Mockear repositories
- Repositories: DB en memoria o SQLite temporal
- Componentes React: React Testing Library

### Integration Tests

- IPC handlers con DB real
- Flujos completos end-to-end

### E2E Tests

- Spectron o Playwright para Electron
- Simular interacciones de usuario completas

## Performance

### Optimizaciones Actuales

1. **Índices en DB**: Campos frecuentemente consultados
2. **Paginación**: Listo en repositories (por implementar en UI)
3. **Lazy Loading**: React Router code splitting
4. **Debounce**: En búsquedas (por implementar)

### Optimizaciones Futuras

1. **Virtual Scrolling**: Para listas largas (react-window)
2. **Caching**: React Query para datos del servidor
3. **Web Workers**: Para cálculos pesados
4. **Índices compuestos**: En queries complejas

## Escalabilidad

### Límites Actuales (SQLite)

- **Escrituras concurrentes**: Limitadas
- **Tamaño DB**: Hasta ~1TB (más que suficiente)
- **Lecturas concurrentes**: Ilimitadas

### Para Instituciones Grandes

Migrar a PostgreSQL o SQL Server:
1. Cambiar `datasource` en schema.prisma
2. Crear nueva migración
3. Los repositories NO cambian (Prisma abstrae DB)

## Monitoreo y Logs

### Logs de Aplicación

- Console.log en desarrollo
- Próximamente: winston para logs en archivo
- Ubicación: `%APPDATA%/sistema-educativo/logs/`

### Auditoría

Tabla `audit_logs` registra:
- Quién hizo la acción (userId)
- Qué hizo (CREATE, UPDATE, DELETE)
- Sobre qué objeto (Student, Course, etc.)
- Cuándo (timestamp)

## Extensibilidad

### Agregar Nuevo Módulo

1. Schema Prisma + migración
2. Repository (CRUD básico)
3. Service (validaciones + lógica)
4. Handler (IPC)
5. Actualizar preload.ts
6. Componentes React

### Agregar Nueva Funcionalidad

Ejemplo: "Exportar curso a Excel"

1. Service: `exportService.courseToExcel(courseId)`
2. Handler: `reports:exportCourseExcel`
3. Preload: Exponer función
4. React: Botón "Exportar" llama a API

## Deployment

### Build Local

```bash
npm run build
```

Genera instalador en `release/`

### Distribución

- Instalador NSIS para Windows
- Auto-update (Electron Builder + servidor de actualizaciones)
- Firma de código (recomendado para producción)

## Recursos Adicionales

- [Electron Docs](https://www.electronjs.org/docs/latest)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
