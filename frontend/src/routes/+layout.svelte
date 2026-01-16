<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import InstallPrompt from '$lib/components/InstallPrompt.svelte';
  import auth from '$lib/stores/auth.js';

  const publicRoutes = ['/login', '/register', '/offline'];

  onMount(async () => {
    await auth.init();
  });

  // Auth guard
  $: if (!$auth.isLoading) {
    const isPublicRoute = publicRoutes.includes($page.url.pathname);
    
    if (!$auth.isAuthenticated && !isPublicRoute) {
      goto('/login');
    } else if ($auth.isAuthenticated && isPublicRoute && $page.url.pathname !== '/offline') {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>Kehadiran - Sistem Kehadiran</title>
</svelte:head>

{#if $auth.isLoading}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="spinner-lg"></div>
      <span>Memuatkan...</span>
    </div>
  </div>
{:else}
  <div class="app">
    <Navbar />
    <main class="main-content">
      <slot />
    </main>
    <InstallPrompt />
  </div>
{/if}

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: var(--space-xl) var(--space-md);
  }

  .loading-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    color: var(--color-text-muted);
  }

  .spinner-lg {
    width: 48px;
    height: 48px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
