const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')

const PORT = 3000
let mainWindow = null
let serverProcess = null
const isDev = !app.isPackaged

// ─── Path Helpers ─────────────────────────────────────────────────────────────

function resourcePath(...parts) {
  return isDev
    ? path.join(__dirname, '..', ...parts)
    : path.join(process.resourcesPath, ...parts)
}

function userDataPath(...parts) {
  return path.join(app.getPath('userData'), ...parts)
}

// ─── Database Init ────────────────────────────────────────────────────────────

function initDatabase() {
  const dbPath = userDataPath('data.db')
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    const defaultDb = isDev
      ? path.join(__dirname, '..', 'prisma', 'dev.db')
      : path.join(process.resourcesPath, 'default.db')
    if (fs.existsSync(defaultDb)) {
      fs.copyFileSync(defaultDb, dbPath)
      console.log('[db] Initialized at:', dbPath)
    } else {
      console.warn('[db] Default database not found:', defaultDb)
    }
  }
  return dbPath
}

// ─── Next.js Server ───────────────────────────────────────────────────────────

function startServer(dbPath) {
  const env = {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: '127.0.0.1',
    DATABASE_URL: `file:${dbPath}`,
    NEXTAUTH_SECRET: 'mfusion-hr-secret-key-2024',
    NEXTAUTH_URL: `http://localhost:${PORT}`,
    NODE_ENV: isDev ? 'development' : 'production',
  }

  if (isDev) {
    // Dev mode: run next dev
    const nextCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'next.cmd')
    serverProcess = spawn(nextCmd, ['dev', '-p', String(PORT)], {
      cwd: path.join(__dirname, '..'),
      env,
      shell: false,
    })
  } else {
    // Production: run standalone server using Electron's Node.js
    const serverJs = path.join(process.resourcesPath, 'standalone', 'server.js')
    serverProcess = spawn(process.execPath, [serverJs], {
      cwd: path.join(process.resourcesPath, 'standalone'),
      env,
    })
  }

  serverProcess.stdout?.on('data', d => console.log('[next]', d.toString().trim()))
  serverProcess.stderr?.on('data', d => console.error('[next]', d.toString().trim()))
  serverProcess.on('error', err => console.error('[next] spawn error:', err))
  serverProcess.on('close', code => console.log('[next] exited:', code))
}

function waitForServer(timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const attempt = () => {
      const req = http.get(`http://localhost:${PORT}`, () => resolve())
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Server timeout'))
        setTimeout(attempt, 1000)
      })
      req.setTimeout(1000, () => req.destroy())
    }
    attempt()
  })
}

// ─── Window ───────────────────────────────────────────────────────────────────

async function createWindow() {
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MFUSION-HR',
    show: false,
    backgroundColor: '#1e293b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Show loading screen immediately
  mainWindow.loadFile(path.join(__dirname, 'loading.html'))
  mainWindow.show()

  // Start the Next.js server
  const dbPath = initDatabase()
  startServer(dbPath)

  try {
    console.log('[app] Waiting for server...')
    await waitForServer()
    console.log('[app] Server ready, loading app...')
    mainWindow.loadURL(`http://localhost:${PORT}`)
    mainWindow.maximize()
  } catch (err) {
    console.error('[app] Server failed:', err)
    mainWindow.loadFile(path.join(__dirname, 'error.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  app.quit()
})

app.on('activate', () => {
  if (!mainWindow) createWindow()
})
