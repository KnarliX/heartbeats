/**
 * HeartBeats Music Player - Song Configuration
 * Songs list and data management
 * Optimized for performance and low-bandwidth usage
 */

// Song collection - can be easily updated
const songs = [
    {
        title: "Zaroor",
        artist: "My Love",
        path: "Zaroor by my premika.mp3",
        cover: "placeholder.png" // Using local placeholder for faster loading
    },
    {
        title: "Yarra",
        artist: "My Heartbeat",
        path: "yarra by jannu.mp3", 
        cover: "placeholder.png"
    },
    {
        title: "Naina",
        artist: "My Darling",
        path: "naina.mp3",
        cover: "placeholder.png"
    },
    {
        title: "Bullya",
        artist: "My Sweetheart",
        path: "BULLYA.mp3",
        cover: "placeholder.png"
    }
];

// The responsive stylesheet loading is now handled inline in the HTML
// for faster initial page rendering
// We only keep this function for resize events

/**
 * Updates the CSS based on screen width
 * Throttled to improve performance
 */
let resizeTimeout;
function handleResponsiveResize() {
    // Clear any existing timeout to prevent multiple executions
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    // Set a timeout to throttle the execution
    resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        const stylesheet = document.getElementById('responsive-stylesheet');
        
        if (stylesheet) {
            if (isMobile && !stylesheet.href.includes('mobile.css')) {
                stylesheet.href = 'styles/mobile.css';
            } else if (!isMobile && !stylesheet.href.includes('desktop.css')) {
                stylesheet.href = 'styles/desktop.css';
            }
        }
    }, 250); // 250ms delay to throttle resize events
}

// Update CSS only on window resize, not on page load (handled by inline script)
window.addEventListener('resize', handleResponsiveResize);