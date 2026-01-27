import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onTab,
  onShiftTab,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onCtrlN,
  onCtrlS,
  onCtrlP,
  onCtrlD,
  onCtrlEnter,
  onCtrlE,
  onCtrlF,
  onDelete,
  onF2,
  enabled = true,
  preventDefault = true
} = {}) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isCtrl = ctrlKey || metaKey;

    let handled = false;

    if (isCtrl) {
      switch (key.toLowerCase()) {
        case 'n':
          if (onCtrlN) { onCtrlN(event); handled = true; }
          break;
        case 's':
          if (onCtrlS) { onCtrlS(event); handled = true; }
          break;
        case 'p':
          if (onCtrlP) { onCtrlP(event); handled = true; }
          break;
        case 'd':
          if (onCtrlD) { onCtrlD(event); handled = true; }
          break;
        case 'e':
          if (onCtrlE) { onCtrlE(event); handled = true; }
          break;
        case 'f':
          if (onCtrlF) { onCtrlF(event); handled = true; }
          break;
        case 'enter':
          if (onCtrlEnter) { onCtrlEnter(event); handled = true; }
          break;
      }
    } else {
      switch (key) {
        case 'Escape':
          if (onEscape) { onEscape(event); handled = true; }
          break;
        case 'Enter':
          if (onEnter) { onEnter(event); handled = true; }
          break;
        case 'Tab':
          if (shiftKey) {
            if (onShiftTab) { onShiftTab(event); handled = true; }
          } else {
            if (onTab) { onTab(event); handled = true; }
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) { onArrowUp(event); handled = true; }
          break;
        case 'ArrowDown':
          if (onArrowDown) { onArrowDown(event); handled = true; }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) { onArrowLeft(event); handled = true; }
          break;
        case 'ArrowRight':
          if (onArrowRight) { onArrowRight(event); handled = true; }
          break;
        case 'Delete':
          if (onDelete) { onDelete(event); handled = true; }
          break;
        case 'F2':
          if (onF2) { onF2(event); handled = true; }
          break;
      }
    }

    if (handled && preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [
    enabled, onEscape, onEnter, onTab, onShiftTab, onArrowUp, onArrowDown,
    onArrowLeft, onArrowRight, onCtrlN, onCtrlS, onCtrlP, onCtrlD,
    onCtrlEnter, onCtrlE, onCtrlF, onDelete, onF2, preventDefault
  ]);

  return handleKeyDown;
};

export const useGlobalShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isCtrl = ctrlKey || metaKey;

      const target = event.target;
      const isInput = target.tagName === 'INPUT' ||
                      target.tagName === 'TEXTAREA' ||
                      target.isContentEditable;

      if (isInput && !['Escape', 'Tab'].includes(key)) return;

      let handled = false;

      if (isCtrl && shortcuts.onCtrlN && key.toLowerCase() === 'n') {
        shortcuts.onCtrlN(event);
        handled = true;
      } else if (isCtrl && shortcuts.onCtrlS && key.toLowerCase() === 's') {
        shortcuts.onCtrlS(event);
        handled = true;
      } else if (isCtrl && shortcuts.onCtrlP && key.toLowerCase() === 'p') {
        shortcuts.onCtrlP(event);
        handled = true;
      } else if (shortcuts.onEscape && key === 'Escape') {
        shortcuts.onEscape(event);
        handled = true;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useFocusTrap = (containerRef, isActive = true) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, isActive]);
};

export default useKeyboardNavigation;
