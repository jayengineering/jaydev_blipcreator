const colors: Record<number, string> = {
  0: '#ffffff',
  1: '#ff0000',
  2: '#00ff00',
  3: '#0000ff',
  4: '#ffff00',
  5: '#00ffff',
  6: '#ff00ff',
  7: '#ffc0cb',
  8: '#ffa500',
  39: '#ff6666',
  46: '#000080',
  52: '#006400',
  76: '#4b0082',
  84: '#ffd700',
};

export function blipColor(id: number) {
  return colors[id] ?? `hsl(${(id * 20) % 360}, 70%, 50%)`;
}
