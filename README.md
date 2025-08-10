# Sudoku Platform

A comprehensive cross-platform Sudoku application designed to be the definitive Sudoku experience, similar to how chess.com revolutionized online chess.

## Features

- 🧩 **Extensive Puzzle Library**: 10,000+ unique puzzles across 5 difficulty levels
- 🎯 **Multiple Game Modes**: Classic, Killer, X-Sudoku, Hyper, Mini 6x6, and Mega 16x16
- 📱 **Cross-Platform**: Web (PWA), iOS, and Android with seamless sync
- 🏆 **Competitive Play**: Daily challenges, tournaments, and global leaderboards
- 🎓 **Learning System**: Interactive tutorials, hints, and strategy guides
- 👥 **Social Features**: Friends, puzzle sharing, and community discussions
- 📊 **Advanced Statistics**: ELO rating system, detailed analytics, and achievements
- 🎨 **Customizable UI**: Multiple themes, accessibility features, and preferences
- 🔄 **Offline Support**: Full functionality without internet connection

## Architecture

This project uses a monorepo structure with shared TypeScript core logic and platform-specific implementations:

```
sudoku-platform/
├── packages/
│   ├── shared/          # Core business logic and types
│   ├── web/            # Progressive Web App (React + Vite)
│   ├── ios/            # Native iOS app (Swift + SwiftUI)
│   └── android/        # Native Android app (Kotlin + Compose)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- For iOS: Xcode 15+
- For Android: Android Studio Hedgehog+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sudoku-platform

# Install dependencies
npm install

# Build shared package
npm run build -w @sudoku-platform/shared
```

### Development

```bash
# Start web development server
npm run dev -w @sudoku-platform/web

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

- **packages/shared**: Core TypeScript interfaces, types, and business logic
- **packages/web**: React-based Progressive Web App
- **packages/ios**: Native iOS application
- **packages/android**: Native Android application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.