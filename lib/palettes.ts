export const EMOJI_PALETTE = ["🍹", "🍸", "🥂", "🍷", "🍺", "🌶️", "🍋", "🍊", "🍑", "🐝", "🦄", "🐙"];

export const COLOR_PALETTE = [
  "#FF6B1A", "#E04E00", "#1F4A2E", "#9CC9D8", "#D69500",
  "#C13A2E", "#5A9BAE", "#6E5F50", "#3E7C47", "#A45EE5",
];

export const DEFAULT_EMOJI = EMOJI_PALETTE[0];
export const DEFAULT_COLOR = COLOR_PALETTE[0];

export function safeEmoji(input: string | undefined): string {
  if (!input) return DEFAULT_EMOJI;
  return EMOJI_PALETTE.includes(input) ? input : DEFAULT_EMOJI;
}

export function safeColor(input: string | undefined): string {
  if (!input) return DEFAULT_COLOR;
  return COLOR_PALETTE.includes(input) ? input : DEFAULT_COLOR;
}
