import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process
        entry: path.resolve(__dirname, 'src/main/main.ts'),
        onstart(args) {
          args.startup()
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: [
                'electron',
                'argon2',
                '@prisma/client',
                'better-sqlite3',
                'pdfkit',
                'exceljs'
              ]
            }
          },
          resolve: {
            alias: {
              '@main': path.resolve(__dirname, 'src/main'),
              '@services': path.resolve(__dirname, 'src/services'),
              '@repositories': path.resolve(__dirname, 'src/repositories'),
              '@types': path.resolve(__dirname, 'src/types')
            }
          }
        }
      },
      {
        // Preload script
        entry: path.resolve(__dirname, 'src/main/preload.ts'),
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              output: {
                format: 'cjs' // CommonJS para compatibilidad con Electron
              }
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@renderer': path.resolve(__dirname, 'src/renderer/src')
    }
  },
  root: 'src/renderer',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer')
  }
})
