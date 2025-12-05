/**
 * YouTube Downloader Backend API
 * Made by Aakash Sapkota
 * 
 * Production-ready Node.js + Express + yt-dlp API
 * Fixes: 0B downloads, text instead of video, broken streams
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, robots.txt, sitemap.xml, etc.)
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        // Set proper MIME types for SEO files
        if (path.endsWith('robots.txt')) {
            res.setHeader('Content-Type', 'text/plain');
        } else if (path.endsWith('sitemap.xml')) {
            res.setHeader('Content-Type', 'application/xml');
        } else if (path.endsWith('manifest.json')) {
            res.setHeader('Content-Type', 'application/manifest+json');
        }
    }
}));

// Configuration
const PORT = process.env.PORT || 3000;
const CREDIT = 'Made by Aakash Sapkota';

// Quality to height mapping
const QUALITY_MAP = {
    '2160': '2160',  // 4K
    '1440': '1440',  // 2K
    '1080': '1080',  // Full HD
    '720': '720',    // HD
    '360': '360',    // SD
    '144': '144'     // Low
};

/**
 * Validates YouTube URL
 */
function isValidYouTubeUrl(url) {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
}

/**
 * Sanitizes filename for safe download
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
}

/**
 * GET /api/info
 * Returns video information with ACTUAL available formats
 */
app.get('/api/info', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required',
                credit: CREDIT
            });
        }

        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({
                error: 'Invalid YouTube URL',
                credit: CREDIT
            });
        }

        console.log(`[INFO] Fetching info for: ${url}`);

        // Run yt-dlp to get video info with format details
        const ytdlp = spawn('yt-dlp', [
            '--dump-json',
            '--no-warnings',
            '--no-playlist',
            url
        ]);

        let jsonData = '';
        let errorData = '';

        ytdlp.stdout.on('data', (data) => {
            jsonData += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                console.error(`[ERROR] yt-dlp info failed:`, errorData);
                return res.status(500).json({
                    error: 'Failed to fetch video information',
                    details: errorData,
                    credit: CREDIT
                });
            }

            try {
                const videoInfo = JSON.parse(jsonData);

                // Detect actually available formats from the video
                const availableFormats = new Set();

                // Check available video formats from yt-dlp data
                if (videoInfo.formats && Array.isArray(videoInfo.formats)) {
                    videoInfo.formats.forEach(format => {
                        const height = format.height;

                        // Map height to quality labels
                        if (height >= 2160) availableFormats.add('2160p');
                        else if (height >= 1440) availableFormats.add('1440p');
                        else if (height >= 1080) availableFormats.add('1080p');
                        else if (height >= 720) availableFormats.add('720p');
                        else if (height >= 360) availableFormats.add('360p');
                        else if (height >= 144) availableFormats.add('144p');
                    });
                }

                // Convert Set to sorted array (highest to lowest)
                const sortedFormats = Array.from(availableFormats).sort((a, b) => {
                    const heightA = parseInt(a);
                    const heightB = parseInt(b);
                    return heightB - heightA;
                });

                // Always add MP3 option
                sortedFormats.push('mp3');

                console.log(`[INFO] Available formats for this video:`, sortedFormats);

                res.json({
                    title: videoInfo.title || 'Unknown Title',
                    thumbnail: videoInfo.thumbnail || '',
                    duration: videoInfo.duration_string || '00:00',
                    channel: videoInfo.uploader || 'Unknown Channel',
                    view_count: videoInfo.view_count || 0,
                    formats: sortedFormats,
                    credit: CREDIT
                });
            } catch (parseError) {
                console.error(`[ERROR] JSON parse failed:`, parseError);
                res.status(500).json({
                    error: 'Failed to parse video information',
                    credit: CREDIT
                });
            }
        });

    } catch (error) {
        console.error(`[ERROR] /api/info:`, error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            credit: CREDIT
        });
    }
});

/**
 * GET /api/download
 * Streams video download
 */
