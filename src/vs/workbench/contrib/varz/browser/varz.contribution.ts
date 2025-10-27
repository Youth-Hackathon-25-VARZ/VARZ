/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { VARZWidget } from './varzWidget.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IVARZService } from './varzService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';

class VARZContribution extends Disposable {
	private varzWidget: VARZWidget | undefined;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ICommandService private readonly commandService: ICommandService,
		@IEditorService private readonly editorService: IEditorService
	) {
		super();
		this.initializeVARZ();
	}

	private initializeVARZ(): void {
		console.log('VARZ: Initializing VARZ contribution...');

		// Wait for DOM to be ready
		setTimeout(() => {
			this.createVARZToolbar();
		}, 1000);

		// Register commands
		this.registerCommands();
		console.log('VARZ: Commands registered');
	}

	private createVARZToolbar(): void {
		// Create container for VARZ widget
		const container = document.createElement('div');
		container.id = 'varz-widget-container';
		container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10000;
			background: #dc3545;
			color: white;
			padding: 8px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.3);
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		`;

		container.innerHTML = `
			<div style="display: flex; align-items: center; gap: 12px;">
				<h3 style="margin: 0; font-size: 16px;">🎙️ VARZ</h3>
				<button id="varz-voice-btn" style="background: white; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🎙️ Voice Input</button>
				<button id="varz-read-btn" style="background: white; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">📖 Read Code</button>
				<button id="varz-run-btn" style="background: white; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">▶️ Run Code</button>
				<button id="varz-save-btn" style="background: white; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">💾 Save File</button>
				<button id="varz-clear-btn" style="background: white; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🗑️ Clear</button>
			</div>
		`;

		document.body.appendChild(container);
		console.log('VARZ: Toolbar created and added to DOM');

		// Add button functionality
		this.setupVARZButtons(container);

		// Clean up on dispose
		this._register({
			dispose: () => {
				if (container.parentNode) {
					container.parentNode.removeChild(container);
				}
			}
		});
	}

	private setupVARZButtons(container: HTMLElement): void {
		const voiceBtn = container.querySelector('#varz-voice-btn');
		const readBtn = container.querySelector('#varz-read-btn');
		const runBtn = container.querySelector('#varz-run-btn');
		const saveBtn = container.querySelector('#varz-save-btn');
		const clearBtn = container.querySelector('#varz-clear-btn');

		if (voiceBtn) {
			voiceBtn.addEventListener('click', () => this.handleVoiceInput());
		}
		if (readBtn) {
			readBtn.addEventListener('click', () => this.handleReadCode());
		}
		if (runBtn) {
			runBtn.addEventListener('click', () => this.handleRunCode());
		}
		if (saveBtn) {
			saveBtn.addEventListener('click', () => this.handleSaveFile());
		}
		if (clearBtn) {
			clearBtn.addEventListener('click', () => this.handleClearEditor());
		}
	}

	private async handleVoiceInput(): Promise<void> {
		try {
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));
			varzService.speak('Voice input activated. Please speak your command.');
			varzService.startVoiceInput();
		} catch (error) {
			console.error('VARZ: Error in voice input:', error);
		}
	}

	private handleReadCode(): void {
		try {
			console.log('VARZ: Read code button clicked - attempt', Date.now());
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));

			// Get the active text editor using VS Code's editor service
			const activeEditor = this.editorService.activeTextEditorControl;
			if (!activeEditor) {
				console.log('VARZ: No active editor found');
				varzService.speak('No active editor found. Please open a file first.');
				return;
			}

			let codeToRead = '';
			let language = 'unknown';

			// Always try to get the full file content first
			if ('getModel' in activeEditor) {
				const model = (activeEditor as any).getModel();
				if (model) {
					// Get language from model
					language = model.getLanguageId() || 'unknown';

					// Check if there's a selection first
					const selection = (activeEditor as any).getSelection();
					if (selection && !selection.isEmpty()) {
						codeToRead = model.getValueInRange(selection);
						console.log('VARZ: Selected text:', codeToRead);
					} else {
						// No selection, get the entire file
						codeToRead = model.getValue();
						console.log('VARZ: Full file content:', codeToRead);
					}
				}
			}

			// Fallback: try to get selected text from DOM
			if (!codeToRead.trim()) {
				const selection = window.getSelection();
				if (selection && selection.toString().trim()) {
					codeToRead = selection.toString();
					console.log('VARZ: DOM selection:', codeToRead);
				}
			}

			if (codeToRead.trim()) {
				console.log('VARZ: Code to read:', codeToRead);
				console.log('VARZ: Language:', language);
				varzService.readCode(codeToRead, language);
			} else {
				console.log('VARZ: No code found');
				varzService.speak('No code found. Please open a file with code or select some text.');
			}
		} catch (error) {
			console.error('VARZ: Error reading code:', error);
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));
			varzService.speak('Error reading code. Please try again.');
		}
	}

	private async handleRunCode(): Promise<void> {
		try {
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));
			varzService.speak('Running code...');
			// Execute run command
			await this.commandService.executeCommand('workbench.action.debug.start');
		} catch (error) {
			console.error('VARZ: Error running code:', error);
		}
	}

	private async handleSaveFile(): Promise<void> {
		try {
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));
			varzService.speak('Saving file...');
			await this.commandService.executeCommand('workbench.action.files.save');
			varzService.speak('File saved successfully.');
		} catch (error) {
			console.error('VARZ: Error saving file:', error);
		}
	}

	private async handleClearEditor(): Promise<void> {
		try {
			const varzService = this.instantiationService.invokeFunction(accessor => accessor.get(IVARZService));
			varzService.speak('Clearing editor...');
			await this.commandService.executeCommand('editor.action.selectAll');
			await this.commandService.executeCommand('editor.action.clipboardCutAction');
			varzService.speak('Editor cleared.');
		} catch (error) {
			console.error('VARZ: Error clearing editor:', error);
		}
	}

	private registerCommands(): void {
		// Toggle VARZ toolbar
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.toggle') {
				if (this.varzWidget) {
					this.varzWidget.toggle();
				}
			}
		});

		// VARZ voice input command
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.voiceInput') {
				if (this.varzWidget) {
					(this.varzWidget as any).handleVoiceInput();
				}
			}
		});

		// VARZ read code command
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.readCode') {
				if (this.varzWidget) {
					(this.varzWidget as any).handleReadCode();
				}
			}
		});

		// VARZ run code command
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.runCode') {
				if (this.varzWidget) {
					(this.varzWidget as any).handleRunCode();
				}
			}
		});

		// VARZ save file command
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.saveFile') {
				if (this.varzWidget) {
					(this.varzWidget as any).handleSaveFile();
				}
			}
		});

		// VARZ clear editor command
		this.commandService.onWillExecuteCommand(e => {
			if (e.commandId === 'varz.clearEditor') {
				if (this.varzWidget) {
					(this.varzWidget as any).handleClearEditor();
				}
			}
		});
	}
}

// Register VARZ contribution
Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(VARZContribution, LifecyclePhase.Restored);
