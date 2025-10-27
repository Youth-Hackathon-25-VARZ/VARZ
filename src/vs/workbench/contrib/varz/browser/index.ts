/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// VARZ Service
export { IVARZService, VARZService } from './varzService.js';

// VARZ Widget
export { VARZWidget } from './varzWidget.js';

// VARZ Commands
export { VARZ_COMMANDS } from './varzCommands.js';

// VARZ Service Registration
import './varzServiceRegistration.js';

// VARZ Contribution (auto-registers)
import './varz.contribution.js';
import './varzCommands.js';