app.get('/api/download', async (req, res) => {
    try {
        const { url, format = 'mp4', quality = '720' } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required',
                credit: CREDIT
            });
        }

        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({
                error: 'Invalid YouTube URL',
                credit: CREDIT
            });
        }

        const height = QUALITY_MAP[quality] || '720';
        console.log(`[DOWNLOAD] URL: ${url}, Format: ${format}, Quality: ${height}p`);

        // Build yt-dlp format string for best quality with that height
        const formatString = `bv*[height<=${height}]+ba/best[height<=${height}]/best`;

        // Get video title for filename using yt-dlp
        const titleProcess = spawn('yt-dlp', [
            '--get-title',
            '--no-warnings',
            url
        ]);

        let videoTitle = '';
        titleProcess.stdout.on('data', (data) => {
            videoTitle += data.toString().trim();
        });

        titleProcess.on('close', (code) => {
            if (code !== 0 || !videoTitle) {
                videoTitle = 'video';
            }

            // Sanitize filename - remove special characters
            const sanitizedTitle = videoTitle
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 100);

            const filename = `${sanitizedTitle}_${height}p.mp4`;

            // Set response headers BEFORE starting stream
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Credits', CREDIT);
            res.setHeader('Access-Control-Expose-Headers', 'X-Credits');

            // Spawn yt-dlp process
            const ytdlp = spawn('yt-dlp', [
                '-f', formatString,
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '--no-check-certificate',
                '--prefer-ffmpeg',
                '--merge-output-format', 'mp4',
                '-o', '-',  // Output to stdout
                url
            ]);

            let hasStartedStreaming = false;
            let errorOutput = '';

            // Pipe video data directly to response
            ytdlp.stdout.on('data', (chunk) => {
                if (!hasStartedStreaming) {
                    hasStartedStreaming = true;
                    console.log(`[DOWNLOAD] Started streaming ${height}p video: ${filename}`);
                }
                res.write(chunk);
            });

            // Capture errors
            ytdlp.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            // Handle completion
            ytdlp.on('close', (code) => {
                if (code === 0) {
                    console.log(`[DOWNLOAD] Completed successfully: ${filename}`);
                    res.end();
                } else {
                    console.error(`[ERROR] yt-dlp failed (code ${code}):`, errorOutput);
                    if (!hasStartedStreaming) {
                        res.status(500).json({
                            error: 'Download failed',
                            details: errorOutput,
                            credit: CREDIT
                        });
                    } else {
                        res.end();
                    }
                }
            });

            // Handle process errors
            ytdlp.on('error', (error) => {
                console.error(`[ERROR] Process error:`, error);
                if (!hasStartedStreaming) {
                    res.status(500).json({
                        error: 'Failed to start download',
                        details: error.message,
                        credit: CREDIT
                    });
                }
            });

            // Handle client disconnect
            req.on('close', () => {
                if (!res.writableEnded) {
                    console.log(`[DOWNLOAD] Client disconnected, killing process`);
                    ytdlp.kill('SIGKILL');
                }
            });
        });

    } catch (error) {
        console.error(`[ERROR] /api/download:`, error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            credit: CREDIT
        });
    }
});

/**
 * GET /api/audio
 * Streams MP3 audio download
 */
app.get('/api/audio', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required',
                credit: CREDIT
            });
        }

        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({
                error: 'Invalid YouTube URL',
                credit: CREDIT
            });
        }

        console.log(`[AUDIO] URL: ${url}`);

        // Get video title for filename
        const titleProcess = spawn('yt-dlp', [
            '--get-title',
            '--no-warnings',
            url
        ]);

        let videoTitle = '';
        titleProcess.stdout.on('data', (data) => {
            videoTitle += data.toString().trim();
        });

        titleProcess.on('close', (code) => {
            if (code !== 0 || !videoTitle) {
                videoTitle = 'audio';
            }

            // Sanitize filename
            const sanitizedTitle = videoTitle
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 100);

            const filename = `${sanitizedTitle}.mp3`;

            // Set response headers
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Credits', CREDIT);
            res.setHeader('Access-Control-Expose-Headers', 'X-Credits');

            // Spawn yt-dlp for audio extraction
            const ytdlp = spawn('yt-dlp', [
                '-f', 'bestaudio/best',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '192K',
                '-o', '-',
                url
            ]);

            let hasStartedStreaming = false;
            let errorOutput = '';

            ytdlp.stdout.on('data', (chunk) => {
                if (!hasStartedStreaming) {
                    hasStartedStreaming = true;
                    console.log(`[AUDIO] Started streaming MP3: ${filename}`);
                }
                res.write(chunk);
            });

            ytdlp.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    console.log(`[AUDIO] Completed successfully: ${filename}`);
                    res.end();
                } else {
                    console.error(`[ERROR] Audio download failed:`, errorOutput);
                    if (!hasStartedStreaming) {
                        res.status(500).json({
                            error: 'Audio download failed',
                            details: errorOutput,
                            credit: CREDIT
                        });
                    } else {
                        res.end();
                    }
                }
            });

            ytdlp.on('error', (error) => {
                console.error(`[ERROR] Audio process error:`, error);
                if (!hasStartedStreaming) {
                    res.status(500).json({
                        error: 'Failed to start audio download',
                        details: error.message,
                        credit: CREDIT
                    });
                }
            });

            req.on('close', () => {
                if (!res.writableEnded) {
                    console.log(`[AUDIO] Client disconnected, killing process`);
                    ytdlp.kill('SIGKILL');
                }
            });
        });

    } catch (error) {
        console.error(`[ERROR] /api/audio:`, error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            credit: CREDIT
        });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'YouTube Downloader API is running',
        credit: CREDIT
    });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
    res.json({
        name: 'YouTube Downloader API',
        version: '4.0.0',
        credit: CREDIT,
        endpoints: {
            'GET /api/info?url=URL': 'Get video information',
            'GET /api/download?url=URL&quality=720': 'Download video (2160/1440/1080/720/360/144)',
            'GET /api/audio?url=URL': 'Download MP3 audio',
            'GET /health': 'Health check'
        },
        features: [
            'Real binary streaming (no 0B files)',
            'Supports 4K, 2K, Full HD, HD, SD',
            'MP3 audio extraction',
            'CORS enabled',
            'Proper Content-Type headers',
            'Fast yt-dlp streaming'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ERROR] Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message,
        credit: CREDIT
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  YouTube Downloader API v4.0.0                             ║
║  ${CREDIT}                      ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}

📡 API Endpoints:
   GET  /api/info?url=URL
   GET  /api/download?url=URL&quality=720
   GET  /api/audio?url=URL
   GET  /health

✅ Features:
   • Real binary streaming (fixes 0B downloads)
   • Supports 4K/2K/Full HD/HD/SD
   • MP3 audio extraction
   • CORS enabled
   • Production-ready

🎬 Ready to stream YouTube videos!
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
