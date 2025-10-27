/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IVARZService } from './varzService.js';

// VARZ Commands
export const VARZ_COMMANDS = {
	TOGGLE: 'varz.toggle',
	VOICE_INPUT: 'varz.voiceInput',
	READ_CODE: 'varz.readCode',
	RUN_CODE: 'varz.runCode',
	SAVE_FILE: 'varz.saveFile',
	CLEAR_EDITOR: 'varz.clearEditor'
} as const;

// Register VARZ Toggle Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.TOGGLE,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		varzService.speak('VARZ is working! This is a test message.');
	}
});

// Register VARZ Voice Input Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.VOICE_INPUT,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		varzService.speak('Voice input activated. Please speak your command.');
		varzService.startVoiceInput();
	}
});

// Register VARZ Read Code Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.READ_CODE,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		// This will be handled by the widget
		varzService.speak('Reading code from active editor.');
	}
});

// Register VARZ Run Code Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.RUN_CODE,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		varzService.speak('Running code...');
	}
});

// Register VARZ Save File Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.SAVE_FILE,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		varzService.speak('Saving file...');
	}
});

// Register VARZ Clear Editor Command
CommandsRegistry.registerCommand({
	id: VARZ_COMMANDS.CLEAR_EDITOR,
	handler: async (accessor) => {
		const varzService = accessor.get(IVARZService);
		varzService.speak('Clearing editor...');
	}
});

// Register Keybindings
KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.TOGGLE,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyMod.CtrlCmd | KeyCode.KeyV,
	secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyV]
});

KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.VOICE_INPUT,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyCode.F1
});

KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.READ_CODE,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyCode.F2
});

KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.RUN_CODE,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyCode.F3
});

KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.SAVE_FILE,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyCode.F4
});

KeybindingsRegistry.registerKeybindingRule({
	id: VARZ_COMMANDS.CLEAR_EDITOR,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	primary: KeyCode.F5
});
