# Guía Rápida de Inicio

## Instalación (5 minutos)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Generar cliente de Prisma

```bash
npm run prisma:generate
```

### 3. Crear base de datos

```bash
npx prisma migrate dev --name init
```

Esto crea la base de datos SQLite con todas las tablas.

### 4. Cargar datos iniciales

```bash
npx prisma db seed
```

Esto crea:
- Roles: admin, teacher, viewer
- Usuario admin (usuario: `admin`, contraseña: `admin123`)
- Materias de ejemplo: Matemáticas, Ciencias

## Ejecutar la aplicación

```bash
npm run electron:dev
```

La aplicación se abrirá automáticamente.

## Primer login

- **Usuario**: admin
- **Contraseña**: admin123

## Próximos pasos

### Crear un profesor

1. Ir a Profesores
2. Click en "Nuevo Profesor"
3. Llenar formulario
4. Guardar

### Crear un estudiante

1. Ir a Estudiantes
2. Click en "Nuevo Estudiante"
3. Llenar formulario
4. Guardar

### Crear un curso

1. Ir a Cursos
2. Click en "Nuevo Curso"
3. Seleccionar materia y profesor
4. Guardar

### Inscribir estudiante a curso

1. Ir a Cursos
2. Seleccionar un curso
3. Click en "Inscribir Estudiante"
4. Seleccionar estudiante
5. Guardar

### Registrar notas

1. Ir a Notas
2. Seleccionar curso
3. Seleccionar estudiante
4. Ingresar nota
5. Guardar

## Comandos útiles

```bash
# Ver base de datos en navegador
npm run prisma:studio

# Verificar tipos TypeScript
npm run typecheck

# Build para producción
npm run build
```

## Estructura de carpetas

```
src/
├── main/           # Backend (Electron main)
├── renderer/       # Frontend (React)
├── services/       # Lógica de negocio
├── repositories/   # Acceso a datos
└── types/          # TypeScript types

prisma/
├── schema.prisma   # Schema de DB
└── seed.ts         # Datos iniciales
```

## Solución rápida de problemas

### Error: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Error: "Database not found"

```bash
npx prisma migrate dev --name init
```

### La aplicación no abre

1. Verificar que el puerto 5173 esté libre
2. Matar procesos de Electron: `taskkill /F /IM electron.exe`
3. Intentar nuevamente

### Ver logs de la aplicación

Los logs aparecen en la terminal donde ejecutaste `npm run electron:dev`.

## Documentación completa

- [README.md](./README.md) - Documentación completa
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema

## Contacto

Para preguntas o problemas, crear issue en el repositorio.
