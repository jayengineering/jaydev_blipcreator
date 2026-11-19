import { memo } from 'react';
import { IconMapPin } from '@tabler/icons-react';
import { BLIP_ICON_BASE_URL, BLIP_SPRITE_ICONS } from '../blipIcons';
import classes from './SpriteIcon.module.css';

export const SpriteIcon = memo(function SpriteIcon({ sprite }: { sprite: number }) {
  const file = BLIP_SPRITE_ICONS[sprite];

  if (!file) {
    return (
      <span className={`${classes.icon} ${classes.fallback}`} aria-hidden>
        <IconMapPin size={22} stroke={2} />
      </span>
    );
  }

  return (
    <span
      className={classes.icon}
      style={{ backgroundImage: `url("${BLIP_ICON_BASE_URL}${file}")` }}
      aria-hidden
    />
  );
});
