import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoDirectSms.types';

type ExpoDirectSmsModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoDirectSmsModule extends NativeModule<ExpoDirectSmsModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoDirectSmsModule, 'ExpoDirectSmsModule');
