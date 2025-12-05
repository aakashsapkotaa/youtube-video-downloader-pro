# Use Node.js 18 with Python3.11 pre-installed (bookworm has Python 3.11)
FROM node:18-bookworm

# Install Python3 and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Make yt-dlp executable
RUN chmod +x bin/yt-dlp

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
