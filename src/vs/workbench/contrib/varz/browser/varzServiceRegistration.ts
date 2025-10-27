/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { IVARZService } from './varzService.js';
import { VARZService } from './varzService.js';

// Register VARZ Service as a singleton
registerSingleton(IVARZService, VARZService, InstantiationType.Delayed);
