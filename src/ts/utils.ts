export function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function randomUniform(low: number, high: number): number {
  return (high - low) * Math.random() + low;
}

export interface WindowSize {
  width: number;
  height: number;
}

export function getWindowSize(): WindowSize {
  const windowSize: WindowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  window.addEventListener("resize", () => {
    windowSize.width = window.innerWidth;
    windowSize.height = window.innerHeight;
  });
  return windowSize;
}
