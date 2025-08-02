import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Ball,
  BoardState,
  PlayerSector,
  PlinkoPvPProps,
} from '../PlinkoPvPAPI';
import usePrevious from './usePrevious';
import { MAX_HEIGHT, MAX_WIDTH } from '../constants';
import { Dimensions } from '../ConstaintsTypes';

export const usePinko = (props: PlinkoPvPProps) => {
  const { animation, balls, boardState, onBallAnimationComplete, players } =
    props;

  const [dimensions, setDimensions] = useState<Dimensions>(() => {
    const w = Math.min(window.innerWidth - 32, MAX_WIDTH);
    const h = Math.min(window.innerHeight - 180, MAX_HEIGHT);
    return { width: w, height: h };
  });

  useEffect(() => {
    function onResize() {
      const w = Math.min(window.innerWidth - 32, MAX_WIDTH);
      const h = Math.min(window.innerHeight - 180, MAX_HEIGHT);
      setDimensions({ width: w, height: h });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [currentTargetX, setCurrentTargetX] = useState(dimensions.width / 2);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBallIndex, setActiveBallIndex] = useState(0);
  const [playerSectors, setPlayerSectors] = useState<PlayerSector[]>([]);
  const [resetKey, setResetKey] = useState<number>(-1);

  const currentBall = balls[activeBallIndex];
  const currentAnimation = currentBall
    ? animation[
        currentBall.type === 'demo' || currentBall.type === 'bonus'
          ? currentBall.type
          : 'base'
      ]
    : null;

  // Определяем целевую позицию на основе текущего активного шарика
  const getTargetPosition = useCallback(() => {
    if (boardState === 'waiting') return Math.random() * dimensions.width;
    if (balls.length === 0) return dimensions.width / 2;

    const currentBall = balls[activeBallIndex];

    if (currentBall.winnerId) {
      const winner = playerSectors.find(
        (ps) => ps.player.id === currentBall.winnerId,
      );
      if (winner) {
        return winner.x + winner.width / 2;
      }
    }

    return Math.random() * dimensions.width;
  }, [balls, playerSectors, activeBallIndex, dimensions.width]);

  // Обновляем целевую позицию
  useEffect(() => {
    const targetX = getTargetPosition();
    setCurrentTargetX(targetX);
  }, [getTargetPosition]);

  // Обработка завершения анимации шарика
  const handleBallComplete = useCallback(() => {
    let to: NodeJS.Timeout;
    const delay = boardState === 'waiting' ? 0 : currentAnimation?.bounce;

    if (brRef.current !== boardState) {
      setTimeout(() => {
        if (brRef.current === 'single') {
          setIsRunning(true);
        } else if (brRef.current === 'multi') {
          setIsRunning(false);
        }

        const currentBall = balls[activeBallIndex];
        // Вызываем callback
        if (currentBall) onBallAnimationComplete?.(currentBall, 'landed');

        //if (brRef.current !== 'multi')
        isTail.current = null;

        setResetKey((prev) => (prev *= -1));
      }, delay);

      return;
    }

    const hasNewBalls = balls.length && balls.length - 1 > activeBallIndex;
    if (hasNewBalls) isTail.current = balls[activeBallIndex + 1];
    else isTail.current = null;

    setIsRunning(false);
    setResetKey((prev) => (prev *= -1));
    if (hasNewBalls && brRef.current !== 'multi') {
      to = setTimeout(() => {
        // Вызываем callback
        onBallAnimationComplete?.(currentBall, 'landed');

        // Переходим к следующему шарику
        setActiveBallIndex((prev) => prev + 1);

        setIsRunning(true);
        setResetKey((prev) => (prev *= -1));
      }, delay); // Задержка между шариками
    } else {
      to = setTimeout(() => {
        onBallAnimationComplete?.(currentBall, 'landed');
      }, delay);
    }

    return () => {
      to && clearTimeout(to);
    };
  }, [balls, activeBallIndex, onBallAnimationComplete]);

  const isTail = useRef<Ball | null>(null);
  const brRef = useRef<BoardState>(null);
  const lastFirst = useRef<Ball | null>(balls[0]);

  useEffect(() => {
    if (boardState === 'waiting' && balls[0]) {
      isTail.current = balls[0];
    }
    brRef.current = boardState;
  }, [boardState, balls]);

  // Управление шариками
  useEffect(() => {
    if (boardState === 'single') {
      if (!isTail.current) {
        if (balls[0]) isTail.current = balls[0];
        else isTail.current = null;
      }

      if (isTail.current && isTail.current !== balls[0]) {
        return;
      }
    }

    lastFirst.current = balls[0];

    if (
      boardState === 'single' ||
      boardState === 'round' ||
      boardState === 'waiting'
    ) {
      if (!isRunning) {
        setIsRunning(true);
      }
      setResetKey((prev) => (prev *= -1));
    } else if (boardState === 'multi') {
      setIsRunning(true);
    }
  }, [boardState, balls, activeBallIndex]);

  // Сброс состояния при изменении шариков
  useEffect(() => {
    setActiveBallIndex(0);
  }, [balls]);

  // Вычисляем секторы игроков
  const calculatePlayerSectors = useCallback((): PlayerSector[] => {
    if (players.length === 0) return [];

    const totalBet = players.reduce((sum, player) => sum + player.bet, 0);

    let prevBetsSum = 0;
    const playersInfo = [];
    for (const player of players) {
      playersInfo.push({
        player,
        x: (prevBetsSum / totalBet) * dimensions.width,
        width: (player.bet / totalBet) * dimensions.width,
        isJumping: false,
        totalBet,
      });
      prevBetsSum += player.bet;
    }
    return playersInfo;
  }, [players.length, dimensions.width]);
  // Обновление секторов игроков
  useEffect(() => {
    setPlayerSectors(calculatePlayerSectors);
  }, [calculatePlayerSectors]);

  const [prevPlayerSectors, setPrevSec] = useState<PlayerSector[]>([]);

  useEffect(() => {
    return () => {
      setPrevSec(playerSectors);
    };
  }, [playerSectors.length]);

  return {
    prevPlayerSectors,
    resetKey,
    dimensions,

    handleBallComplete,
    currentTargetX,
    currentAnimation,
    isRunning,
    isTail: isRunning,
    playerSectors,
    activeBallIndex,
  };
};
