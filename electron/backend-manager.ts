import { spawn, ChildProcess } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import { app } from 'electron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let backendProcess: ChildProcess | null = null
const BACKEND_PORT = 8080

/**
 * 启动后端服务器
 * @param isDev 是否为开发模式
 */
export async function startBackend(isDev: boolean): Promise<void> {
  if (backendProcess) {
    console.log('[Backend] 后端进程已存在，跳过启动')
    return
  }

  if (isDev) {
    // 开发模式：假设后端已经在运行（通过 Maven 启动）
    console.log('[Backend] 开发模式：等待后端服务器启动...')
    await waitForBackend()
  } else {
    // 生产模式：启动打包后的 JAR 文件
    await startBackendJar()
  }
}

/**
 * 启动打包后的 JAR 文件
 */
async function startBackendJar(): Promise<void> {
  const jarPath = getJarPath()
  
  if (!jarPath || !existsSync(jarPath)) {
    console.error('[Backend] JAR 文件不存在:', jarPath)
    throw new Error(`后端 JAR 文件不存在: ${jarPath}`)
  }

  console.log('[Backend] 启动后端 JAR:', jarPath)

  // 获取 Java 可执行文件路径
  const javaExecutable = getJavaExecutable()
  
  // 确保数据库目录存在
  const userDataPath = app.getPath('userData')
  const dataDir = join(userDataPath, 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  
  // 启动 JAR 文件
  backendProcess = spawn(javaExecutable, ['-jar', jarPath], {
    cwd: dirname(jarPath),
    stdio: 'inherit',
    env: {
      ...process.env,
      // 设置数据库路径为应用数据目录
      SPRING_DATASOURCE_URL: `jdbc:sqlite:${join(dataDir, 'lunarys.db')}`,
    },
  })

  backendProcess.on('error', (error) => {
    console.error('[Backend] 启动失败:', error)
  })

  backendProcess.on('exit', (code) => {
    console.log(`[Backend] 后端进程退出，代码: ${code}`)
    backendProcess = null
  })

  // 等待后端启动
  await waitForBackend()
}

/**
 * 获取 JAR 文件路径
 */
function getJarPath(): string | null {
  if (app.isPackaged) {
    // 打包后的路径：在 resources 目录下
    const resourcesPath = process.resourcesPath || app.getAppPath()
    return join(resourcesPath, 'backend', 'Lunarys-0.0.1-SNAPSHOT.jar')
  } else {
    // 开发模式：从项目根目录查找（相对于 electron 目录向上两级）
    const projectRoot = join(__dirname, '..', '..')
    const jarPath = join(projectRoot, 'Lunarys', 'target', 'Lunarys-0.0.1-SNAPSHOT.jar')
    return jarPath
  }
}

/**
 * 获取 Java 可执行文件路径
 */
function getJavaExecutable(): string {
  // 优先使用 JAVA_HOME
  if (process.env.JAVA_HOME) {
    const javaPath = join(process.env.JAVA_HOME, 'bin', 'java')
    if (existsSync(javaPath + '.exe') || existsSync(javaPath)) {
      return process.platform === 'win32' ? javaPath + '.exe' : javaPath
    }
  }

  // 回退到系统 PATH 中的 java
  return 'java'
}

/**
 * 等待后端服务器启动
 */
async function waitForBackend(maxAttempts = 30, interval = 1000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // 尝试检查 API 端点
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/conversations`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000), // 1秒超时
      })
      if (response.status === 200 || response.status === 404) {
        console.log('[Backend] 后端服务器已启动')
        return
      }
    } catch (error: any) {
      // 如果是超时或连接错误，继续等待
      if (error.name !== 'AbortError' && !error.message?.includes('fetch')) {
        // 其他错误可能表示后端已启动但端点不存在，也认为启动成功
        console.log('[Backend] 后端服务器可能已启动')
        return
      }
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  console.warn('[Backend] 等待后端启动超时，但继续执行（可能后端需要更长时间启动）')
}

/**
 * 停止后端服务器
 */
export async function stopBackend(): Promise<void> {
  if (backendProcess) {
    console.log('[Backend] 停止后端进程...')
    backendProcess.kill()
    backendProcess = null
  }
}

