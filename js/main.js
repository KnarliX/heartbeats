/**
 * HeartBeats Music Player - Main JavaScript
 * Optimized for performance and low-bandwidth connections
 */

class MusicPlayer {
    constructor() {
        // State variables
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isShuffleOn = false;
        this.isRepeatOn = false;
        this.isMuted = false;
        this.songs = songs || [];
        this.audio = new Audio();
        
        // Set up after DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the player after DOM is ready
     * This ensures all elements are available
     */
    init() {
        this.isMobile = window.innerWidth <= 768;
        this.initializeElements();
        
        // Apply performance optimizations
        this.applyPerformanceOptimizations();
        
        // Update playlist
        this.updatePlaylist();
        
        // Initial setup of playlist item click handlers
        this.setupPlaylistItemsClickHandlers();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load first song
        this.loadSong(this.currentSongIndex);
        
        // Set default volume to 100%
        this.volumeSlider.value = 100;
        this.setVolume(100);
        
        // Setup media session for background playback
        if ('mediaSession' in navigator) {
            this.setupMediaSession();
        }
        
        // Pre-load next song for smooth transition
        if (this.songs.length > 1) {
            const nextSongIndex = (this.currentSongIndex + 1) % this.songs.length;
            const preloadAudio = new Audio();
            preloadAudio.preload = 'metadata';
            preloadAudio.src = this.songs[nextSongIndex].path;
        }
        
        // Initialize proper layout based on device
        this.updateLayoutForDevice();
    }
    
    /**
     * Apply performance optimizations for better mobile experience
     */
    applyPerformanceOptimizations() {
        // Use passive event listeners for better performance
        const options = { passive: true };
        
        // Pre-connect to CDN for faster font loading
        if (!document.querySelector('link[rel="preconnect"][href="https://cdnjs.cloudflare.com"]')) {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = 'https://cdnjs.cloudflare.com';
            document.head.appendChild(preconnect);
        }
        
        // Optimize images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.decoding = 'async';
            img.loading = 'eager';
        });
        
