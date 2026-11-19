import { createTheme, type MantineColorsTuple } from '@mantine/core';

const dark: MantineColorsTuple = [
  '#e6e6e8',
  '#b8b8bd',
  '#8f8f96',
  '#6c6c73',
  '#47474d',
  '#333338',
  '#26262a',
  '#1c1c1f',
  '#131315',
  '#0c0c0e',
];

const font = "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const theme = createTheme({
  colors: { dark },
  primaryColor: 'gray',
  white: '#ffffff',
  black: '#131315',
  fontFamily: font,
  headings: { fontFamily: font, fontWeight: '700' },
  defaultRadius: 'md',
  radius: {
    xs: '6px',
    sm: '8px',
    md: '10px',
    lg: '10px',
    xl: '18px',
  },
  cursorType: 'pointer',
  focusRing: 'never',
  components: {
    TextInput: { defaultProps: { variant: 'filled' } },
    NumberInput: { defaultProps: { variant: 'filled', hideControls: true } },
    Tooltip: { defaultProps: { openDelay: 300 } },
    Modal: {
      defaultProps: {
        radius: 'xl',
        centered: true,
        withCloseButton: false,
        overlayProps: { backgroundOpacity: 0.45 },
      },
    },
    Slider: { defaultProps: { size: 4, thumbSize: 12, radius: 'xl' } },
    Switch: { defaultProps: { withThumbIndicator: false } },
  },
});
