# Sudoku Platform - iOS

Native iOS application built with Swift and SwiftUI.

## Requirements

- Xcode 15.0+
- iOS 16.0+
- Swift 5.9+

## Setup

1. Open the project in Xcode
2. Configure signing and capabilities
3. Build and run on simulator or device

## Architecture

The iOS app follows MVVM architecture with:
- SwiftUI for UI
- Combine for reactive programming
- Core Data for local storage
- Shared business logic from TypeScript core

## Build

```bash
# Build from command line
xcodebuild -workspace SudokuPlatform.xcworkspace -scheme SudokuPlatform -configuration Debug
```

## Testing

```bash
# Run tests
xcodebuild test -workspace SudokuPlatform.xcworkspace -scheme SudokuPlatform -destination 'platform=iOS Simulator,name=iPhone 15'
```