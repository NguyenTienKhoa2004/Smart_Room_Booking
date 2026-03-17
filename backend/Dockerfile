# ==========================================
# Stage 1: Build (Môi trường dùng để compile code)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy các file thiết yếu để cài thư viện
COPY package*.json ./

# Cài đặt TOÀN BỘ dependencies (bao gồm cả devDependencies như TypeScript, tsc)
RUN npm install

# Copy toàn bộ mã nguồn vào
COPY . .

# Chạy lệnh build (Compile TS -> JS, sẽ tự sinh ra thư mục root/dist)
RUN npm run build


# ==========================================
# Stage 2: Production (Môi trường chạy thực tế)
# ==========================================
FROM node:18-alpine AS production

# Cài node_env là production để tối ưu hiệu năng của node
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./

# CHỈ cài đặt dependencies cho production (cờ --omit=dev giúp bỏ qua devDependencies làm nhẹ image)
RUN npm install --omit=dev

# ĐIỂM ĂN TIỀN: Chỉ copy đúng thư mục 'dist' đã được build từ stage builder sang đây
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Khởi động app
CMD ["npm", "start"]
