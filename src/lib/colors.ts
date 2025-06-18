
export interface Color {
  hex: string;
  locked: boolean;
  id: string; // For stable keys in React lists
}

export type Palette = Color[];

const SAFE_CHAR_CODES = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70]; // 0-9, A-F

export function generateRandomHexColor(): string {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += String.fromCharCode(SAFE_CHAR_CODES[Math.floor(Math.random() * SAFE_CHAR_CODES.length)]);
  }
  return color;
}

export function generateNewPalette(existingPalette?: Palette): Palette {
  const newPalette: Palette = [];
  for (let i = 0; i < 5; i++) {
    if (existingPalette && existingPalette[i] && existingPalette[i].locked) {
      newPalette.push(existingPalette[i]);
    } else {
      newPalette.push({ hex: generateRandomHexColor(), locked: false, id: Math.random().toString(36).substring(2, 9) });
    }
  }
  return newPalette;
}

export function hexToHsb(hex: string): { h: number; s: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max; // Brightness is also known as Value (V)

  return { h, s: Math.round(s * 100), b: Math.round(v * 100) };
}

export function hsbToHex({ h, s, b }: { h: number; s: number; b: number }): string {
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  
  const toHex = (val: number) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Async: Could not copy text: ", err);
    return false;
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }; // Default to black if hex is invalid
}

export function calculateColorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

// Calculates a similarity score between two palettes (lower is more similar).
// It sums the minimum Euclidean distance for each color in palette1 to any color in palette2.
export function calculatePaletteSimilarity(palette1Colors: string[], palette2Colors: string[]): number {
  if (palette1Colors.length === 0 || palette2Colors.length === 0) return Infinity;

  const rgbPalette1 = palette1Colors.map(hexToRgb);
  const rgbPalette2 = palette2Colors.map(hexToRgb);

  let totalMinDistance = 0;

  for (const color1 of rgbPalette1) {
    let minDistanceForColor1 = Infinity;
    for (const color2 of rgbPalette2) {
      const distance = calculateColorDistance(color1, color2);
      if (distance < minDistanceForColor1) {
        minDistanceForColor1 = distance;
      }
    }
    totalMinDistance += minDistanceForColor1;
  }
  // Average the total minimum distance by the number of colors in the first palette
  return totalMinDistance / rgbPalette1.length;
}
