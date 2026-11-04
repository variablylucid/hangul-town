import Phaser from 'phaser';
import './theme.css';
import './fonts.css';
import { BootScene } from './scenes/BootScene';

// Base resolution: 16:9 landscape, scaled to fit any screen (mobile-friendly from day one).
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#f6efe4',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],
});
