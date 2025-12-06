### 多阶段构建：先在 Node 里打包，再用 Nginx 提供静态文件

## 1️⃣ 前端构建阶段
FROM node:18-alpine AS build

WORKDIR /app

# 只拷贝依赖声明，利用 Docker 缓存
COPY package*.json ./

RUN npm install

# 拷贝项目全部代码
COPY . .

# 生产构建（对应 package.json 里的 build 脚本：vite build --mode production）
RUN npm run build


## 2️⃣ 运行阶段：使用 Nginx 提供静态资源
FROM nginx:1.25-alpine

# 拷贝自定义 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 拷贝前端构建产物
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

























