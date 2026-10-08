# 🌴 Jungle Rush - 3D Endless Temple Runner

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-049EF4?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Jungle Rush** is a high-octane 3D endless runner game set in an ancient, overgrown jungle temple. Built from the ground up using **Three.js** and **Vite**, players sprint through hazardous stone ruins, dodge deadly ancient pillars, leap over spiked barriers, slide under low stone arches, and gather mystical gold coins and power-ups while evading impending doom.

---

## 🎮 Play & Controls

### ⌨️ Desktop Controls
| Action | Key 1 | Key 2 |
| :--- | :--- | :--- |
| **Move Left** | `A` | `←` (Left Arrow) |
| **Move Right** | `D` | `→` (Right Arrow) |
| **Jump** | `Spacebar` | `↑` (Up Arrow) |
| **Slide** | `S` | `↓` (Down Arrow) |
| **Pause / Resume** | `Escape` | Pause Button (`⏸`) |

### 📱 Mobile & Touch Controls
- **Touch HUD**: Dedicated on-screen navigation buttons (`◀`, `▶`, `▲ JUMP`, `▼ SLIDE`).
- **Swipe Gestures**:
  - Swipe **Left / Right** to dodge between lanes.
  - Swipe **Up** to leap over obstacles and ground hazards.
  - Swipe **Down** to duck and slide beneath overhead beams.

---

## ✨ Features

- **⚡ Fast 3D WebGL Rendering**: Smooth 60+ FPS experience powered by Three.js with realistic fog, shadows, and dynamic directional lighting.
- **🏃 Responsive Player Mechanics**:
  - 3-Lane navigation with smooth interpolation (`lerp`).
  - Realistic gravity, jumping arcs, and rolling slide state machine.
  - Dynamic camera shake feedback upon near-misses and collisions.
- **✨ Power-Up System**:
  - **⚡ Speed Boost**: Burst forward with heightened velocity and temporary invincibility.
  - **🧲 Coin Magnet**: Pull all nearby coins straight toward the player.
  - **🛡️ Ancient Shield**: Protect yourself from a single collision impact.
  - Real-time HUD cooldown progress bars for all active power-ups.
- **🪙 Collectibles & Scoring**:
  - Spinning 3D gold coins with sheen and particle collection effects.
  - Distance counter, progressive speed scaling, and high score preservation via `localStorage`.
- **🔊 Procedural Web Audio Engine**: Zero external audio asset dependencies! Generates crisp, retro-arcade sound effects (jumps, coin pickups, power-ups, crashes) directly in the browser using the Web Audio API.
- **🎨 Ancient Temple UI**: Glassmorphism HUD, cinematic start screen, pause screen, and detailed game-over summary modal.
- **📱 Responsive & Cross-Platform**: Adapts dynamically across desktops, tablets, and smartphones.

---

## 🏛️ Project Architecture

```
jungle-rush/
├── public/                 # Static assets
│   └── favicon.svg         # Game crest icon
├── src/                    # Source code
│   ├── audio/              # Sound synthesis & audio management
│   │   └── SoundEffects.js # Web Audio API procedural sound effects
│   ├── controls/           # Input listeners
│   │   └── Controls.js     # Keyboard, touch button, & swipe gestures
│   ├── core/               # Engine core
│   │   └── GameManager.js  # Game loop, state machine, scene setup, collisions
│   ├── entities/           # Dynamic actors
│   │   └── Player.js       # Player model, animations, movement & jumping physics
│   ├── ui/                 # User Interface
│   │   └── UI.js           # HUD elements, menus, score counters, overlays
│   ├── world/              # Environment & procedural generation
│   │   ├── Coins.js        # Coin placement, spinning animation, collection
│   │   ├── Obstacles.js    # Spikes, stone blocks, and low-hanging barriers
│   │   ├── PowerUps.js     # Boost, Magnet, Shield objects and behaviors
│   │   └── World.js        # Endless track generator, temple pillars, foliage
│   └── main.js             # Application entry point
├── .editorconfig           # Editor consistency guidelines
├── .gitattributes          # Git line-ending normalization
├── .gitignore              # Ignored files (node_modules, dist, etc.)
├── index.html              # HTML shell & UI overlays
├── LICENSE                 # MIT License
├── package.json            # Node.js project manifest & dependencies
├── README.md               # Project documentation
└── style.css               # Temple theme styling, glassmorphism, animations
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18.0.0 or higher recommended) and **npm** installed on your system.

To verify your installation:
```bash
node -v
npm -v
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sagarbose276/Jungle-Rush.git
   cd Jungle-Rush
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL displayed in your terminal (typically `http://localhost:5173/`).

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches the local Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory. |
| `npm run preview` | Locally serves the production build from `dist/` to verify optimization. |

---

## 🌐 Deployment

### Deploying to GitHub Pages, Vercel, or Netlify

1. Build the production files:
   ```bash
   npm run build
   ```
2. The bundled output will be in the `dist/` directory.
3. You can deploy `dist/` to any static web hosting provider (Vercel, Netlify, Cloudflare Pages, or GitHub Pages).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Sagar Bose**
- GitHub: [@sagarbose276](https://github.com/sagarbose276)
