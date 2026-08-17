/**
 * Global type declarations for external libraries and vendor APIs
 */

/** video.js player instance */
declare function videojs(
  id: string | HTMLElement,
  options?: Record<string, unknown>
): any;
declare namespace videojs {
  export interface Player {
    play(): Promise<void>;
    pause(): void;
    dispose(): void;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler?: (...args: any[]) => void): void;
    src(source: { src: string; type: string }): void;
    currentTime(): number;
    currentTime(value: number): void;
    duration(): number;
    ended(): boolean;
    error(): { code: number; message: string } | null;
  }
}

/** isMobile detection library */
declare const isMobile: {
  android(): boolean;
  blackberry(): boolean;
  iphone(): boolean;
  ipod(): boolean;
  ipad(): boolean;
  ie(): boolean;
  opera(): boolean;
  windows(): boolean;
  windows_phone(): boolean;
  other(): boolean;
  any(): boolean;
  phone(): boolean;
  tablet(): boolean;
};

/** Bootstrap components */
declare namespace bootstrap {
  export class Tooltip {
    constructor(element: HTMLElement, options?: Record<string, unknown>);
    static getInstance(element: HTMLElement): Tooltip | null;
    dispose(): void;
    show(): void;
    hide(): void;
    update(): void;
  }
  export class Toast {
    constructor(element: HTMLElement, options?: Record<string, unknown>);
    static getInstance(element: HTMLElement): Toast | null;
    show(): void;
    hide(): void;
    dispose(): void;
  }
  export class Modal {
    constructor(element: HTMLElement, options?: Record<string, unknown>);
    static getInstance(element: HTMLElement): Modal | null;
    show(): void;
    hide(): void;
    dispose(): void;
  }
}

/** Extend Element with webkit/moz/ms prefixed fullscreen properties */
declare global {
  interface Window {
    bootstrap?: typeof bootstrap;
  }

  interface HTMLElement {
    webkitRequestFullscreen?(): Promise<void>;
    mozRequestFullScreen?(): Promise<void>;
    msRequestFullscreen?(): Promise<void>;
  }

  interface Document {
    webkitExitFullscreen?(): Promise<void>;
    mozCancelFullScreen?(): Promise<void>;
    msExitFullscreen?(): Promise<void>;
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  }
}

export {};
