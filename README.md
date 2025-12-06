# Sistema Educativo

Sistema de gestión educativa local para Windows, diseñado para administrar estudiantes, profesores, materias, cursos y notas.

## Características

- Gestión de estudiantes, profesores, materias y cursos
- Registro y cálculo de notas con sistema de pesos configurable
- Generación de reportes (boletines, listados)
- Exportación a PDF y Excel
- Sistema de autenticación con roles (admin, teacher, viewer)
- Backups automáticos de base de datos
- Aplicación de escritorio local (sin internet requerido)

## Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS
- **Desktop**: Electron
- **Base de datos**: SQLite con Prisma ORM
- **Build**: Vite
- **Auth**: Argon2 para hash de passwords
- **State Management**: Zustand
- **Reports**: PDFKit y ExcelJS

## Requisitos

- Node.js 18 o superior
- Windows 10 o superior
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sistema-de-educativo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

El archivo `.env` contiene:

```env
DATABASE_URL="file:./dev.db"
SESSION_TIMEOUT_MINUTES=30
BACKUP_RETENTION_DAYS=30
AUTO_BACKUP_ENABLED=true
```

### 4. Inicializar la base de datos

Generar el cliente de Prisma:

```bash
npm run prisma:generate
```

Crear y migrar la base de datos:

```bash
npx prisma migrate dev --name init
```

Cargar datos iniciales (usuario admin):

```bash
npx prisma db seed
```

## Desarrollo

### Ejecutar en modo desarrollo

```bash
npm run electron:dev
```

Esto iniciará:
- Vite dev server en http://localhost:5173
- Electron con hot reload

### Credenciales por defecto

Después de ejecutar el seed, puedes iniciar sesión con:

- **Usuario**: `admin`
- **Contraseña**: `admin123`

**IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer inicio de sesión.

## Comandos disponibles

```bash
# Desarrollo
npm run dev              # Iniciar Vite dev server
npm run electron:dev     # Iniciar Electron en modo desarrollo

# Build
npm run build            # Build completo (TypeScript + Vite + Electron)
npm run build:dev        # Build sin packaging

# Base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Crear nueva migración
npm run prisma:studio    # Abrir Prisma Studio (GUI para DB)

# Utilidades
npm run typecheck        # Verificar tipos TypeScript
```

## Estructura del Proyecto

