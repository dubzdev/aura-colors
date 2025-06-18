import { useState, useEffect, useCallback } from 'react';

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      // Prevent default spacebar scroll
      if (key === ' ') {
        const activeElement = document.activeElement;
        const inputs = ['input', 'select', 'textarea', 'button'];
        if (activeElement && inputs.includes(activeElement.tagName.toLowerCase())) {
          return; 
        }
        // @ts-ignore
        if (activeElement && activeElement.isContentEditable) {
          return;
        }
      }
      setKeyPressed(true);
    }
  }, [targetKey]);

  const upHandler = useCallback(({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  }, [targetKey]);

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
}

export function useKeyRelease(targetKey: string, onKeyRelease: () => void) {
  const downHandler = useCallback(({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      if (key === ' ') {
        const activeElement = document.activeElement;
        const inputs = ['input', 'select', 'textarea', 'button'];
        if (activeElement && inputs.includes(activeElement.tagName.toLowerCase())) {
          return;
        }
         // @ts-ignore
        if (activeElement && activeElement.isContentEditable) {
          return;
        }
        // Prevent default spacebar scroll if not in an input field
        const target = event?.target as HTMLElement;
        if(target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
            event?.preventDefault();
        }
      }
    }
  }, [targetKey]);
  
  const upHandler = useCallback((event: KeyboardEvent) => {
    if (event.key === targetKey) {
      const activeElement = document.activeElement;
      const inputs = ['input', 'select', 'textarea', 'button'];
      if (activeElement && inputs.includes(activeElement.tagName.toLowerCase())) {
          return; 
      }
      // @ts-ignore
      if (activeElement && activeElement.isContentEditable) {
        return;
      }
      onKeyRelease();
    }
  }, [targetKey, onKeyRelease]);

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);
}
