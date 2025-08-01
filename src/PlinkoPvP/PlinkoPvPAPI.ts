import { PhysicsState } from './ConstaintsTypes';
import { Dimensions } from './ConstaintsTypes';

/**
 * Тип игрока в игре PvP Plinko
 */
export interface Player {
  /** Уникальный идентификатор игрока */
  readonly id: string;
  /** Отображаемое имя игрока */
  readonly name: string;
  /** Вес ставки игрока, влияет на ширину сектора */
  readonly bet: number;
  /** Цвет сектора игрока в визуализации (уникальный) */
  readonly color: string;
  /** URL аватара для отображения (опционально) */
  readonly avatarUrl?: string;
}

/**
 * Возможные типы шариков (ball) в игре
 */
export type BallType =
  | 'gift' // стандартные шарики с подарками
  | 'stars' // особые шарики (звёзды)
  | 'lootbox' // лутбоксы
  | 'custom' // кастомные шарики
  | 'bonus' // бонусные шарики (специальные)
  | 'demo'; // демо-шарики для режима ожидания

/**
 * Состояния анимации конкретного шарика
 */
export type BallStatus =
  | 'falling' // падает
  | 'accelerating' // ускоряется
  | 'landed'; // приземлился

/**
 * Тип описания шарика для визуализации
 */
export interface Ball {
  /** Уникальный идентификатор шарика */
  readonly id: string;
  /** Тип шарика */
  readonly type: BallType;
  /** Опциональный идентификатор подарка (giftId) для генерации модели и фона */
  readonly giftId?: string;
  /** ID игрока — получателя шарика, если применимо */
  readonly winnerId?: string;
  /** Текущее состояние анимации шарика */
  readonly status: BallStatus;
}

/**
 * Настройки анимации для одной категории шариков
 */
export interface AnimationSettings {
  /** Длительность падения шарика в миллисекундах */
  readonly fall: number;
  /** Время подпрыгивания сектора в миллисекундах */
  readonly bounce: number;
  /** Время притягивания шарика к сектору в миллисекундах */
  readonly magnet: number;
}

/**
 * Группы анимационных настроек для разных типов шариков
 */
export interface AnimationGroups {
  /** базовые шарики: gift, stars, lootbox, custom */
  readonly base: AnimationSettings;
  /** бонусные шарики */
  readonly bonus: AnimationSettings;
  /** демо-шарики */
  readonly demo: AnimationSettings;
}

/**
 * Возможные состояния визуального состояния доски (board)
 */
export type BoardState =
  | 'waiting' // демо-режим (ожидание)
  | 'single' // один игрок
  | 'multi' // несколько игроков
  | 'round'; // основной раунд

/**
 * Пропсы React-компонента PvP Plinko
 */
export interface PlinkoPvPProps {
  /** Список игроков (immutable) */
  readonly players: Player[];
  /** Массив шариков для визуализации (immutable) */
  readonly balls: Ball[];
  /** Текущее состояние доски */
  readonly boardState: BoardState;
  /** Оставшееся время таймера (в секундах) для стадии подключения игроков, опционально */
  readonly timer?: number;
  /** Настройки анимаций по группам шариков */
  readonly animation: AnimationGroups;
  /** Callback-событие, вызываемое по завершении анимации шарика */
  readonly onBallAnimationComplete?: (ball: Ball, status: BallStatus) => void;
}

export interface PlinkoPvPStageProps {
  /** Список игроков (immutable) */
  readonly playersSectors: PlayerSector[];
  /** Текущее состояние доски */
  readonly boardState: BoardState;
  /** Оставшееся время таймера (в секундах) для стадии подключения игроков, опционально */
  readonly timer?: number;
  /** Callback-событие, вызываемое по завершении анимации шарика */
  readonly onBallAnimationComplete?: () => void;

  readonly physicsSettings?: Partial<PhysicsState>;
  readonly onRunningChange?: (running: boolean) => void;
  readonly initialTargetX?: number;
  readonly externalIsRunning?: boolean;
  readonly animation?: AnimationSettings;
  readonly currentBall?: Ball;
  readonly resetKey?: number;
  readonly dimensions: Dimensions;
}

/**
 * Внутренние типы для управления анимацией
 */
export interface BallAnimationState {
  ball: Ball;
  startTime: number;
  currentStatus: BallStatus;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  targetPosition?: { x: number; y: number };
}

export interface PlayerSector {
  player: Player;
  x: number;
  width: number;
  isJumping: boolean;
  jumpStartTime?: number;
}
