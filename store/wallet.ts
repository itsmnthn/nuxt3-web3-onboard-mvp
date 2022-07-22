import type { Chain } from '@web3-onboard/common/dist/types';
import type { Signer } from '@ethersproject/abstract-signer';
import {
  JsonRpcProvider,
  Web3Provider,
  WebSocketProvider,
} from '@ethersproject/providers';
import type {
  ConnectOptions,
  ConnectOptionsString,
  OnboardAPI,
  WalletState,
} from '@web3-onboard/core/dist/types';
import type { EIP1193Provider } from '@web3-onboard/core';
import { defineStore, storeToRefs } from 'pinia';
import { watch } from 'vue';

export type Provider = JsonRpcProvider | Web3Provider | WebSocketProvider;

export const getProvider = (rpc: string | EIP1193Provider): Provider => {
  if (typeof rpc === 'object') return new Web3Provider(rpc);
  if (rpc.startsWith('http')) return new JsonRpcProvider(rpc);
  return new WebSocketProvider(rpc);
};

export interface State {
  wallets: WalletState[];
  onboard: OnboardAPI | null;
  unsubscribeOnboard: null | (() => void);
  loaders: { [key in string]: boolean };
}

export const useWallet = defineStore('wallet', {
  state: (): State => {
    return {
      wallets: [],
      onboard: null,
      unsubscribeOnboard: null,
      loaders: { connecting: false },
    };
  },

  getters: {
    isConnected: (state: State): boolean => state.wallets.length !== 0,
    isTxAllowed(): boolean {
      return this.connectedAddress !== null && this.signer !== null;
    },
    wallet: (state: State): WalletState | null => {
      if (state.wallets.length === 0) return null;
      return state.wallets[0];
    },
    selectedChainId(): string {
      if (!this.wallet) return this.config.CHAIN.chainId;
      if (!this.wallet.chains || this.wallet.chains.length === 0)
        return this.config.CHAIN.chainId;
      return Number(this.wallet.chains[0].id).toString();
    },
    connectedAddresses(): string[] {
      if (!this.wallet) return [];
      if (!this.wallet.accounts || this.wallet.accounts.length === 0) return [];
      return this.wallet.accounts.map((account) => account.address);
    },
    connectedAddress(): string | null {
      if (this.connectedAddresses.length === 0) return null;
      return this.connectedAddresses[0];
    },
    provider(): Provider {
      if (this.wallet === null || !this.wallet.provider)
        return getProvider(this.config.CHAIN.rpc.https);
      return getProvider(this.wallet.provider);
    },
    signer(): Signer | null {
      if (this.wallet === null) return null;
      return this.provider.getSigner();
    },
  },

  actions: {
    watchNetwork() {
      const wallet = useWallet();
      const { selectedChainId } = storeToRefs(wallet);
      watch(selectedChainId, () => {
        // on network change
      });
    },
    async initOnboard(): Promise<void> {
      this.onboard = await getOnboard([
        {
          id: '0xa869',
          token: 'AVAX',
          label: 'Avalanche Fuji Testnet',
          rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
        },
      ]);
    },
    async connectWallet(
      options?: ConnectOptions | ConnectOptionsString | undefined
    ): Promise<void> {
      if (this.loaders.connecting) return;
      this.loaders.connecting = true;
      if (this.onboard === null) await this.initOnboard();
      if (this.onboard) {
        const wallets = this.onboard.state.select('wallets');
        const { unsubscribe } = wallets.subscribe((wallets: WalletState[]) => {
          this.wallets = wallets;
          if (this.isChainSupported === false) this.switchChain(); // prompt to switch chain
          const connectedWallets = wallets.map(({ label }) => label);
          if (window)
            window.localStorage.setItem(
              'connectedWallets',
              JSON.stringify(connectedWallets)
            );
        });
        this.unsubscribeOnboard = unsubscribe;

        await this.onboard.connectWallet(options);
        this.loaders.connecting = false;
      }
    },
    async disconnectWallet() {
      this.unsubscribeOnboard && this.unsubscribeOnboard();
      if (this.onboard && this.wallet)
        await this.onboard.disconnectWallet({ label: this.wallet.label });
      this.watchAddress = null;
    },
    async switchChain(): Promise<void> {
      if (this.onboard === null) return;
      this.onboard.setChain({ chainId: this.config.CHAIN.id });
    },
  },
});

export const getOnboard = async (chains: Chain[]): Promise<OnboardAPI> => {
  console.log('getOnboard');
  const injectedModule = (await import('@web3-onboard/injected-wallets'))
    .default;
  const Onboard = (await import('@web3-onboard/core')).default;

  const injected = injectedModule({
    filter: {} /* mapping of wallet label to filter here */,
  });
  const onboard = Onboard({
    wallets: [injected],
    chains: chains,
    appMetadata: {
      name: 'Nuxt3 - web3-onboard',
      icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50"/>
    </svg>`, // svg string icon
      description: 'Nuxt3 - web3-onboard',
      recommendedInjectedWallets: [
        { name: 'MetaMask', url: 'https://metamask.io' },
      ],
      explore: 'https://metamask.io',
    },
  });

  return onboard;
};