```
sistema-de-educativo/
├── prisma/
│   ├── schema.prisma          # Schema de la base de datos
│   └── seed.ts                # Datos iniciales
├── scripts/
│   └── init-db.ts             # Script de inicialización
├── src/
│   ├── main/                  # Electron main process
│   │   ├── handlers/          # IPC handlers por dominio
│   │   ├── main.ts            # Entry point principal
│   │   ├── preload.ts         # Preload script (API segura)
│   │   ├── database.ts        # Configuración DB
│   │   └── session.ts         # Gestión de sesión
│   ├── renderer/              # Aplicación React
│   │   ├── src/
│   │   │   ├── components/    # Componentes reutilizables
│   │   │   ├── pages/         # Páginas/vistas
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── styles/        # CSS/Tailwind
│   │   │   ├── App.tsx        # App principal
│   │   │   └── main.tsx       # Entry point renderer
│   │   └── index.html
│   ├── services/              # Lógica de negocio
│   ├── repositories/          # Acceso a datos
│   └── types/                 # TypeScript types compartidos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Base de Datos

### Schema Principal

- **roles**: Roles de usuario (admin, teacher, viewer)
- **users**: Usuarios del sistema
- **teachers**: Información de profesores
- **students**: Información de estudiantes
- **subjects**: Materias
- **courses**: Cursos (materia + profesor + periodo)
- **enrollments**: Inscripciones de estudiantes a cursos
- **grades**: Notas de los estudiantes
- **audit_logs**: Registro de auditoría

### Backups

Los backups se crean automáticamente:

- **Ubicación**: `%APPDATA%/sistema-educativo/backups/`
- **Frecuencia**: Diario a las 2 AM (si AUTO_BACKUP_ENABLED=true)
- **Retención**: 30 días por defecto (configurable)

#### Crear backup manual

Desde la aplicación:
1. Ir a Configuración
2. Click en "Crear Backup"

#### Restaurar backup

Desde la aplicación:
1. Ir a Configuración
2. Seleccionar backup de la lista
3. Click en "Restaurar"

**ADVERTENCIA**: La restauración sobrescribe la base de datos actual.

## Roles y Permisos

### Admin
- Acceso completo a todas las funciones
- Crear/editar/eliminar: estudiantes, profesores, materias, cursos, notas
- Gestionar usuarios y roles
- Crear y restaurar backups

### Teacher
- Ver todos los estudiantes y profesores
- Crear/editar estudiantes
- Ver todas las materias
- Crear/editar/eliminar solo sus propios cursos
- Crear/editar notas solo en sus cursos
- Generar reportes de sus cursos

### Viewer
- Solo lectura en todas las secciones
- No puede crear, editar o eliminar datos
- Puede generar reportes

## Construcción para Producción

### Build de la aplicación

```bash
npm run build
```

Esto genera:
- Archivos compilados en `dist/`
- Instalador Windows (.exe) en `release/`

### Instalador

El instalador NSIS incluye:
- Instalación en Program Files
- Acceso directo en escritorio y menú inicio
- Desinstalador
- Datos de usuario en `%APPDATA%/sistema-educativo/`

## Desarrollo de Funcionalidades

### Agregar nuevo módulo

1. **Crear schema en Prisma** (`prisma/schema.prisma`)
2. **Crear migración**: `npx prisma migrate dev --name add_feature`
3. **Crear repository** en `src/repositories/`
4. **Crear service** en `src/services/`
5. **Crear handlers** en `src/main/handlers/`
6. **Registrar handlers** en `src/main/main.ts`
7. **Actualizar preload** en `src/main/preload.ts`
8. **Crear componentes React** en `src/renderer/src/`

### Ejemplo: Agregar gestión de tareas

Ver estructura de `students` como referencia:
- `src/repositories/studentRepository.ts`
- `src/services/studentService.ts`
- `src/main/handlers/students.ts`
- `src/renderer/src/pages/Students.tsx`

## Seguridad

### Mejores Prácticas Implementadas

1. **Passwords**: Hash con Argon2 (nunca almacenados en texto plano)
2. **IPC**: Context isolation habilitado, API expuesta selectivamente
3. **Node Integration**: Deshabilitado en renderer
4. **Sesiones**: Timeout configurable (30 min por defecto)
5. **Validación**: Datos validados en backend antes de DB
6. **Auditoría**: Registro de acciones críticas (CRUD, login/logout)

### Recomendaciones Adicionales

- Cambiar contraseña de admin después de instalación
- Crear backups antes de actualizaciones importantes
- No compartir archivos de backup sin cifrar
- Limitar acceso físico al equipo donde se instala

## Solución de Problemas

### La aplicación no inicia

1. Verificar que Node.js está instalado: `node --version`
2. Reinstalar dependencias: `rm -rf node_modules && npm install`
3. Verificar logs en: `%APPDATA%/sistema-educativo/logs/`

### Error de base de datos

1. Verificar que existe el archivo `.env`
2. Regenerar Prisma client: `npm run prisma:generate`
3. Revisar migraciones: `npx prisma migrate status`
4. Como último recurso, restaurar backup

### Problemas de permisos

La aplicación requiere permisos de escritura en:
- `%APPDATA%/sistema-educativo/` (datos y backups)
- Carpeta de instalación (solo durante instalación)

## Roadmap

### Versión 1.0 (Actual)

- [x] Autenticación y roles
- [x] CRUD básico (estudiantes, profesores, materias, cursos)
- [x] Sistema de notas
- [x] Backups automáticos
- [ ] Generación de reportes PDF/Excel
- [ ] Dashboard con estadísticas

### Versión 1.1 (Planeada)

- [ ] Importación masiva desde Excel
- [ ] Cálculo de promedios ponderados configurables
- [ ] Configuración de periodos académicos
- [ ] Notificaciones de bajo rendimiento
- [ ] Reportes personalizables

### Versión 2.0 (Futuro)

- [ ] Modo multi-usuario (SQL Server)
- [ ] Sincronización en red local
- [ ] Aplicación móvil companion
- [ ] Integración con plataformas LMS

## Licencia

MIT

## Soporte

Para reportar problemas o solicitar características:
1. Crear issue en el repositorio
2. Incluir logs y pasos para reproducir
3. Especificar versión de la aplicación y Windows

---

Desarrollado para instituciones educativas pequeñas y medianas.
