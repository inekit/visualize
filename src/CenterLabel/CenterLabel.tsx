import styles from './CenterLabel.module.scss';
type Props = { type: 'wait' | 'timer'; time?: number };

export function CenterLabel({ type, time }: Props) {
  return (
    <div className={`${styles.centerLabel} ${styles[type]}`}>
      {type === 'wait' ? 'Ожидание игроков...' : `${time}s`}
    </div>
  );
}
