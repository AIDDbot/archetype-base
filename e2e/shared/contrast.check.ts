import type { Locator } from "@playwright/test";

function channels(color: string) {
  const values = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return { red: values[0] ?? 0, green: values[1] ?? 0, blue: values[2] ?? 0 };
}
function luminance(color: string) {
  const { red, green, blue } = channels(color);
  const linear = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}
export function contrastRatio(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}
export async function textContrast(element: Locator) {
  const colors = await element.evaluate((node) => {
    const isOpaque = (value: string) =>
      value !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(value);
    let current: Element | null = node;
    let background = "rgb(255, 255, 255)";
    while (current) {
      const value = getComputedStyle(current).backgroundColor;
      if (isOpaque(value)) {
        background = value;
        break;
      }
      current = current.parentElement;
    }
    return { foreground: getComputedStyle(node).color, background };
  });
  return contrastRatio(colors.foreground, colors.background);
}
