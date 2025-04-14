// HeartBeats Music Player - Main JavaScript
// Created by KnarliX - Music Player for Love Songs

class MusicPlayer {
    constructor() {
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isShuffleOn = false;
        this.isRepeatOn = false;
        this.isMuted = false;
        this.isEqualizerOn = false;
        this.playbackSpeed = 1;
        this.audio = new Audio();
        this.audioContext = null;
        this.analyzer = null;
        this.songs = songs || [];

        this.setupResponsiveDesign();
        this.initializeElements();
        this.updatePlaylist();
        this.setupEventListeners();
        this.loadSong(this.currentSongIndex);
        this.setupMediaSession();
    }

    setupResponsiveDesign() {
        this.isMobile = window.innerWidth <= 768;
        // Responsive design is handled by CSS
    }

    initializeElements() {
        // Player elements
        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.currentTimeElement = document.getElementById('currentTime');
        this.durationElement = document.getElementById('duration');
        this.progressBar = document.querySelector('.progress');
        this.progressArea = document.querySelector('.progress-bar');
        
        // Control buttons - only necessary buttons
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
        this.visualizerElement = document.querySelector('.visualization');
        this.waveElements = document.querySelectorAll('.wave');

        // Setup volume slider value
        this.volumeSlider.value = 100;
    }

    updatePlaylist() {
        this.playlistItems.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            let li = document.createElement('li');
            li.textContent = `${song.title} - ${song.artist}`;
            li.dataset.index = index;
            
            if (index === this.currentSongIndex) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => {
                this.currentSongIndex = parseInt(li.dataset.index);
                this.loadSong(this.currentSongIndex);
                this.playAudio();
            });
            
