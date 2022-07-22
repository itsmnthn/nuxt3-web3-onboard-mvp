<script lang="ts" setup>
import { useWallet } from '~~/store/wallet';
const wallet = useWallet();

const connect = async () => {
  console.log('connect');
  wallet.connectWallet();
  console.log(wallet);
};
</script>

<template>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    "
  >
    <ClientOnly>
      <div
        style="display: flex; flex-direction: column; max-width: fit-content"
      >
        <button @click="connect">Connect Wallet</button>
        <span>{{ wallet.connectedAddress }}</span>
        <button
          v-if="wallet.connectedAddress"
          @click="wallet.disconnectWallet()"
        >
          Disconnect Wallet
        </button>
      </div>
    </ClientOnly>
  </div>
</template>
