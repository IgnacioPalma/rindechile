'use client';

import { useState } from 'react';

export function useAriaLive() {
  const [message, setMessage] = useState<string>('');

  const announce = (text: string) => {
    setMessage(text);
  };

  return { message, announce };
}
