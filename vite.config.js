import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

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

// https://vite.dev/config/
export default defineConfig({

  plugins: [
    vue(),
    fixTdesignIconsPlugin(),
    fixAxiosGlobalPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis',
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '')
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
