# 🐙 OCTOTAG: Deep Sea Chase

A fast-paced browser game where you chase and catch octopi using your net in a beautiful underwater environment.

## 🎮 Game Features

- **Dynamic Octopus Movement**: 100 octopi with intelligent movement patterns that react to your presence
- **Immersive Environment**: Beautiful underwater effects including ambient bubbles, light rays, and swaying seaweed
- **Responsive Controls**: Smooth cursor-based gameplay with a net that follows your mouse
- **Visual Feedback**: Satisfying pop and bubble effects when catching octopi
- **Progress Tracking**: Real-time score tracking and completion time display
- **Polished UI**: Marine-themed interface with animated elements and progress indicators

## 🏗️ Technical Architecture

### Component Structure
```
app/
├── components/
│   ├── Octopus.tsx       # Main game component
│   └── SeaShanty.tsx     # Audio component
├── layout.tsx            # App layout
└── page.tsx             # Entry point
```

### State Management
The game utilizes React's useState and useEffect hooks for managing:
- Octopus positions and states
- Player interaction
- Game progression
- Visual effects

### Performance Optimizations
1. **Render Optimization**
   - Efficient state updates
   - Batch processing for particle effects
   - Smart re-rendering using React.memo

2. **Animation System**
   - CSS-based animations for performance
   - Hardware-accelerated transforms
   - Optimized particle system

3. **State Updates**
   - Throttled event handlers
   - Batched state updates
   - Efficient collision detection

### Technical Highlights
- **TypeScript Integration**: Full type safety with interfaces for game entities
- **Modern React Patterns**: Functional components with hooks
- **Responsive Design**: Fluid layouts and adaptive gameplay
- **Performance First**: Optimized for 60 FPS gameplay

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/octotag.git
cd octotag
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

## 🎯 How to Play

1. Move your mouse cursor (net) around the screen to chase octopi
2. Get close to an octopus to catch it
3. Watch out for octopi trying to escape!
4. Try to catch all 100 octopi in the shortest time possible
5. Click the "Play Again" button to restart and try to beat your time

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React](https://reactjs.org/) - UI library
- CSS3 Animations - Smooth visual effects

## 🎨 Design Features

- Layered title effects with dynamic glow
- Ambient underwater particles
- Dynamic light rays
- Responsive octopus movement
- Smooth catching animations
- Progress tracking UI
- Victory screen with statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic chase games
- Underwater theme design inspired by marine biology
- Special thanks to the Next.js and React communities

## 🎮 Play Now

Visit [deployed URL] to play the game online!
