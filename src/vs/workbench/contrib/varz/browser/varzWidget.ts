/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IVARZService } from './varzService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { localize } from '../../../../nls.js';

export class VARZWidget extends Disposable {
	private readonly container: HTMLElement;
	private toolbar!: HTMLElement;
	private voiceButton!: HTMLButtonElement;
	private readButton!: HTMLButtonElement;
	private runButton!: HTMLButtonElement;
	private saveButton!: HTMLButtonElement;
	private clearButton!: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		@IVARZService private readonly varzService: IVARZService,
		@IEditorService private readonly editorService: IEditorService,
		@ICommandService private readonly commandService: ICommandService
	) {
		super();
		console.log('VARZ Widget: Constructor called');
		this.container = container;
		this.createWidget();
		console.log('VARZ Widget: Widget created successfully');
	}

	private createWidget(): void {
		// Create main container
		this.container.className = 'varz-widget';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 1000;
			background: var(--vscode-editor-background);
			border-bottom: 2px solid #dc3545;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		`;

		// Create toolbar
		this.toolbar = document.createElement('div');
		this.toolbar.className = 'varz-toolbar';
		this.container.appendChild(this.toolbar);

		// Create voice input button
		this.voiceButton = this.createButton(
			'varz-voice-button',
			localize('varz.voiceInput', 'Voice Input'),
			'🎙️',
			() => this.handleVoiceInput()
		);

		// Create read code button
		this.readButton = this.createButton(
			'varz-read-button',
			localize('varz.readCode', 'Read Code'),
			'📖',
			() => this.handleReadCode()
		);

		// Create run code button
		this.runButton = this.createButton(
			'varz-run-button',
			localize('varz.runCode', 'Run Code'),
			'▶️',
			() => this.handleRunCode()
		);

		// Create save button
		this.saveButton = this.createButton(
			'varz-save-button',
			localize('varz.saveFile', 'Save File'),
			'💾',
			() => this.handleSaveFile()
		);

		// Create clear button
		this.clearButton = this.createButton(
			'varz-clear-button',
			localize('varz.clearEditor', 'Clear Editor'),
			'🗑️',
			() => this.handleClearEditor()
		);

		// Add buttons to toolbar
		this.toolbar.appendChild(this.voiceButton);
		this.toolbar.appendChild(this.readButton);
		this.toolbar.appendChild(this.runButton);
		this.toolbar.appendChild(this.saveButton);
		this.toolbar.appendChild(this.clearButton);

		// Add keyboard shortcuts
		this.setupKeyboardShortcuts();
	}

	private createButton(className: string, label: string, icon: string, onClick: () => void): HTMLButtonElement {
		const button = document.createElement('button');
		button.className = `varz-button ${className}`;
		button.textContent = label;
		button.setAttribute('aria-label', label);
		button.setAttribute('data-label', label);
		button.title = label;

		// Add icon
		const iconSpan = document.createElement('span');
		iconSpan.textContent = icon;
		iconSpan.style.marginRight = '8px';
		iconSpan.style.fontSize = '18px';
		button.insertBefore(iconSpan, button.firstChild);

		// Add click handler
		button.addEventListener('click', onClick);
		this._register({ dispose: () => button.removeEventListener('click', onClick) });

		return button;
	}

	private setupKeyboardShortcuts(): void {
		// Add keyboard shortcuts for accessibility
		const shortcuts = [
			{ key: 'F1', handler: () => this.voiceButton.click() },
			{ key: 'F2', handler: () => this.readButton.click() },
			{ key: 'F3', handler: () => this.runButton.click() },
			{ key: 'F4', handler: () => this.saveButton.click() },
			{ key: 'F5', handler: () => this.clearButton.click() }
		];

		const handleKeyDown = (e: KeyboardEvent) => {
			const shortcut = shortcuts.find(s => e.key === s.key);
			if (shortcut && !e.ctrlKey && !e.altKey && !e.shiftKey) {
				e.preventDefault();
				shortcut.handler();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		this._register({ dispose: () => document.removeEventListener('keydown', handleKeyDown) });
	}

	private async handleVoiceInput(): Promise<void> {
		console.log('VARZ Widget: Voice input button clicked');
		this.varzService.speak('Voice input activated. Please speak your command.');

		// Add listening visual indicator
		this.voiceButton.classList.add('listening');

		this.varzService.startVoiceInput();

		// Listen for speech recognition results
		this.varzService.onDidRecognizeSpeech((transcript) => {
			console.log('VARZ: Recognized speech:', transcript);
			// Remove listening indicator
			this.voiceButton.classList.remove('listening');
		});

		// Remove listening indicator after 10 seconds if no speech detected
		setTimeout(() => {
			this.voiceButton.classList.remove('listening');
		}, 10000);
	}

	private handleReadCode(): void {
		console.log('VARZ Widget: Read code button clicked');
		const activeEditor = this.editorService.activeTextEditorControl;
		if (activeEditor && 'getValue' in activeEditor) {
			const code = (activeEditor as any).getValue();
			console.log('VARZ Widget: Code found:', code);
			if (code && code.trim()) {
				this.varzService.readCode(code);
			} else {
				this.varzService.speak('No code to read. Please open a file with code.');
			}
		} else {
			console.log('VARZ Widget: No active editor found');
			this.varzService.speak('No active editor found. Please open a file first.');
		}
	}

	private async handleRunCode(): Promise<void> {
		this.varzService.speak('Running code...');

		// Execute the run command
		try {
			await this.commandService.executeCommand('workbench.action.debug.start');
			this.varzService.speak('Code execution started.');
		} catch (error) {
			this.varzService.speak('Failed to run code. Please check your code for errors.');
		}
	}

	private async handleSaveFile(): Promise<void> {
		this.varzService.speak('Saving file...');

		// Execute the save command
		try {
			await this.commandService.executeCommand('workbench.action.files.save');
			this.varzService.speak('File saved successfully.');
		} catch (error) {
			this.varzService.speak('Failed to save file.');
		}
	}

	private async handleClearEditor(): Promise<void> {
		this.varzService.speak('Clearing editor...');

		const activeEditor = this.editorService.activeTextEditorControl;
		if (activeEditor && 'setValue' in activeEditor) {
			(activeEditor as any).setValue('');
			this.varzService.speak('Editor cleared.');
		} else {
			this.varzService.speak('No active editor to clear.');
		}
	}

	public show(): void {
		this.container.style.display = 'block';
		this.varzService.speak('VARZ toolbar activated.');
	}

	public hide(): void {
		this.container.style.display = 'none';
		this.varzService.speak('VARZ toolbar hidden.');
	}

	public toggle(): void {
		if (this.container.style.display === 'none') {
			this.show();
		} else {
			this.hide();
		}
	}
}
