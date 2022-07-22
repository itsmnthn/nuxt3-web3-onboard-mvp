import { defineNuxtConfig } from 'nuxt';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  buildModules: ['@pinia/nuxt'],
  build: { transpile: ['@ethersproject', 'ethers'] },
  vite: {
    optimizeDeps: {
      include: [
        'vue',
        'bn.js',
        'js-sha3',
        'hash.js',
        'aes-js',
        'scrypt-js',
        'bech32',
      ],
    },
  },
});
