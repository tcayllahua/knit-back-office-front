/**
 * Logger centralizado para Knit Back Office
 * Niveles: info, warn, error, debug
 * En producción solo se emiten warn y error.
 */

const isProd = import.meta.env.PROD
const APP_PREFIX = '[Knit]'

const formatTimestamp = () => new Date().toLocaleTimeString('es-PE', { hour12: false })

const logger = {
  info: (module, message, data = null) => {
    if (isProd) return
    const args = [`%c${APP_PREFIX} [${formatTimestamp()}] [${module}] ℹ️ ${message}`, 'color: #1976d2']
    if (data) args.push(data)
    console.info(...args)
  },

  warn: (module, message, data = null) => {
    const args = [`${APP_PREFIX} [${formatTimestamp()}] [${module}] ⚠️ ${message}`]
    if (data) args.push(data)
    console.warn(...args)
  },

  error: (module, message, error = null) => {
    const args = [`${APP_PREFIX} [${formatTimestamp()}] [${module}] ❌ ${message}`]
    if (error) args.push(error)
    console.error(...args)
  },

  debug: (module, message, data = null) => {
    if (isProd) return
    const args = [`%c${APP_PREFIX} [${formatTimestamp()}] [${module}] 🐛 ${message}`, 'color: #9e9e9e']
    if (data) args.push(data)
    console.debug(...args)
  },
}

export default logger
