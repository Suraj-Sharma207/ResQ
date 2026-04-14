import { NativeModule, requireNativeModule } from 'expo';

import { ExpoDirectSmsModuleEvents } from './ExpoDirectSms.types';

declare class ExpoDirectSmsModule extends NativeModule<ExpoDirectSmsModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoDirectSmsModule>('ExpoDirectSms');
