/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

export const IVARZService = createDecorator<IVARZService>('varzService');

export interface IVARZService {
	readonly _serviceBrand: undefined;
	readonly onDidSpeak: Event<string>;
	readonly onDidRecognizeSpeech: Event<string>;

	speak(text: string): void;
	readCode(code: string, language?: string): void;
	executeCommand(command: string): string;
	startVoiceInput(): void;
	stopVoiceInput(): void;
	generateCodeFromSpeech(description: string): string;
}

/**
 * VARZ - Visually Accessible Recognition Zone
 * AI-powered voice coding for visually impaired users
 */
export class VARZService extends Disposable implements IVARZService {
	readonly _serviceBrand: undefined;

	private _onDidSpeak = this._register(new Emitter<string>());
	readonly onDidSpeak = this._onDidSpeak.event;

	private _onDidRecognizeSpeech = this._register(new Emitter<string>());
	readonly onDidRecognizeSpeech = this._onDidRecognizeSpeech.event;

	private recognition: any = null;
	private isListening = false;

	speak(text: string): void {
		console.log('VARZ: Speaking text:', text);
		// Use browser's Text-to-Speech API with enhanced voice settings
		if ('speechSynthesis' in window) {
			// Stop any current speech
			speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(text);

			// Enhanced voice settings for better quality
			utterance.rate = 0.85;  // Slightly slower for clarity
			utterance.volume = 0.9; // Higher volume
			utterance.pitch = 1.0;  // Normal pitch
			utterance.lang = 'en-US';

			// Try to use a high-quality voice
			const voices = speechSynthesis.getVoices();
			const preferredVoices = [
				'Microsoft Zira Desktop - English (United States)',
				'Microsoft David Desktop - English (United States)',
				'Google US English',
				'Alex',
				'Samantha',
				'Victoria'
			];

			for (const preferredVoice of preferredVoices) {
				const voice = voices.find(v => v.name.includes(preferredVoice) || v.name === preferredVoice);
				if (voice) {
					utterance.voice = voice;
					break;
				}
			}

			// If no preferred voice found, use the first available English voice
			if (!utterance.voice) {
				const englishVoice = voices.find(v => v.lang.startsWith('en'));
				if (englishVoice) {
					utterance.voice = englishVoice;
				}
			}

			// Add event listeners for better control
			utterance.onstart = () => {
				console.log('VARZ: Speech started');
			};

			utterance.onend = () => {
				console.log('VARZ: Speech ended');
			};

			utterance.onerror = (event) => {
				console.error('VARZ: Speech error:', event.error);
			};

			speechSynthesis.speak(utterance);
		}
		this._onDidSpeak.fire(text);
	}

	readCode(code: string, language?: string): void {
		// Read code with explanations
		const explanation = this.explainCode(code, language);
		this.speak(explanation);
	}

	executeCommand(command: string): string {
		const cmd = command.toLowerCase().trim();

		if (cmd.includes('run')) {
			this.speak('Running code.');
			return 'run';
		} else if (cmd.includes('save')) {
			this.speak('Saving file.');
			return 'save';
		} else if (cmd.includes('clear')) {
			this.speak('Clearing editor.');
			return 'clear';
		}

		this.speak('Command not recognized.');
		return '';
	}

	private explainCode(code: string, language?: string): string {
		const lines = code.split('\n').filter(line => line.trim().length > 0);
		const nonEmptyLines = lines.filter(line => !this.isComment(line.trim()));

		if (nonEmptyLines.length === 0) {
			return 'This code appears to be empty or contains only comments.';
		}

		// Analyze the overall structure and purpose
		const analysis = this.analyzeCodeStructure(nonEmptyLines, language);

		// Create a summary based on the analysis
		let summary = '';

		if (language && language !== 'unknown') {
			summary += `This ${language} code `;
		} else {
			summary += 'This code ';
		}

		// Main functionality summary
		if (analysis.hasLoop && analysis.hasPrint) {
			const loopCount = this.extractLoopCount(nonEmptyLines);
			const printMessage = this.extractPrintMessage(nonEmptyLines);
			summary += `prints "${printMessage}" ${loopCount} times`;
		} else if (analysis.hasFunction) {
			summary += `defines a function called ${analysis.functionName}`;
			if (analysis.hasReturn) {
				summary += ' that returns a value';
			}
		} else if (analysis.hasPrint) {
			const printMessage = this.extractPrintMessage(nonEmptyLines);
			summary += `prints "${printMessage}"`;
		} else if (analysis.hasVariable) {
			summary += `creates and uses variables`;
		} else if (analysis.hasConditional) {
			summary += `contains conditional logic`;
		} else if (analysis.hasImport) {
			summary += `imports external modules`;
		} else {
			summary += `performs various operations`;
		}

		// Add additional context
		if (analysis.hasLoop && !analysis.hasPrint) {
			summary += ' using a loop';
		}
		if (analysis.hasConditional && !analysis.hasLoop) {
			summary += ' with conditional statements';
		}
		if (analysis.hasVariable && !analysis.hasFunction) {
			summary += ' with variable assignments';
		}

		summary += '.';

		return summary;
	}

