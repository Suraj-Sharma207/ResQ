import * as React from 'react';

import { ExpoDirectSmsViewProps } from './ExpoDirectSms.types';

export default function ExpoDirectSmsView(props: ExpoDirectSmsViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
