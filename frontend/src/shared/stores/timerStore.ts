import create from 'zustand';

interface TimerState {
  isOpen: boolean;
  duration: number;
  isRunning: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setDuration: (duration: number) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isOpen: false,
  duration: 0,
  isRunning: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  setDuration: (duration) => set({ duration }),
  setIsRunning: (isRunning) => set({ isRunning }),
}));
