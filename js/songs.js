// Songs playlist configuration for HeartBeats Music Player
// Songs by my love - Personal Collection

const songs = [
    {
        title: "Zaroor",
        artist: "My Love",
        path: "Zaroor by my premika.mp3",
        cover: "https://knarlix.github.io/images/janvi/zaroor.jpg"
    },
    {
        title: "Yarra",
        artist: "My Heartbeat",
        path: "yarra by jannu.mp3", 
        cover: "https://knarlix.github.io/images/janvi/yarra.jpg"
    },
    {
        title: "Naina",
        artist: "My Darling",
        path: "naina.mp3",
        cover: "https://knarlix.github.io/images/janvi/naina.jpg"
    },
    {
        title: "Bullya",
        artist: "My Sweetheart",
        path: "BULLYA.mp3",
        cover: "https://knarlix.github.io/images/janvi/bullya.jpg"
    }
];

// Detect device for responsive design loading
function loadResponsiveCSS() {
    const stylesheet = document.getElementById('responsive-stylesheet');
    if (window.innerWidth <= 768) {
        stylesheet.href = 'styles/mobile.css';
    } else {
        stylesheet.href = 'styles/desktop.css';
    }
}

// Load responsive CSS on page load
document.addEventListener('DOMContentLoaded', loadResponsiveCSS);

// Update responsive CSS on window resize
window.addEventListener('resize', loadResponsiveCSS);