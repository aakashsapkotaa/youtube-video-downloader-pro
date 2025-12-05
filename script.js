document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultCard = document.getElementById('resultCard');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const channelName = document.getElementById('channelName');
    const videoDuration = document.getElementById('videoDuration');

    // Mock Data
    const mockVideoData = {
        title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
        channel: "Lofi Girl",
        duration: "Live",
        thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg"
    };

    downloadBtn.addEventListener('click', handleDownload);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    async function handleDownload() {
        const url = urlInput.value.trim();

        if (!url) {
            shakeInput();
            return;
        }

        // Reset UI
        resultCard.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.7';

        try {
            // Fetch video info from backend API
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch video info');
            }

            const data = await response.json();
            showResult(data, url);

        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching video details. Please check the URL and try again.');
        } finally {
            loadingSpinner.classList.add('hidden');
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
        }
    }

    function showResult(data, url) {
        // Display video metadata
        videoTitle.textContent = data.title;
        channelName.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${data.channel}`;
        videoDuration.textContent = data.duration;
        videoThumbnail.src = data.thumbnail;

        // Get the quality options container
        const qualityOptionsContainer = document.getElementById('qualityOptions');
        qualityOptionsContainer.innerHTML = ''; // Clear any existing buttons

        // Quality label mapping for better UX
        const qualityInfo = {
            '2160p': { label: '2160p', size: '4K', format: 'mp4' },
            '1440p': { label: '1440p', size: '2K', format: 'mp4' },
            '1080p': { label: '1080p', size: 'Full HD', format: 'mp4' },
            '720p': { label: '720p', size: 'HD', format: 'mp4' },
            '360p': { label: '360p', size: 'SD', format: 'mp4' },
            '144p': { label: '144p', size: 'Low', format: 'mp4' },
            'mp3': { label: 'Audio', size: '192K', format: 'mp3' }
        };

        // Check if formats array exists
        if (!data.formats || !Array.isArray(data.formats) || data.formats.length === 0) {
            qualityOptionsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); padding: 1rem;">No download formats available</p>';
            resultCard.classList.remove('hidden');
            return;
        }

        // Generate buttons dynamically for each available format
        data.formats.forEach(format => {
            const formatKey = format.toLowerCase();
            const info = qualityInfo[formatKey];

            if (!info) return; // Skip unknown formats

            const isAudio = info.format === 'mp3';

            // Create button element
            const button = document.createElement('button');
            button.className = isAudio ? 'option-btn audio-btn' : 'option-btn';
            button.dataset.format = info.format;
            button.dataset.quality = format;

            // Build button HTML
            button.innerHTML = `
                <span class="format">${isAudio ? 'MP3' : 'MP4'}</span>
                <span class="quality">${info.label}</span>
                <span class="size">${info.size}</span>
            `;

            // Add click handler
            button.addEventListener('click', () => {
                initiateDownload(url, info.format, format);
            });

            // Append to container
            qualityOptionsContainer.appendChild(button);
        });

        // Show the result card with animation
        resultCard.classList.remove('hidden');

        // Scroll to result on mobile
        if (window.innerWidth < 600) {
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function initiateDownload(url, format, quality) {
        // Use direct download link - this ensures browser receives real MP4 stream
        let downloadUrl;

        if (format === 'mp3') {
            // Use audio endpoint for MP3
            downloadUrl = `/api/audio?url=${encodeURIComponent(url)}`;
        } else {
            // Use download endpoint with quality parameter
            // Map quality like "1080p" to just "1080"
            const qualityNumber = quality.replace('p', '');
            downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${qualityNumber}`;
        }

        console.log('Initiating download:', downloadUrl);

        // Direct navigation - browser handles the download
        window.location.href = downloadUrl;
    }

    function shakeInput() {
        const inputArea = document.querySelector('.input-area');
        inputArea.style.transform = 'translateX(10px)';
        setTimeout(() => {
            inputArea.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                inputArea.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    inputArea.style.transform = 'translateX(0)';
                }, 100);
            }, 100);
        }, 100);

        urlInput.focus();
        urlInput.style.borderColor = '#ff0000';
        setTimeout(() => {
            urlInput.style.borderColor = 'transparent';
        }, 2000);
    }

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;

            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 1000);
        });
    });
});
