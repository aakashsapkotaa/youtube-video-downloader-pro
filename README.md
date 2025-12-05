# 🎬 YouTube Video Downloader

A lightning-fast, production-ready YouTube video downloader with a beautiful UI. Download videos in multiple qualities (4K/2K/1080p/720p/360p/144p) or extract MP3 audio - all for free with no ads or limits!

![YouTube Downloader](https://img.shields.io/badge/YouTube-Downloader-red?style=for-the-badge&logo=youtube)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

- 🎥 **Multiple Quality Options**: 4K, 2K, 1080p, 720p, 360p, 144p
- 🎵 **MP3 Audio Extraction**: Download audio-only in high quality
- ⚡ **Real Binary Streaming**: No more 0B downloads or broken files
- 🎨 **Beautiful UI**: Modern, responsive design with glassmorphism effects
- 🚀 **Fast & Efficient**: Powered by yt-dlp for reliable downloads
- 🔒 **No Ads, No Limits**: Completely free and open-source
- 📱 **Mobile Friendly**: Works perfectly on all devices
- 🌐 **SEO Optimized**: Fully indexed by Google and Bing

## 🖼️ Screenshots

![YouTube Downloader Interface](screenshot.png)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **yt-dlp** ([Installation Guide](https://github.com/yt-dlp/yt-dlp#installation))
- **FFmpeg** (optional, for audio conversion)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aakashsapkotaa/youtube-video-downloader-pro.git
   cd youtube-video-downloader-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install yt-dlp**
   
   **Linux/macOS:**
   ```bash
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```
   
   **Windows:**
   ```bash
   winget install yt-dlp
   ```
   
   Or download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
youtube-downloader/
├── index.html          # Frontend UI
├── styles.css          # Styling with glassmorphism effects
├── script.js           # Frontend JavaScript logic
├── server.js           # Express backend API
├── package.json        # Node.js dependencies
├── robots.txt          # SEO crawler configuration
├── sitemap.xml         # SEO sitemap
├── manifest.json       # PWA manifest
└── README.md           # This file
```

## 🔧 API Endpoints

### Get Video Information
```http
GET /api/info?url=<YOUTUBE_URL>
```

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "10:30",
  "channel": "Channel Name",
  "view_count": 1000000,
  "formats": ["1080p", "720p", "360p", "144p", "mp3"]
}
```

### Download Video
```http
GET /api/download?url=<YOUTUBE_URL>&quality=720
```

**Parameters:**
- `url`: YouTube video URL (required)
- `quality`: Video quality - 2160, 1440, 1080, 720, 360, or 144 (default: 720)

### Download Audio (MP3)
```http
GET /api/audio?url=<YOUTUBE_URL>
```

### Health Check
```http
GET /health
```

## 🎨 Customization

### Change Theme Colors

Edit `styles.css` to customize the color scheme:

```css
:root {
    --primary-color: #FF0000;  /* YouTube red */
    --background: #0a0a0a;     /* Dark background */
    --glass-bg: rgba(255, 255, 255, 0.05);
}
```

### Modify Port

Change the port in `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

Or set environment variable:
```bash
PORT=8080 npm start
```

## 🌐 Deployment

### Deploy to Render.com

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variable: `NODE_VERSION=18`
6. Deploy!

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Railway

1. Connect your GitHub repository to [Railway](https://railway.app)
2. Railway will auto-detect Node.js and deploy
3. Done!

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Video Processing**: yt-dlp
- **Styling**: Custom CSS with Glassmorphism
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Outfit)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect copyright laws and only download videos you own or have permission to download. The developer is not responsible for any misuse of this software.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Some videos may be restricted by YouTube's terms of service
- Age-restricted videos may not work without authentication
- Live streams are not supported

## 📧 Contact

**Aakash Sapkota**

- GitHub: [@aakashsapkotaa](https://github.com/aakashsapkotaa)
- Email: aakashsapkotaa@example.com

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The amazing YouTube downloader
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Font Awesome](https://fontawesome.com/) - Beautiful icons

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ by Aakash Sapkota**
