/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import viteLitCssPlugin from './vite-lit-css-plugin.js';
import fs from 'fs';

/* Autor: Lucas Berlage */
export default defineConfig({
  build: { target: 'esnext' },
  plugins: [viteLitCssPlugin()],
  server: {
    port: 8080,
    host: true,
    https: {
      key: fs.readFileSync('../api-server/src/certs/server.key.pem'),
      cert: fs.readFileSync('../api-server/src/certs/server.cert.pem'),
      ca: fs.readFileSync('../api-server/src/certs/intermediate-ca.cert.pem')
    }
  },
  css: {
    postcss: {
      plugins: [postcssPresetEnv({ stage: 2 })]
    }
  }
});
