import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaCog, FaTimes } from 'react-icons/fa';
import useSound from 'use-sound';
import Draggable from 'react-draggable';
import { toast } from 'react-toastify';
import { useTimerStore } from '@/shared/stores/timerStore';
import RotaryDial from './RotaryDial';

const DEFAULT_DURATION = 120; // 2분

const Timer: React.FC = () => {
  const { duration, isRunning, setIsRunning, setIsOpen, setDuration } =
    useTimerStore();
  const [timeLeft, setTimeLeft] = useState(duration || DEFAULT_DURATION);
  const [showSettings, setShowSettings] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [customDuration, setCustomDuration] = useState(DEFAULT_DURATION);
  const [focusedDial, setFocusedDial] = useState<
    'hours' | 'minutes' | 'seconds'
  >('hours');

  const [playStart] = useSound('/sounds/timer-start.mp3');
  const [playEnd] = useSound('/sounds/timer-end.mp3');
  const [playTick] = useSound('/sounds/timer-tick.mp3');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endedRef = useRef(false);
  const lastTickRef = useRef(0);

  const handleTimerEnd = useCallback(() => {
    try {
      if (!endedRef.current) {
        endedRef.current = true;
        playEnd();
        // 토스트 알림을 비동기적으로 표시
        setTimeout(() => {
          toast.success('타이머가 종료되었습니다!');
        }, 0);
        setIsRunning(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('타이머 종료 중 오류 발생:', error);
    }
  }, [playEnd, setIsRunning, setIsOpen]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        try {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            if (
              newTime <= 15 &&
              newTime > 0 &&
              Date.now() - lastTickRef.current > 1000
            ) {
              playTick();
              lastTickRef.current = Date.now();
            }
            if (newTime === 0) {
              handleTimerEnd();
            }
            return newTime;
          });
        } catch (error) {
          console.error('타이머 업데이트 중 오류 발생:', error);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, playTick, handleTimerEnd]);

  useEffect(() => {
    try {
      endedRef.current = false;
      if (duration) {
        setTimeLeft(duration);
        setCustomDuration(duration);
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;
        setHours(h);
        setMinutes(m);
        setSeconds(s);
      }
    } catch (error) {
      console.error('타이머 초기화 중 오류 발생:', error);
    }
  }, [duration]);

  useEffect(() => {
    return () => {
      toast.dismiss(); // 모든 토스트 알림을 제거
    };
  }, []);

  const handleSettingsSubmit = () => {
    try {
      const newDuration = hours * 3600 + minutes * 60 + seconds;
      setCustomDuration(newDuration);
      setTimeLeft(newDuration);
      setDuration(newDuration);
      setShowSettings(false);
      setIsRunning(false);
    } catch (error) {
      console.error('타이머 설정 중 오류 발생:', error);
    }
  };

  const startTimer = () => {
    try {
      if (!isRunning) {
        setTimeLeft(duration || customDuration);
        playStart();
      }
      setIsRunning(true);
    } catch (error) {
      console.error('타이머 시작 중 오류 발생:', error);
    }
  };

  const pauseTimer = () => {
    try {
      setIsRunning(false);
    } catch (error) {
      console.error('타이머 일시정지 중 오류 발생:', error);
    }
  };

  const resetTimer = () => {
    try {
      setIsRunning(false);
      setTimeLeft(duration || customDuration);
    } catch (error) {
      console.error('타이머 리셋 중 오류 발생:', error);
    }
  };

  const formatTime = (time: number) => {
    try {
      const h = Math.floor(time / 3600);
      const m = Math.floor((time % 3600) / 60);
      const s = time % 60;
      return `${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('시간 포맷 중 오류 발생:', error);
      return '00:00:00';
    }
  };

  const handleClose = () => {
    try {
      if (isRunning) {
        setIsRunning(false);
        toast.info('타이머를 중단시켰습니다.');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('타이머 닫기 중 오류 발생:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    try {
      e.preventDefault();
      if (e.key === 'ArrowLeft') {
        setFocusedDial((prev) =>
          prev === 'hours'
            ? 'seconds'
            : prev === 'minutes'
              ? 'hours'
              : 'minutes'
        );
      } else if (e.key === 'ArrowRight') {
        setFocusedDial((prev) =>
          prev === 'hours'
            ? 'minutes'
            : prev === 'minutes'
              ? 'seconds'
              : 'hours'
        );
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const increment = e.key === 'ArrowUp' ? -1 : 1;
        if (focusedDial === 'hours') {
          setHours((prev) => (prev + increment + 24) % 24);
        } else if (focusedDial === 'minutes') {
          setMinutes((prev) => (prev + increment + 60) % 60);
        } else if (focusedDial === 'seconds') {
          setSeconds((prev) => (prev + increment + 60) % 60);
        }
      } else if (e.key === 'Enter') {
        handleSettingsSubmit();
      }
    } catch (error) {
      console.error('키 입력 처리 중 오류 발생:', error);
    }
  };

  return (
    <Draggable cancel=".no-drag">
      <div className="fixed top-4 left-4 bg-gray-900 shadow-lg rounded-lg p-6 cursor-move max-w-xs w-full text-gray-200">
        <div className="absolute top-2 right-2">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex justify-center items-center mb-6">
          <div className="text-5xl font-light tracking-wider">
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex justify-between space-x-2 mb-2">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-full transition-colors flex items-center justify-center"
          >
            {isRunning ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-full transition-colors flex items-center justify-center"
          >
            <FaStop />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-full transition-colors flex items-center justify-center"
          >
            <FaCog />
          </button>
        </div>
        {showSettings && (
          <div className="mt-6 no-drag" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="flex justify-between mb-6">
              <RotaryDial
                value={hours}
                onChange={setHours}
                max={23}
                label="시"
                isFocused={focusedDial === 'hours'}
                onFocus={() => setFocusedDial('hours')}
              />
              <RotaryDial
                value={minutes}
                onChange={setMinutes}
                max={59}
                label="분"
                isFocused={focusedDial === 'minutes'}
                onFocus={() => setFocusedDial('minutes')}
              />
              <RotaryDial
                value={seconds}
                onChange={setSeconds}
                max={59}
                label="초"
                isFocused={focusedDial === 'seconds'}
                onFocus={() => setFocusedDial('seconds')}
              />
            </div>
            <button
              onClick={handleSettingsSubmit}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-light px-4 py-3 rounded-full transition-colors"
            >
              설정 완료
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default Timer;