	private analyzeCodeStructure(lines: string[], language?: string): any {
		const analysis = {
			hasFunction: false,
			hasLoop: false,
			hasPrint: false,
			hasVariable: false,
			hasConditional: false,
			hasReturn: false,
			hasImport: false,
			functionName: '',
			loopType: '',
			printMessages: [] as string[]
		};

		for (const line of lines) {
			const trimmed = line.trim();

			// Check for functions
			if (this.isFunctionDefinition(trimmed, language)) {
				analysis.hasFunction = true;
				const funcInfo = this.analyzeFunctionDefinition(trimmed, language);
				if (funcInfo) {
					analysis.functionName = funcInfo.name;
				}
			}

			// Check for loops
			if (this.isLoopStatement(trimmed)) {
				analysis.hasLoop = true;
				if (trimmed.includes('for ')) {
					analysis.loopType = 'for';
				} else if (trimmed.includes('while ')) {
					analysis.loopType = 'while';
				}
			}

			// Check for print statements
			if (this.isConsoleOutput(trimmed)) {
				analysis.hasPrint = true;
				const message = this.extractPrintMessage([trimmed]);
				if (message) {
					analysis.printMessages.push(message);
				}
			}

			// Check for variables
			if (this.isVariableAssignment(trimmed)) {
				analysis.hasVariable = true;
			}

			// Check for conditionals
			if (this.isConditionalStatement(trimmed)) {
				analysis.hasConditional = true;
			}

			// Check for return statements
			if (trimmed.includes('return')) {
				analysis.hasReturn = true;
			}

			// Check for imports
			if (this.isImportStatement(trimmed)) {
				analysis.hasImport = true;
			}
		}

		return analysis;
	}

