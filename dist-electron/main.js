import { app, BrowserWindow, shell, Menu } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
const __filename$2 = fileURLToPath(import.meta.url);
const __dirname$2 = dirname(__filename$2);
let backendProcess = null;
const BACKEND_PORT = 8080;
async function startBackend(isDev2) {
  if (backendProcess) {
    console.log("[Backend] 后端进程已存在，跳过启动");
    return;
  }
  if (isDev2) {
    console.log("[Backend] 开发模式：等待后端服务器启动...");
    await waitForBackend();
  } else {
    await startBackendJar();
  }
}
async function startBackendJar() {
  const jarPath = getJarPath();
  if (!jarPath || !existsSync(jarPath)) {
    console.error("[Backend] JAR 文件不存在:", jarPath);
    throw new Error(`后端 JAR 文件不存在: ${jarPath}`);
  }
  console.log("[Backend] 启动后端 JAR:", jarPath);
  const javaExecutable = getJavaExecutable();
  const userDataPath = app.getPath("userData");
  const dataDir = join(userDataPath, "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  backendProcess = spawn(javaExecutable, ["-jar", jarPath], {
    cwd: dirname(jarPath),
    stdio: "inherit",
    env: {
      ...process.env,
      // 设置数据库路径为应用数据目录
      SPRING_DATASOURCE_URL: `jdbc:sqlite:${join(dataDir, "lunarys.db")}`
    }
  });
  backendProcess.on("error", (error) => {
    console.error("[Backend] 启动失败:", error);
  });
  backendProcess.on("exit", (code) => {
    console.log(`[Backend] 后端进程退出，代码: ${code}`);
    backendProcess = null;
  });
  await waitForBackend();
}
function getJarPath() {
  if (app.isPackaged) {
    const resourcesPath = process.resourcesPath || app.getAppPath();
    return join(resourcesPath, "backend", "Lunarys-0.0.1-SNAPSHOT.jar");
  } else {
    const projectRoot = join(__dirname$2, "..", "..");
    const jarPath = join(projectRoot, "Lunarys", "target", "Lunarys-0.0.1-SNAPSHOT.jar");
    return jarPath;
  }
}
function getJavaExecutable() {
  if (process.env.JAVA_HOME) {
    const javaPath = join(process.env.JAVA_HOME, "bin", "java");
    if (existsSync(javaPath + ".exe") || existsSync(javaPath)) {
      return process.platform === "win32" ? javaPath + ".exe" : javaPath;
    }
  }
  return "java";
}
async function waitForBackend(maxAttempts = 30, interval = 1e3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/conversations`, {
        method: "GET",
        signal: AbortSignal.timeout(1e3)
        // 1秒超时
      });
      if (response.status === 200 || response.status === 404) {
        console.log("[Backend] 后端服务器已启动");
        return;
      }
    } catch (error) {
      if (error.name !== "AbortError" && !error.message?.includes("fetch")) {
        console.log("[Backend] 后端服务器可能已启动");
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  console.warn("[Backend] 等待后端启动超时，但继续执行（可能后端需要更长时间启动）");
}
async function stopBackend() {
  if (backendProcess) {
    console.log("[Backend] 停止后端进程...");
    backendProcess.kill();
    backendProcess = null;
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
const isDev = process.env.NODE_ENV === "development" || process.env.VITE_DEV_SERVER_URL !== void 0 || !app.isPackaged;
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false
    // 先不显示，等加载完成后再显示
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else if (isDev) {
    const port = process.env.VITE_DEV_SERVER_PORT || 5173;
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  setupContextMenu();
}
function setupContextMenu() {
  const template = [
    {
      label: "复制",
      role: "copy",
      accelerator: "CmdOrCtrl+C"
    },
    {
      label: "粘贴",
      role: "paste",
      accelerator: "CmdOrCtrl+V"
    },
    {
      label: "剪切",
      role: "cut",
      accelerator: "CmdOrCtrl+X"
    },
    { type: "separator" },
    {
      label: "全选",
      role: "selectAll",
      accelerator: "CmdOrCtrl+A"
    },
    { type: "separator" },
    {
      label: "撤销",
      role: "undo",
      accelerator: "CmdOrCtrl+Z"
    },
    {
      label: "重做",
      role: "redo",
      accelerator: "CmdOrCtrl+Shift+Z"
    }
  ];
  app.on("web-contents-created", (_, contents) => {
    contents.on("context-menu", (event, params) => {
      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  });
}
app.whenReady().then(async () => {
  await startBackend(isDev);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", async () => {
  await stopBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("before-quit", async () => {
  await stopBackend();
});
app.on("web-contents-created", (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
});
