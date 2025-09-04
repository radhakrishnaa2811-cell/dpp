# Step 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json & lock files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build optimized production build
RUN npm run build

# Step 2: Serve the React app with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx files
RUN rm -rf ./*

# Copy built React app
COPY --from=build /app/build ./

# Copy custom Nginx config (optional, for routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