	private extractLoopCount(lines: string[]): string {
		for (const line of lines) {
			const trimmed = line.trim();

			// Python range
			const pythonRange = trimmed.match(/range\s*\(\s*(\d+)\s*\)/);
			if (pythonRange) {
				return pythonRange[1];
			}

			// JavaScript for loop
			const jsFor = trimmed.match(/for\s*\(\s*\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)\s*;\s*\w+\+\+\)/);
			if (jsFor) {
				return jsFor[1];
			}

			// Generic number in loop
			const numberMatch = trimmed.match(/(\d+)/);
			if (numberMatch) {
				return numberMatch[1];
			}
		}
		return 'multiple';
	}

	private extractPrintMessage(lines: string[]): string {
		for (const line of lines) {
			const trimmed = line.trim();

			// Python print
			const pythonPrint = trimmed.match(/print\s*\(\s*['"]([^'"]+)['"]\s*\)/);
			if (pythonPrint) {
				return pythonPrint[1];
			}

			// JavaScript console.log
			const jsPrint = trimmed.match(/console\.log\s*\(\s*['"]([^'"]+)['"]\s*\)/);
			if (jsPrint) {
				return jsPrint[1];
			}

			// Java System.out.println
			const javaPrint = trimmed.match(/System\.out\.println\s*\(\s*['"]([^'"]+)['"]\s*\)/);
			if (javaPrint) {
				return javaPrint[1];
			}

			// Generic string in print
			const stringMatch = trimmed.match(/['"]([^'"]+)['"]/);
			if (stringMatch) {
				return stringMatch[1];
			}
		}
		return 'something';
	}

	private isComment(line: string): boolean {
		return line.startsWith('//') ||
			line.startsWith('#') ||
			line.startsWith('/*') ||
			line.startsWith('<!--') ||
			line.startsWith('*') ||
			line.startsWith('--');
	}

	private isLoopStatement(line: string): boolean {
		return line.includes('for ') || line.includes('while ') || line.includes('do ');
	}

	private isConsoleOutput(line: string): boolean {
		return line.includes('console.log') ||
			line.includes('print(') ||
			line.includes('System.out.println') ||
			line.includes('printf') ||
			line.includes('cout') ||
			line.includes('echo');
	}

	private isConditionalStatement(line: string): boolean {
		return line.includes('if ') || line.includes('else if') || line.includes('else');
	}

	private isImportStatement(line: string): boolean {
		return line.includes('import ') ||
			line.includes('require(') ||
			line.includes('#include') ||
			line.includes('using ');
	}

	// Helper methods for detailed code analysis
	private isFunctionDefinition(line: string, language?: string): boolean {
		const patterns = [
			/function\s+\w+/,
			/def\s+\w+/,
			/const\s+\w+\s*=.*=>/,
			/(public|private|protected|static)\s+\w+\s+\w+\s*\(/,
			/(void|int|string|bool|float)\s+\w+\s*\(/,
			/\w+\s*\([^)]*\)\s*{/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private analyzeFunctionDefinition(line: string, language?: string): any {
		const funcMatch = line.match(/(?:function\s+(\w+)|def\s+(\w+)|const\s+(\w+)\s*=.*=>|(?:public|private|protected|static)?\s*(?:void|int|string|bool|\w+)\s+(\w+)\s*\(|(\w+)\s*\([^)]*\)\s*{)/);
		if (funcMatch) {
			const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4] || funcMatch[5];
			const params = this.extractParameters(line);
			const returnType = this.extractReturnType(line);

			return {
				name,
				parameters: params,
				returnType,
				explanation: `This defines a function called "${name}".`
			};
		}
		return null;
	}

	private isVariableAssignment(line: string): boolean {
		return line.includes('=') &&
			!line.includes('==') &&
			!line.includes('!=') &&
			!line.includes('>=') &&
			!line.includes('<=') &&
			!line.includes('=>');
	}


	private extractParameters(line: string): string[] {
		const paramMatch = line.match(/\(([^)]*)\)/);
		if (paramMatch && paramMatch[1].trim()) {
			return paramMatch[1].split(',').map(p => p.trim());
		}
		return [];
	}

	private extractReturnType(line: string): string | null {
		const typeMatch = line.match(/(?:void|int|string|bool|float|double|char)\s+\w+\s*\(/);
		if (typeMatch) {
			return typeMatch[1] || 'unknown';
		}
		return null;
	}

	startVoiceInput(): void {
		console.log('VARZ: Starting voice input...');
		if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
			console.log('VARZ: Speech recognition not supported');
			this.speak('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
			return;
		}

		if (this.isListening) {
			console.log('VARZ: Already listening');
			this.speak('Already listening for voice input.');
			return;
		}

		// Initialize speech recognition
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		this.recognition = new SpeechRecognition();

		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.lang = 'en-US';
		this.recognition.maxAlternatives = 1;

		this.recognition.onstart = () => {
			this.isListening = true;
			this.speak('Listening for your voice command. Please speak now.');
		};

		this.recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			this._onDidRecognizeSpeech.fire(transcript);
			this.speak(`I heard: ${transcript}. Processing your request.`);

			// Process the voice command
			this.processVoiceCommand(transcript);
		};

		this.recognition.onerror = (event: any) => {
			this.isListening = false;
			this.speak(`Speech recognition error: ${event.error}. Please try again.`);
		};

		this.recognition.onend = () => {
			this.isListening = false;
		};

		this.recognition.start();
	}

	stopVoiceInput(): void {
		if (this.recognition && this.isListening) {
			this.recognition.stop();
			this.isListening = false;
			this.speak('Stopped listening for voice input.');
		}
	}

	generateCodeFromSpeech(description: string): string {
		// Simple code generation based on common patterns
		const lowerDesc = description.toLowerCase();

		// Function generation
		if (lowerDesc.includes('function') || lowerDesc.includes('create a function')) {
			const funcName = this.extractFunctionName(description);
			if (lowerDesc.includes('add') || lowerDesc.includes('sum')) {
				return `function ${funcName}(a, b) {\n    return a + b;\n}`;
			} else if (lowerDesc.includes('multiply') || lowerDesc.includes('times')) {
				return `function ${funcName}(a, b) {\n    return a * b;\n}`;
			} else if (lowerDesc.includes('hello') || lowerDesc.includes('greet')) {
				return `function ${funcName}(name) {\n    return "Hello, " + name + "!";\n}`;
			} else {
				return `function ${funcName}() {\n    // Your code here\n    return null;\n}`;
			}
		}

		// Variable assignment
		if (lowerDesc.includes('variable') || lowerDesc.includes('let') || lowerDesc.includes('const')) {
			const varName = this.extractVariableName(description);
			if (lowerDesc.includes('number') || lowerDesc.includes('integer')) {
				return `let ${varName} = 0;`;
			} else if (lowerDesc.includes('string') || lowerDesc.includes('text')) {
				return `let ${varName} = "";`;
			} else if (lowerDesc.includes('array') || lowerDesc.includes('list')) {
				return `let ${varName} = [];`;
			} else {
				return `let ${varName} = null;`;
			}
		}

		// Loop generation
		if (lowerDesc.includes('loop') || lowerDesc.includes('for') || lowerDesc.includes('while')) {
			if (lowerDesc.includes('for') && lowerDesc.includes('each')) {
				return `for (let item of array) {\n    console.log(item);\n}`;
			} else if (lowerDesc.includes('while')) {
				return `while (condition) {\n    // Your code here\n}`;
			} else {
				return `for (let i = 0; i < 10; i++) {\n    console.log(i);\n}`;
			}
		}

		// Conditional statements
		if (lowerDesc.includes('if') || lowerDesc.includes('condition')) {
			return `if (condition) {\n    // Your code here\n} else {\n    // Alternative code\n}`;
		}

		// Console output
		if (lowerDesc.includes('print') || lowerDesc.includes('console') || lowerDesc.includes('log')) {
			const message = this.extractMessage(description);
			return `console.log("${message}");`;
		}

		// Default response
		return `// Generated code for: ${description}\n// Please modify as needed\nconsole.log("Hello, World!");`;
	}

	private processVoiceCommand(transcript: string): void {
		const lowerTranscript = transcript.toLowerCase();

		// Handle direct commands
		if (lowerTranscript.includes('run') || lowerTranscript.includes('execute')) {
			this.executeCommand('run');
		} else if (lowerTranscript.includes('save')) {
			this.executeCommand('save');
		} else if (lowerTranscript.includes('clear') || lowerTranscript.includes('delete')) {
			this.executeCommand('clear');
		} else if (lowerTranscript.includes('read') || lowerTranscript.includes('explain') ||
			lowerTranscript.includes('what does this code do') || lowerTranscript.includes('what does this do') ||
			lowerTranscript.includes('explain this code') || lowerTranscript.includes('tell me about this code') ||
			lowerTranscript.includes('summarize this code')) {
			// Voice-activated code reading
			this.speak('Reading and explaining the code...');
			this.readCodeFromVoice();
		} else if (lowerTranscript.includes('generate') || lowerTranscript.includes('create') || lowerTranscript.includes('write')) {
			// Generate code from speech
			const generatedCode = this.generateCodeFromSpeech(transcript);
			this.speak(`I'll generate code for you: ${generatedCode}`);
			// In a real implementation, this would insert the code into the editor
		} else {
			this.speak(`I didn't understand that command. Please try saying "read code", "explain this code", "run code", "save file", or "clear editor".`);
		}
	}

	private readCodeFromVoice(): void {
		try {
			// Try to get the active editor content
			const activeEditor = document.querySelector('.monaco-editor');
			if (!activeEditor) {
				this.speak('No active editor found. Please open a file first.');
				return;
			}

			// Try to get code from Monaco editor
			let codeToRead = '';
			let language = 'unknown';

			// Try to access Monaco editor instance
			const editorElement = activeEditor as any;
			if (editorElement && editorElement.__monacoEditor) {
				const editor = editorElement.__monacoEditor;
				const model = editor.getModel();
				if (model) {
					codeToRead = model.getValue();
					language = model.getLanguageId() || 'unknown';
				}
			}

			// Fallback: try to get selected text
			if (!codeToRead.trim()) {
				const selection = window.getSelection();
				if (selection && selection.toString().trim()) {
					codeToRead = selection.toString();
				}
			}

			if (codeToRead.trim()) {
				console.log('VARZ: Voice reading code:', codeToRead);
				console.log('VARZ: Language:', language);
				this.readCode(codeToRead, language);
			} else {
				this.speak('No code found. Please open a file with code or select some text.');
			}
		} catch (error) {
			console.error('VARZ: Error in voice code reading:', error);
			this.speak('Error reading code. Please try again.');
		}
	}

	private extractFunctionName(description: string): string {
		const match = description.match(/(?:function|create)\s+(\w+)/i);
		return match ? match[1] : 'myFunction';
	}

	private extractVariableName(description: string): string {
		const match = description.match(/(?:variable|let|const)\s+(\w+)/i);
		return match ? match[1] : 'myVariable';
	}

	private extractMessage(description: string): string {
		const match = description.match(/(?:print|log|say)\s+(.+)/i);
		return match ? match[1].trim() : 'Hello, World!';
	}
}
