import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoDirectSmsViewProps } from './ExpoDirectSms.types';

const NativeView: React.ComponentType<ExpoDirectSmsViewProps> =
  requireNativeView('ExpoDirectSms');

export default function ExpoDirectSmsView(props: ExpoDirectSmsViewProps) {
  return <NativeView {...props} />;
}
