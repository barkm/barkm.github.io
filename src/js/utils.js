export function modulo(a, b) {
  return ((a % b) + b) % b;
}

export function randomUniform(low, high) {
  return (high - low) * Math.random() + low;
}

export function getWindowSizes() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
  });
  return sizes;
}
