import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 自定义插件：处理 tdesign-icons 的 globalThis-config.js 缺失问题
const fixTdesignIconsPlugin = () => {
  return {
    name: 'fix-tdesign-icons',
    resolveId(id, importer) {
      // 拦截 globalThis-config.js 的解析
      if (id === './globalThis-config.js' && importer && importer.includes('tdesign-icons-vue-next')) {
        // 返回一个虚拟模块 ID
        return '\0virtual:globalThis-config'
      }
    },
    load(id) {
      // 为虚拟模块提供一个空的实现
      if (id === '\0virtual:globalThis-config') {
        return 'export default {}'
      }
    }
  }
}

// 自定义插件：修复 axios 在打包后的 a.global 问题
const fixAxiosGlobalPlugin = () => {
  return {
    name: 'fix-axios-global',
    enforce: 'post',
    generateBundle(options, bundle) {
      // 遍历所有输出的chunk
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.startsWith('assets/axios-')) {
          // 修复 a.global 引用，将其替换为确保有Request/Response的globalThis
          // 模式：(a.global) 或 =a.global
          chunk.code = chunk.code.replace(
            /([=(])\s*a\.global\b/g,
            '$1(a.globalThis||a.global||globalThis)'
          )
        }
      }
    }
  }
}

// 自定义插件：修复路径解析问题（包括别名路径）
const fixHtmlPathPlugin = () => {
  // 使用与 root 相同的逻辑
  const projectRoot = process.env.VERCEL ? process.cwd() : __dirname
  
  return {
    name: 'fix-html-path',
    enforce: 'pre',
    resolveId(id, importer) {
      // 处理别名路径 @/xxx
      if (id.startsWith('@/')) {
        const relativePath = id.replace('@/', 'src/')
        const resolved = path.resolve(projectRoot, relativePath)
        try {
          if (fs.existsSync(resolved)) {
            console.log(`[fixHtmlPathPlugin] 别名解析成功: ${id} -> ${resolved}`)
            return resolved
          } else {
            console.warn(`[fixHtmlPathPlugin] 别名路径文件不存在: ${resolved}`)
            // 尝试其他可能的路径
            const altPaths = [
              path.resolve(process.cwd(), relativePath),
              path.resolve(__dirname, relativePath)
            ]
            for (const altPath of altPaths) {
              if (fs.existsSync(altPath)) {
                console.log(`[fixHtmlPathPlugin] 在备用路径找到: ${altPath}`)
                return altPath
              }
            }
            // 即使文件不存在也返回，让 Vite 处理错误
            return resolved
          }
        } catch (e) {
          console.error(`[fixHtmlPathPlugin] 别名解析错误:`, e)
          return resolved
        }
      }
      
      // 处理以 /src/ 开头的路径（从 HTML 中导入）
      if (id.startsWith('/src/')) {
        // 移除前导斜杠，转换为相对路径
        const relativePath = id.slice(1) // 移除开头的 /
        const resolved = path.resolve(projectRoot, relativePath)
        
        // 检查文件是否存在
        try {
          if (fs.existsSync(resolved)) {
            console.log(`[fixHtmlPathPlugin] 解析成功: ${id} -> ${resolved}`)
            return resolved
          } else {
            console.warn(`[fixHtmlPathPlugin] 文件不存在: ${resolved}, 尝试查找...`)
            // 尝试其他可能的路径
            const altPaths = [
              path.resolve(process.cwd(), relativePath),
              path.resolve(__dirname, relativePath),
              path.resolve(projectRoot, 'src', id.replace('/src/', ''))
            ]
            for (const altPath of altPaths) {
              if (fs.existsSync(altPath)) {
                console.log(`[fixHtmlPathPlugin] 在备用路径找到: ${altPath}`)
                return altPath
              }
            }
            console.error(`[fixHtmlPathPlugin] 所有路径都找不到文件: ${id}`)
            // 即使文件不存在也返回，让 Vite 处理错误
            return resolved
          }
        } catch (e) {
          console.error(`[fixHtmlPathPlugin] 解析错误:`, e)
          return resolved
        }
      }
      
      // 处理 src/main.js 这种相对路径
      if (id === 'src/main.js' || id.startsWith('src/')) {
        const resolved = path.resolve(projectRoot, id)
        try {
          if (fs.existsSync(resolved)) {
            console.log(`[fixHtmlPathPlugin] 解析成功: ${id} -> ${resolved}`)
            return resolved
          }
        } catch (e) {
          // 忽略错误
        }
        return resolved
      }
      
      // 返回 null 让其他插件处理
      return null
    }
  }
}

