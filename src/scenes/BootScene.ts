import Phaser from 'phaser';

/** Empty starting scene. Later steps load assets here and hand off to the house map. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {}
}
