<script>
  import { onMount } from 'svelte';

  let deferredPrompt = null;
  let showInstallBanner = false;
  let isInstalled = false;

  onMount(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDay) {
        return;
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallBanner = true;
    });

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      isInstalled = true;
      showInstallBanner = false;
      deferredPrompt = null;
    });
  });

  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showInstallBanner = false;
    }
    
    deferredPrompt = null;
  }

  function dismissBanner() {
    showInstallBanner = false;
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }
</script>

{#if showInstallBanner && !isInstalled}
  <div class="install-banner">
    <div class="install-content">
      <span class="install-icon">📱</span>
      <div class="install-text">
        <strong>Pasang Kehadiran</strong>
        <span>Akses lebih pantas dari skrin utama</span>
      </div>
    </div>
    <div class="install-actions">
      <button class="btn-dismiss" on:click={dismissBanner}>Nanti</button>
      <button class="btn-install" on:click={handleInstall}>Pasang</button>
    </div>
  </div>
{/if}

<style>
  .install-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-bg-card);
    border-top: 1px solid var(--color-border);
    padding: var(--space-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    z-index: 1000;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .install-content {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .install-icon {
    font-size: 2rem;
  }

  .install-text {
    display: flex;
    flex-direction: column;
  }

  .install-text strong {
    font-size: 0.875rem;
  }

  .install-text span {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .install-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .btn-dismiss {
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-install {
    padding: var(--space-sm) var(--space-md);
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--radius-md);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 500px) {
    .install-banner {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .install-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