        // Add hardware acceleration for smoother animations
        const style = document.createElement('style');
        style.textContent = `
            .album-art, .control-btn, .progress, .wave {
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
            }
            .heart {
                will-change: transform;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Update layout based on device type (mobile/desktop)
     */
    updateLayoutForDevice() {
        if (this.isMobile) {
            // Mobile layout - album art on top, controls in middle, playlist at bottom
            document.body.classList.add('mobile-device');
            
            // Make sure playlist is initially hidden on mobile
            if (this.playlistContainer) {
                this.playlistContainer.style.display = 'none';
            }
            
            // Add a space filler if it doesn't exist
            if (!document.querySelector('.space-filler') && document.querySelector('.music-player')) {
                const spaceFiller = document.createElement('div');
                spaceFiller.className = 'space-filler';
                document.querySelector('.music-player').appendChild(spaceFiller);
            }
            
            // Move the playlist button container to bottom if it doesn't exist
            if (!document.querySelector('.playlist-button-container') && this.playlistBtn) {
                const container = document.createElement('div');
                container.className = 'playlist-button-container';
                container.appendChild(this.playlistBtn.cloneNode(true));
                document.querySelector('.music-player').appendChild(container);
                
                // Update the event listener for the new button
                document.querySelector('.playlist-button-container .playlist-btn')
                    .addEventListener('click', () => this.togglePlaylist());
                
                // Hide the original button if we created a new one
                if (this.playlistBtn.parentNode) {
                    this.playlistBtn.style.display = 'none';
                }
                
                // Update our reference to the playlist button
                this.playlistBtn = document.querySelector('.playlist-button-container .playlist-btn');
            }
        } else {
            // Desktop layout - player content on left, controls on right
            document.body.classList.remove('mobile-device');
            
            // Make sure playlist is visible on desktop
            if (this.playlistContainer) {
                this.playlistContainer.style.display = 'block';
            }
            
            // Remove mobile-specific elements
            const spaceFiller = document.querySelector('.space-filler');
            if (spaceFiller) {
                spaceFiller.remove();
            }
            
            const playlistBtnContainer = document.querySelector('.playlist-button-container');
            if (playlistBtnContainer) {
                playlistBtnContainer.remove();
            }
            
            // Show the original playlist button
            if (this.playlistBtn) {
                this.playlistBtn.style.display = '';
            }
        }
    }

    /**
     * Cache DOM elements to avoid repeated DOM queries
     */
    initializeElements() {
        // Player elements
        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.currentTimeElement = document.getElementById('currentTime');
        this.durationElement = document.getElementById('duration');
        this.progressBar = document.querySelector('.progress');
        this.progressArea = document.querySelector('.progress-bar');
        
        // Control buttons - only necessary ones
        this.playBtn = document.getElementById('play');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.shuffleBtn = document.getElementById('shuffle');
        this.repeatBtn = document.getElementById('repeat');
        this.volumeBtn = document.getElementById('volume');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.playlistBtn = document.getElementById('playlist');
        this.heartBtn = document.querySelector('.heart');
        
        // Playlist
        this.playlistContainer = document.querySelector('.playlist-container');
        this.playlistItems = document.getElementById('playlistItems');
        
        // Visualization - simplified for better performance
        this.waveElements = document.querySelectorAll('.wave');
        
        // Set initial volume from slider
        this.setVolume(this.volumeSlider.value);
    }

    /**
     * Create and populate playlist items
     */
    updatePlaylist() {
        // Clear existing items
        this.playlistItems.innerHTML = '';
        
        // Create playlist items with direct click handlers for each item
        const fragment = document.createDocumentFragment();
        
        this.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = `${song.title}`;
            li.dataset.index = index;
            
            if (index === this.currentSongIndex) {
                li.classList.add('active');
            }
            
            // Add direct click handler to each item instead of delegation
            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.currentSongIndex = parseInt(li.dataset.index);
                this.loadSong(this.currentSongIndex);
                this.playAudio();
                
                // Update active class immediately
                Array.from(this.playlistItems.children).forEach(item => {
                    item.classList.remove('active');
                });
                li.classList.add('active');
                
                // Hide playlist on mobile after selection
                if (this.isMobile) {
                    setTimeout(() => {
                        this.playlistContainer.style.display = 'none';
                    }, 300);
                }
            });
            
            fragment.appendChild(li);
        });
        
        this.playlistItems.appendChild(fragment);
    }

    /**
     * Set up event listeners with performance optimizations
     */
    setupEventListeners() {
        // Audio events - throttled for better performance
        let lastUpdateTime = 0;
        this.audio.addEventListener('timeupdate', () => {
            const now = Date.now();
            if (now - lastUpdateTime > 250) { // Update every 250ms
                lastUpdateTime = now;
                this.updateProgress();
            }
        });
        
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        
        // Control buttons
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // Use input event for continuous updates
        this.volumeSlider.addEventListener('input', () => this.setVolume(this.volumeSlider.value));
        this.playlistBtn.addEventListener('click', () => this.togglePlaylist());
        
        // Progress bar
        this.progressArea.addEventListener('click', (e) => this.setProgress(e));
        
        // Heart animation
        this.heartBtn.addEventListener('click', () => {
            this.heartBtn.classList.add('heart-clicked');
            setTimeout(() => this.heartBtn.classList.remove('heart-clicked'), 1000);
        });
        
        // Setup Close button for playlist
        const closeBtn = document.getElementById('playlist-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.playlistContainer.style.display = 'none';
            });
        }
        
        // Direct click handlers for playlist items - no event delegation
        this.setupPlaylistItemsClickHandlers();
        
        // Keyboard controls - with passive option for better performance
        document.addEventListener('keydown', (e) => this.handleKeyboard(e), {passive: false});
        
        // Handle background playback
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isPlaying) {
                // Resume audio context if needed (auto-play policy handling)
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }
        });
        
        // Window resize - throttled
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            
            resizeTimeout = setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
                
                // Update playlist visibility based on device
                if (this.isMobile) {
                    // Hide playlist by default on mobile
                    this.playlistContainer.style.display = 'none';
                } else {
                    // Always show playlist on desktop
                    this.playlistContainer.style.display = 'block';
                }
            }, 250);
        });
    }

    /**
     * Load a song by index
     */
    loadSong(index) {
        if (!this.songs[index]) return;
        
        const song = this.songs[index];
        
        // Update UI elements
        this.albumArt.src = song.cover || 'placeholder.png';
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        
        // Set audio source
        this.audio.src = song.path;
        this.audio.load(); // Ensure media is loaded
        
        // Update active playlist item
        this.updateActivePlaylistItem(index);
        
        // Update media session
        if ('mediaSession' in navigator) {
            this.updateMediaSessionMetadata();
        }
        
        // Preload next song for smooth transitions
        if (this.songs.length > 1) {
            const nextIndex = (index + 1) % this.songs.length;
            const preloadAudio = new Audio();
            preloadAudio.preload = 'metadata';
            preloadAudio.src = this.songs[nextIndex].path;
        }
    }
    
    /**
     * Update active playlist item
     */
    updateActivePlaylistItem(activeIndex) {
        const items = this.playlistItems.querySelectorAll('li');
        items.forEach((item, i) => {
            if (i === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // After changing active state, refresh click handlers
        this.setupPlaylistItemsClickHandlers();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    /**
     * Play audio with optimizations
     */
    playAudio() {
        // Handle autoplay restrictions
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.albumArt.classList.add('rotating');
                
                // Update heart animation
                const heartElement = this.heartBtn;
                heartElement.classList.remove('slow-beating');
                heartElement.classList.add('beating');
                
                // Update media session state
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
                
                // Start simple visualization
                this.animateWaves(true);
            }).catch(error => {
                console.log('Autoplay prevented:', error);
                // Show play button since autoplay was prevented
                this.pauseAudio();
            });
        }
    }

    /**
     * Pause audio
     */
    pauseAudio() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.albumArt.classList.remove('rotating');
        
        // Update heart animation
        const heartElement = this.heartBtn;
        heartElement.classList.remove('beating');
        heartElement.classList.add('slow-beating');
        
        // Update media session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
        
        // Stop visualization
        this.animateWaves(false);
    }

    /**
     * Play previous song
     */
    prevSong() {
        if (this.isShuffleOn) {
            this.playRandomSong();
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
            this.loadSong(this.currentSongIndex);
            
            if (this.isPlaying) {
                this.playAudio();
            }
        }
    }

    /**
     * Play next song
     */
    nextSong() {
        if (this.isShuffleOn) {
            this.playRandomSong();
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
            this.loadSong(this.currentSongIndex);
            
            if (this.isPlaying) {
                this.playAudio();
            }
        }
    }

    /**
     * Toggle shuffle mode
     */
    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        this.shuffleBtn.classList.toggle('active', this.isShuffleOn);
    }

    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        this.isRepeatOn = !this.isRepeatOn;
        this.repeatBtn.classList.toggle('active', this.isRepeatOn);
    }

    /**
     * Set volume level
     */
    setVolume(value) {
        const volume = value / 100;
        this.audio.volume = volume;
        
        // Update volume icon
        if (volume === 0) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.isMuted = true;
        } else if (volume < 0.5) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            this.isMuted = false;
        } else {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.isMuted = false;
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        if (this.isMuted) {
            this.volumeSlider.value = 100;
            this.setVolume(100);
        } else {
            this.volumeSlider.value = 0;
            this.setVolume(0);
        }
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        const { currentTime, duration } = this.audio;
        if (isNaN(duration)) return;
        
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        this.currentTimeElement.textContent = this.formatTime(currentTime);
    }

    /**
     * Set progress on click
     */
    setProgress(e) {
        const width = this.progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        
        if (!isNaN(duration)) {
            this.audio.currentTime = (clickX / width) * duration;
        }
    }

    /**
     * Update duration display
     */
    updateDuration() {
        this.durationElement.textContent = this.formatTime(this.audio.duration);
    }

    /**
     * Format time in mm:ss
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * Handle song end
     */
    handleSongEnd() {
        if (this.isRepeatOn) {
            this.audio.currentTime = 0;
            this.playAudio();
        } else if (this.isShuffleOn) {
            this.playRandomSong();
        } else {
            this.nextSong();
        }
    }

    /**
     * Play a random song
     */
    playRandomSong() {
        if (this.songs.length <= 1) {
            this.loadSong(0);
            return;
        }
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.songs.length);
        } while (randomIndex === this.currentSongIndex);
        
        this.currentSongIndex = randomIndex;
        this.loadSong(this.currentSongIndex);
        
        if (this.isPlaying) {
            this.playAudio();
        }
    }

    /**
     * Toggle playlist visibility
     */
    togglePlaylist() {
        if (this.isMobile) {
            // On mobile, show/hide the playlist at the bottom
            const isVisible = this.playlistContainer.style.display === 'block';
            
            if (isVisible) {
                this.playlistContainer.style.display = 'none';
            } else {
                this.playlistContainer.style.display = 'block';
                
                // Setup close button (if not already set up)
                const closeBtn = document.getElementById('playlist-close');
                if (closeBtn && !closeBtn._hasListener) {
                    closeBtn.addEventListener('click', () => {
                        this.playlistContainer.style.display = 'none';
                    });
                    closeBtn._hasListener = true;
                }
                
                // Scroll to active item
                const activeItem = this.playlistItems.querySelector('.active');
                if (activeItem) {
                    setTimeout(() => {
                        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        } else {
            // On desktop, we always keep it visible in the layout
            // Could toggle classes if needed
            this.playlistContainer.classList.toggle('hidden');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Skip if any modifier keys are pressed or if typing in an input field
        if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || 
            e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case ' ': // Space
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft': // Left arrow
                e.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
                break;
            case 'ArrowRight': // Right arrow
                e.preventDefault();
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
                break;
            case 'ArrowUp': // Up arrow
                e.preventDefault();
                this.volumeSlider.value = Math.min(parseInt(this.volumeSlider.value) + 10, 100);
                this.setVolume(this.volumeSlider.value);
                break;
            case 'ArrowDown': // Down arrow
                e.preventDefault();
                this.volumeSlider.value = Math.max(parseInt(this.volumeSlider.value) - 10, 0);
                this.setVolume(this.volumeSlider.value);
                break;
            case 'n': // Next song
            case 'N':
                this.nextSong();
                break;
            case 'p': // Previous song
            case 'P':
                this.prevSong();
                break;
            case 'm': // Mute
            case 'M':
                this.toggleMute();
                break;
            case 's': // Shuffle
            case 'S':
                this.toggleShuffle();
                break;
            case 'r': // Repeat
            case 'R':
                this.toggleRepeat();
                break;
        }
    }

    /**
     * Setup Media Session API for better integration with OS
     */
    setupMediaSession() {
        navigator.mediaSession.setActionHandler('play', () => this.playAudio());
        navigator.mediaSession.setActionHandler('pause', () => this.pauseAudio());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevSong());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextSong());
        
        this.updateMediaSessionMetadata();
    }

    /**
     * Update Media Session metadata
     */
    updateMediaSessionMetadata() {
        if (!this.songs[this.currentSongIndex]) return;
        
        const song = this.songs[this.currentSongIndex];
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: 'HeartBeats',
            artwork: [
                { src: song.cover || 'placeholder.png', sizes: '512x512', type: 'image/png' }
            ]
        });
    }

    /**
     * Simple visualization effect (optimized version)
     */
    animateWaves(isActive) {
        if (!this.waveElements || this.waveElements.length === 0) return;
        
        if (isActive) {
            // Add a low-impact animation class instead of manipulating each wave
            document.querySelector('.visualization').classList.add('equalizer-on');
        } else {
            document.querySelector('.visualization').classList.remove('equalizer-on');
        }
    }
    
    /**
     * Setup click handlers for each playlist item
     * Direct handlers for better mobile responsiveness
     */
    setupPlaylistItemsClickHandlers() {
        const items = this.playlistItems.querySelectorAll('li');
        
        // Remove any existing click handlers first
        items.forEach(item => {
            // Clone and replace to remove all event listeners
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
        
        // Add new click handlers to each item
        const newItems = this.playlistItems.querySelectorAll('li');
        newItems.forEach((item, index) => {
            // Use multiple event handlers for better reliability
            const clickHandler = () => {
                console.log('Playlist item clicked:', index);
                this.currentSongIndex = index;
                this.loadSong(index);
                this.playAudio();
                
                // Hide playlist after selection on mobile
                if (this.isMobile) {
                    setTimeout(() => {
                        this.playlistContainer.style.display = 'none';
                    }, 300);
                }
            };
            
            // Add multiple types of event handlers
            item.addEventListener('click', clickHandler);
            item.addEventListener('touchstart', function(e) {
                // Highlight the item being touched
                this.style.background = 'rgba(156, 39, 176, 0.5)';
            });
            
            item.addEventListener('touchend', function(e) {
                // Remove highlight
                this.style.background = '';
                clickHandler();
                e.preventDefault(); // Prevent default to ensure it works
            });
        });
    }
}

// Initialize player using DOMContentLoaded or directly if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MusicPlayer());
} else {
    new MusicPlayer();
}