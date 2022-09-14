import { defineNuxtConfig } from 'nuxt';
// yarn add --dev @esbuild-plugins/node-globals-polyfill
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// yarn add --dev @esbuild-plugins/node-modules-polyfill
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// You don't need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  buildModules: ['@pinia/nuxt'],
  vite: {
    optimizeDeps: {
      include: [
        'bn.js',
        'js-sha3',
        'hash.js',
        'aes-js',
        'scrypt-js',
        'bech32',
        '@web3-onboard/walletconnect',
      ],
      esbuildOptions: {
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    build: {
      rollupOptions: {
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          rollupNodePolyFill(),
        ],
      },
    },
  },

  build: { transpile: ['@ethersproject', 'ethers'] },
});
