declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

interface Window {
  onYouTubeIframeAPIReady?: (() => void) | undefined;
  YT?: YTNamespace | undefined;
}

interface YTNamespace {
  Player: new (elementId: string | HTMLElement, config: YTPlayerConfig) => YTPlayerInstance;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface YTPlayerConfig {
  videoId?: string;
  playerVars?: {
    autoplay?: number;
    rel?: number;
    modestbranding?: number;
    controls?: number;
    [key: string]: unknown;
  };
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
}

interface YTPlayerInstance {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  pauseVideo(): void;
  playVideo(): void;
  destroy(): void;
  getPlayerState(): number;
  getIframe(): HTMLIFrameElement;
}
