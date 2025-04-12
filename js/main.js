// Main JavaScript file for HeartBeats Music Player
// Created by KnarliX - Music Player for Janvi's songs

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentSongIndex = 0;

        // Check device type for responsive design
        this.isMobile = window.innerWidth <= 768;
        this.setupResponsiveDesign();

        // Get the playlist from the songs.js file
        this.playlist = window.songsList || [
            {
                title: "Zaroor",
                artist: "Janvi - My Love",
                url: "Zaroor by my premika.mp3",
                art: "https://knarlix.github.io/images/janvi/logo.png"
            },
            {
                title: "Yaara",
                artist: "Janvi - My Heartbeat",
                url: "yarra by jannu.mp3",
                art: "https://knarlix.github.io/images/janvi/logo.png"
            },
            {
                title: "Naina",
                artist: "Janvi - My Soulmate",
                url: "naina.mp3",
                art: "https://knarlix.github.io/images/janvi/logo.png"
            },
            {
                title: "Bullya",
                artist: "Janvi - My Everything",
                url: "BULLYA.mp3",
                art: "https://knarlix.github.io/images/janvi/logo.png"
            }
        ];

        this.initializeElements();
        this.setupEventListeners();
        this.loadSong(this.currentSongIndex);
        this.setupMediaSession();
        this.setupVisualizer();
    }

    // Set up responsive design based on device
    setupResponsiveDesign() {
        // Load appropriate stylesheet based on device
        if (this.isMobile) {
            document.querySelector('#responsive-stylesheet').href = 'styles/mobile.css';
        } else {
            document.querySelector('#responsive-stylesheet').href = 'styles/desktop.css';
        }

        // Listen for window resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            // Only change if device type changed
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    document.querySelector('#responsive-stylesheet').href = 'styles/mobile.css';
                } else {
                    document.querySelector('#responsive-stylesheet').href = 'styles/desktop.css';
                }
            }
        });
    }

    initializeElements() {
        this.playBtn = document.getElementById('play');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.shuffleBtn = document.getElementById('shuffle');
        this.repeatBtn = document.getElementById('repeat');
        this.volumeBtn = document.getElementById('volume');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.downloadBtn = document.getElementById('download');
        this.playlistBtn = document.getElementById('playlist');
        this.speedBtn = document.getElementById('speed');
        this.equalizerBtn = document.getElementById('equalizer');

        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        this.progressBar = document.querySelector('.progress');
        this.progressArea = document.querySelector('.progress-bar');
        this.playlistContainer = document.querySelector('.playlist-container');
        this.playlistItems = document.getElementById('playlistItems');

        this.waves = document.querySelectorAll('.wave');
        
        // Initialize state
        this.isShuffle = false;
        this.isRepeat = false;
        this.isMuted = false;
        this.currentSpeed = 1;
        this.isEqualizerOn = false;

        // Create playlist items
        this.updatePlaylist();
    }

    updatePlaylist() {
        this.playlistItems.innerHTML = '';
        this.playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${song.title}</span>
                <span>${song.artist}</span>
            `;
            if (index === this.currentSongIndex) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => {
                this.currentSongIndex = index;
                this.loadSong(index);
                this.playAudio();
            });
            this.playlistItems.appendChild(li);
        });
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.downloadBtn.addEventListener('click', () => this.downloadCurrentSong());
        this.playlistBtn.addEventListener('click', () => this.togglePlaylist());
        this.speedBtn.addEventListener('click', () => this.toggleSpeed());
        this.equalizerBtn.addEventListener('click', () => this.toggleEqualizer());

        this.progressArea.addEventListener('click', (e) => this.setProgress(e));
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateVisualizer();
        });
        
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    loadSong(index) {
        const song = this.playlist[index];
        this.audio.src = song.url;
        this.albumArt.src = song.art;
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.updatePlaylist();
        this.updateMediaSessionMetadata();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    playAudio() {
        this.audio.play();
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.albumArt.classList.add('rotating');
        this.startVisualizer();
        this.updateMediaSessionPlaybackState('playing');
    }

    pauseAudio() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.albumArt.classList.remove('rotating');
        this.stopVisualizer();
        this.updateMediaSessionPlaybackState('paused');
    }

    prevSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) this.playAudio();
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) this.playAudio();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.classList.toggle('active');
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        this.repeatBtn.classList.toggle('active');
    }

    setVolume(value) {
        this.audio.volume = value / 100;
        if (value == 0) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (value < 50) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.lastVolume = this.audio.volume;
            this.setVolume(0);
            this.volumeSlider.value = 0;
        } else {
            this.setVolume(this.lastVolume * 100);
            this.volumeSlider.value = this.lastVolume * 100;
        }
    }

    updateProgress() {
        const duration = this.audio.duration;
        const currentTime = this.audio.currentTime;
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        
        this.currentTimeSpan.textContent = this.formatTime(currentTime);
    }

    setProgress(e) {
        const width = this.progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        this.audio.currentTime = (clickX / width) * duration;
    }

    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    handleSongEnd() {
        if (this.isRepeat) {
            this.audio.currentTime = 0;
            this.playAudio();
        } else if (this.isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.playlist.length);
            } while (newIndex === this.currentSongIndex && this.playlist.length > 1);
            this.currentSongIndex = newIndex;
            this.loadSong(this.currentSongIndex);
            this.playAudio();
        } else {
            this.nextSong();
        }
    }

    toggleSpeed() {
        const speeds = [0.5, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(this.currentSpeed);
        this.currentSpeed = speeds[(currentIndex + 1) % speeds.length];
        this.audio.playbackRate = this.currentSpeed;
        this.speedBtn.textContent = `${this.currentSpeed}x`;
    }

    toggleEqualizer() {
        this.isEqualizerOn = !this.isEqualizerOn;
        this.equalizerBtn.classList.toggle('active');
        document.querySelector('.visualization').classList.toggle('equalizer-on');
    }

    togglePlaylist() {
        this.playlistContainer.classList.toggle('hidden');
    }

    downloadCurrentSong() {
        const song = this.playlist[this.currentSongIndex];
        const a = document.createElement('a');
        a.href = song.url;
        a.download = `${song.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                this.audio.currentTime -= 5;
                break;
            case 'ArrowRight':
                this.audio.currentTime += 5;
                break;
            case 'ArrowUp':
                this.setVolume(Math.min(100, this.audio.volume * 100 + 10));
                this.volumeSlider.value = this.audio.volume * 100;
                break;
            case 'ArrowDown':
                this.setVolume(Math.max(0, this.audio.volume * 100 - 10));
                this.volumeSlider.value = this.audio.volume * 100;
                break;
        }
    }

    handleVisibilityChange() {
        // Remove the pause on visibility change to allow background playback
        if (document.hidden) {
            // Update media session metadata when hidden
            this.updateMediaSessionMetadata();
        }
    }

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => this.playAudio());
            navigator.mediaSession.setActionHandler('pause', () => this.pauseAudio());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prevSong());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.nextSong());
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                this.audio.currentTime = Math.max(this.audio.currentTime - 10, 0);
            });
            navigator.mediaSession.setActionHandler('seekforward', () => {
                this.audio.currentTime = Math.min(this.audio.currentTime + 10, this.audio.duration);
            });
        }
    }

    updateMediaSessionMetadata() {
        if ('mediaSession' in navigator) {
            const currentSong = this.playlist[this.currentSongIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.title,
                artist: currentSong.artist,
                artwork: [
                    { src: currentSong.art, sizes: '300x300', type: 'image/jpeg' }
                ]
            });
        }
    }

    updateMediaSessionPlaybackState(state) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = state;
        }
    }

    startVisualizer() {
        this.waves.forEach(wave => {
            wave.style.animation = 'wave 1s infinite';
        });
    }

    stopVisualizer() {
        this.waves.forEach(wave => {
            wave.style.animation = 'none';
        });
    }

    updateVisualizer() {
        if (!this.isPlaying) return;
        
        this.waves.forEach((wave, index) => {
            const height = Math.random() * 20 + 10;
            wave.style.height = `${height}px`;
        });
    }
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}

// Background music playback enhancements
document.addEventListener('visibilitychange', function() {
    // Keep audio running in background on mobile devices
    if (document.hidden) {
        document.title = "🎵 Playing - Janvi's Melody";
    } else {
        document.title = "Janvi's Melodious World";
    }
});

// Initialize the music player
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
    
    // Add heart animation click handler
    const heartIcon = document.querySelector('.heart');
    if (heartIcon) {
        heartIcon.addEventListener('click', function() {
            this.classList.add('heart-clicked');
            setTimeout(() => {
                this.classList.remove('heart-clicked');
            }, 1000);
        });
    }
});