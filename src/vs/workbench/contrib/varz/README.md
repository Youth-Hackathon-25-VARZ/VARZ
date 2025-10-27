# VARZ - Visually Accessible Recognition Zone

## Overview

VARZ is an AI-powered, voice-driven coding environment designed specifically for blind and visually impaired users. It transforms VS Code into an accessible coding platform where users can:

- **Speak natural language** to generate code
- **Hear code and explanations** read aloud
- **Run, edit, and debug** code completely through voice and audio feedback

## Features

### Core Features (Implemented) | Advanced Features (Planned)

#### 1. Text-to-Speech (Audio Feedback) | Voice-to-Code (Speech Recognition + AI)
- ✅ Reads generated code line by line | 🔄 Uses Web Speech API to capture voice input
- ✅ Provides explanations of code functionality | 🔄 Converts spoken descriptions into executable code
- ✅ Adjustable speech rate, pitch, and volume | 🔄 Automatically inserts generated code into the editor

#### 2. Voice Commands for IDE Actions | AI-Powered Code Generation
**Basic Commands (Implemented):** | **Advanced Commands (Planned):**
- ✅ "Run the code" → Executes the current file | 🔄 "Explain this function" → AI describes function purpose
- ✅ "Save file" → Triggers save | 🔄 "Add comments" → AI adds inline comments
- ✅ "Clear editor" → Wipes the code area | 🔄 "Generate test cases" → AI creates unit tests
- | 🔄 "Refactor this code" → AI optimizes code structure

#### 3. Accessibility Enhancements | Advanced Accessibility Features
- ✅ High contrast mode support | 🔄 Voice-controlled debugging
- ✅ Scalable font sizes | 🔄 Multi-language TTS support
- ✅ Comprehensive ARIA labels | 🔄 Offline speech recognition support
- ✅ Keyboard shortcuts for all major actions | 🔄 Advanced code explanation AI

## Architecture

### Core Services (Implemented) | Advanced Services (Planned)

#### 1. **VARZService** (`varzService.ts`) | **SpeechToCodeService** (`speechToCode.ts`)
- ✅ Provides audio feedback using Web Speech Synthesis API | 🔄 Handles speech recognition using Web Speech API
- ✅ Reads code and explanations aloud | 🔄 Captures and processes voice input
- ✅ Configurable voice settings | 🔄 Converts speech to text
- ✅ Basic voice command execution | 🔄 Advanced speech processing

#### 2. **Code Explanation Engine** (Built-in) | **AIControllerService** (`aiController.ts`)
- ✅ Heuristic-based code analysis | 🔄 Orchestrates the voice-to-code workflow
- ✅ Function and variable detection | 🔄 Integrates speech-to-code and text-to-speech services
- ✅ Control flow recognition | 🔄 Handles AI-powered code generation
- ✅ Basic pattern matching | 🔄 Advanced AI model integration

## Usage

### Starting Voice Input
1. Press the voice input button (🎙️) in the toolbar
2. Describe the code you want to generate (e.g., "Create a function that returns the factors of a number in Python")
3. The system will generate the code and read it back to you

### Running Voice Commands
Simply speak commands like:
- "Run the code"
- "Explain this function"
- "Save file"
- "Clear editor"

### Reading Code Aloud
- Press the "Read Code" button to hear the current code
- Code will be explained line by line with natural language

## Installation

VARZ is integrated directly into VS Code. To enable it:

1. Compile the project: `npm run compile`
2. Launch VS Code: `npm run electron`
3. Enable VARZ in settings

## Configuration

### Speech Settings
```json
{
  "varz.speech.rate": 0.9,
  "varz.speech.pitch": 1.0,
  "varz.speech.volume": 0.8,
  "varz.speech.lang": "en-US"
}
```

### Voice Commands
Voice commands can be customized in the settings:
```json
{
  "varz.commands.run": ["run", "execute"],
  "varz.commands.save": ["save", "save file"],
  "varz.commands.clear": ["clear", "delete", "wipe"]
}
```

## Low Vision Features

- **High Contrast Theme**: Automatically applies high contrast when enabled
- **Large Font Sizes**: Scalable font size up to 24pt
- **Color Blind Friendly**: Color palettes optimized for color vision deficiencies
- **Focus Indicators**: Enhanced focus indicators for keyboard navigation

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Partial support (may require additional configuration)
- **Safari**: Basic support (limited speech recognition)

## Development

### Prerequisites
- Node.js 16+
- npm or yarn
- VS Code source code

### Building
```bash
npm run compile
```

### Running
```bash
npm run electron
```

## Future Enhancements

### Short-term Goals (Next Release) | Long-term Vision (Advanced Features)

#### Basic Improvements | AI-Powered Features
- [ ] Voice command customization | [ ] Integration with OpenAI GPT-4/5 for advanced code generation
- [ ] Support for multiple programming languages | [ ] Advanced code explanation AI
- [ ] Enhanced error handling | [ ] Voice-controlled debugging
- [ ] Better code formatting | [ ] AI-powered code refactoring

#### Accessibility Enhancements | Advanced Capabilities
- [ ] Multi-language TTS support | [ ] Offline speech recognition support
- [ ] Improved screen reader integration | [ ] Advanced voice command parsing
- [ ] Better keyboard navigation | [ ] Context-aware code suggestions
- [ ] Enhanced focus management | [ ] Intelligent code completion via voice

## Contributing

Contributions are welcome! Please ensure all changes maintain accessibility standards and include:
- ARIA labels for interactive elements
- Keyboard shortcut support
- Screen reader compatibility
- High contrast mode support

## License

MIT License - See LICENSE file in the VS Code root directory

## Acknowledgments

- Web Speech API for speech recognition and synthesis
- VS Code accessibility team for inspiration
- Open source accessibility community

## Support

For issues or feature requests, please open an issue on the VS Code GitHub repository with the `varz` label.