            this.playlistItems.appendChild(li);
        });
    }

    setupEventListeners() {
        // Playback control events
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Extra controls events
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.playlistBtn.addEventListener('click', () => this.togglePlaylist());
        this.heartBtn.addEventListener('click', (e) => {
            e.currentTarget.classList.add('heart-clicked');
            setTimeout(() => e.currentTarget.classList.remove('heart-clicked'), 1000);
        });
        
        // Progress bar events
        this.progressArea.addEventListener('click', (e) => this.setProgress(e));
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        
        // Window events
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('resize', () => this.setupResponsiveDesign());
    }

    loadSong(index) {
        if (!this.songs.length || index < 0 || index >= this.songs.length) return;
        
        const song = this.songs[index];
        this.currentSongIndex = index;
        
        // Update audio source
        this.audio.src = song.path;
        this.audio.load();
        
        // Update player UI
        this.albumArt.src = song.cover || 'https://knarlix.github.io/images/janvi/logo.png';
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        
        // Update active playlist item
        const playlistItems = this.playlistItems.querySelectorAll('li');
        playlistItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update media session metadata
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
        this.updateMediaSessionPlaybackState('playing');
        
        // Change to faster heart beating animation
        const heartElement = document.querySelector('.heart');
        heartElement.classList.remove('slow-beating');
        heartElement.classList.add('beating');
        
        // Start visualizer if enabled
        if (this.isEqualizerOn) {
            this.startVisualizer();
        }
    }

    pauseAudio() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.albumArt.classList.remove('rotating');
        this.updateMediaSessionPlaybackState('paused');
        
        // Change back to slow heart beating animation
        const heartElement = document.querySelector('.heart');
        heartElement.classList.remove('beating');
        heartElement.classList.add('slow-beating');
        
        // Stop visualizer
        if (this.isEqualizerOn) {
            this.stopVisualizer();
        }
    }

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

    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        this.shuffleBtn.classList.toggle('active', this.isShuffleOn);
    }

    toggleRepeat() {
        this.isRepeatOn = !this.isRepeatOn;
        this.repeatBtn.classList.toggle('active', this.isRepeatOn);
    }

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

    toggleMute() {
        if (this.isMuted) {
            this.volumeSlider.value = 100;
            this.setVolume(100);
        } else {
            this.volumeSlider.value = 0;
            this.setVolume(0);
        }
    }

    updateProgress() {
        const { currentTime, duration } = this.audio;
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        this.currentTimeElement.textContent = this.formatTime(currentTime);
        
        // Update visualizer if enabled
        if (this.isEqualizerOn && this.analyzer) {
            this.updateVisualizer();
        }
    }

    setProgress(e) {
        const width = this.progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        
        this.audio.currentTime = (clickX / width) * duration;
    }

    updateDuration() {
        this.durationElement.textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

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

    playRandomSong() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.songs.length);
        } while (randomIndex === this.currentSongIndex && this.songs.length > 1);
        
        this.currentSongIndex = randomIndex;
        this.loadSong(this.currentSongIndex);
        
        if (this.isPlaying) {
            this.playAudio();
        }
    }

    toggleSpeed() {
        const speeds = [1, 1.25, 1.5, 0.75, 1];
        const currentIndex = speeds.indexOf(this.playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        
        this.playbackSpeed = speeds[nextIndex];
        this.audio.playbackRate = this.playbackSpeed;
        this.speedBtn.textContent = `${this.playbackSpeed}x`;
    }

    toggleEqualizer() {
        this.isEqualizerOn = !this.isEqualizerOn;
        this.equalizerBtn.classList.toggle('active', this.isEqualizerOn);
        this.visualizerElement.classList.toggle('equalizer-on', this.isEqualizerOn);
        
        if (this.isEqualizerOn) {
            if (this.isPlaying) {
                this.startVisualizer();
            }
        } else {
            this.stopVisualizer();
            this.waveElements.forEach(wave => {
                wave.style.height = '20px';
            });
        }
    }

    togglePlaylist() {
        // Check if we're on mobile or desktop
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, show/hide the playlist
            if (this.playlistContainer.style.display === 'block') {
                this.playlistContainer.style.display = 'none';
            } else {
                this.playlistContainer.style.display = 'block';
            }
        } else {
            // On desktop, use hidden class
            this.playlistContainer.classList.toggle('hidden');
        }
    }

    downloadCurrentSong() {
        const song = this.songs[this.currentSongIndex];
        const link = document.createElement('a');
        link.href = song.path;
        link.download = song.path;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleKeyboard(e) {
        switch (e.key) {
            case ' ': // Space
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft': // Left arrow
                e.preventDefault();
                this.audio.currentTime -= 5;
                break;
            case 'ArrowRight': // Right arrow
                e.preventDefault();
                this.audio.currentTime += 5;
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
                this.nextSong();
                break;
            case 'p': // Previous song
                this.prevSong();
                break;
            case 'm': // Mute
                this.toggleMute();
                break;
            case 's': // Shuffle
                this.toggleShuffle();
                break;
            case 'r': // Repeat
                this.toggleRepeat();
                break;
        }
    }

    handleVisibilityChange() {
        if (document.hidden && this.isPlaying) {
            // Continue playing when page is not visible
            // This is for background playback
        }
    }

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => this.playAudio());
            navigator.mediaSession.setActionHandler('pause', () => this.pauseAudio());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prevSong());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.nextSong());
            
            this.updateMediaSessionMetadata();
        }
    }

    updateMediaSessionMetadata() {
        if ('mediaSession' in navigator && this.songs[this.currentSongIndex]) {
            const song = this.songs[this.currentSongIndex];
            
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: 'HeartBeats',
                artwork: [
                    { src: song.cover || 'https://knarlix.github.io/images/janvi/logo.png', sizes: '512x512', type: 'image/png' }
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
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            
            // Connect audio to the analyzer
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioContext.destination);
            
            // Setup analyzer
            this.analyzer.fftSize = 64;
            this.bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
        }
        
        this.visualizerRunning = true;
        this.updateVisualizer();
    }

    stopVisualizer() {
        this.visualizerRunning = false;
    }

    updateVisualizer() {
        if (!this.visualizerRunning) return;
        
        this.analyzer.getByteFrequencyData(this.dataArray);
        
        // Update wave heights based on frequency data
        const waveCount = this.waveElements.length;
        const step = Math.floor(this.bufferLength / waveCount);
        
        for (let i = 0; i < waveCount; i++) {
            const frequency = this.dataArray[i * step];
            const height = Math.max(5, (frequency / 255) * 40); // Scale height between 5px and 40px
            this.waveElements[i].style.height = `${height}px`;
        }
        
        requestAnimationFrame(() => this.updateVisualizer());
    }
}

// Create and initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
});
