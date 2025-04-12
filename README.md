# HeartBeats Music Player

A beautiful, responsive music player web application dedicated to personal love songs. This player features stunning visuals, animations, and works smoothly on both mobile and desktop devices.

## Features

- Beautiful responsive UI optimized for both desktop and mobile
- Purple-themed glass morphism design
- Separate layouts for desktop (playlist on left, player on right) and mobile
- Customizable playlist for your personal songs
- Song visualization with wave animations
- Controls for play/pause, next/previous, shuffle, repeat
- Volume control and mute option
- Playback speed adjustment
- Download functionality
- PWA support for offline use
- Background music playback

## Project Structure

```
/
├── index.html           # Main HTML file
├── styles/              # CSS files
│   ├── main.css         # Common styles
│   ├── desktop.css      # Desktop-specific styles
│   └── mobile.css       # Mobile-specific styles
├── js/                  # JavaScript files
│   ├── main.js          # Main player functionality
│   ├── songs.js         # Playlist configuration
│   └── service-worker.js # PWA support
├── manifest.json        # Web App Manifest for PWA
└── LICENSE              # License information
```

## Usage

1. Clone the repository
2. Add your audio files to the root directory
3. Update the playlist in `js/songs.js` with your song information
4. Open `index.html` in a browser or deploy to GitHub Pages

## For Developers

The player will automatically detect the device type and load the appropriate CSS:
- Desktop: Shows playlist on the left side and music player on the right
- Mobile: Vertically stacked elements with streamlined controls optimized for touch

## License

This project is licensed under a custom MIT license - see the [LICENSE](LICENSE) file for details.

**Important Note**: The music content included with this player is personal and not for redistribution.

## Credits

Developed by KnarliX 
© 2023-Present KnarliX - All Rights Reserved