// https://vite.dev/config/
// 获取项目根目录（在 Vercel 构建时也能正确工作）
const rootDir = process.env.VERCEL ? process.cwd() : __dirname

console.log('[Vite Config] 项目根目录:', rootDir)
console.log('[Vite Config] 是否在 Vercel:', !!process.env.VERCEL)
console.log('[Vite Config] process.cwd():', process.cwd())
console.log('[Vite Config] __dirname:', __dirname)

// 检查关键文件是否存在
const mainJsPath = path.resolve(rootDir, 'src/main.js')
const logManagementPath = path.resolve(rootDir, 'src/views/logs/LogManagement.vue')
console.log('[Vite Config] src/main.js 路径:', mainJsPath)
console.log('[Vite Config] src/main.js 是否存在:', fs.existsSync(mainJsPath))
console.log('[Vite Config] LogManagement.vue 路径:', logManagementPath)
console.log('[Vite Config] LogManagement.vue 是否存在:', fs.existsSync(logManagementPath))

// 检查 src/views/logs 目录
const logsDir = path.resolve(rootDir, 'src/views/logs')
if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir)
  console.log('[Vite Config] src/views/logs 目录内容:', files)
}

export default defineConfig({
  root: rootDir,
  base: '/',
  plugins: [
    fixHtmlPathPlugin(),
    vue(),
    fixTdesignIconsPlugin(),
    fixAxiosGlobalPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    // 确保路径解析正确
    preserveSymlinks: false
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://47.100.0.96:80',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://47.100.0.96:8080',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, '')
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis',
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '/api')
  },
  optimizeDeps: {
    include: ['tdesign-vue-next', 'tdesign-icons-vue-next'],
    exclude: ['@stomp/stompjs', 'sockjs-client']
  },
  build: {
    commonjsOptions: {
      include: [/tdesign-vue-next/, /tdesign-icons-vue-next/, /node_modules/]
    },
    rollupOptions: {
      input: path.resolve(rootDir, 'index.html'),
      output: {
        manualChunks: {
          'tdesign': ['tdesign-vue-next', 'tdesign-icons-vue-next'],
          'axios': ['axios']  // 将 axios 单独打包
        },
        // 在每个chunk的开头注入polyfill - 必须在任何导入和代码之前执行
        intro: `
// Polyfill for axios - 必须在所有代码之前执行
(function() {
  // 确保 globalThis 存在
  if (typeof globalThis === 'undefined') {
    if (typeof self !== 'undefined') { self.globalThis = self; }
    else if (typeof window !== 'undefined') { window.globalThis = window; }
    else if (typeof global !== 'undefined') { global.globalThis = global; }
  }

  // 确保 global 指向 window
  if (typeof global === 'undefined') {
    window.global = window;
  }

  // 定义 Request/Response/Headers - 必须在代码执行前就存在
  var RequestClass = class Request { constructor() {} };
  var ResponseClass = class Response { constructor() {} };
  var HeadersClass = class Headers { constructor() {} };

  // 在所有可能的全局对象上定义
  if (typeof globalThis !== 'undefined') {
    globalThis.Request = globalThis.Request || RequestClass;
    globalThis.Response = globalThis.Response || ResponseClass;
    globalThis.Headers = globalThis.Headers || HeadersClass;
  }

  if (typeof window !== 'undefined') {
    window.Request = window.Request || RequestClass;
    window.Response = window.Response || ResponseClass;
    window.Headers = window.Headers || HeadersClass;
  }

  if (typeof self !== 'undefined') {
    self.Request = self.Request || RequestClass;
    self.Response = self.Response || ResponseClass;
    self.Headers = self.Headers || HeadersClass;
  }

  // 确保 global 也有这些对象
  if (typeof global !== 'undefined') {
    global.Request = global.Request || RequestClass;
    global.Response = global.Response || ResponseClass;
    global.Headers = global.Headers || HeadersClass;
  }
})();
`
      }
    }
  }
})
