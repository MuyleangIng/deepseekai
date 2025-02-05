// src/hooks/use-toast.ts
import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}