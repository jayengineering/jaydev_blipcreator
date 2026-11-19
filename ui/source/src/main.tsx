import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import '@mantine/core/styles.css';
import './global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { App } from './App';

async function start() {
  if (import.meta.env.DEV) {
    const { installDevMock } = await import('./devMock');
    installDevMock();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider theme={theme} forceColorScheme="dark">
        <App />
      </MantineProvider>
    </StrictMode>,
  );
}

start();
