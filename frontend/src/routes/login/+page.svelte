<script>
  import { goto } from '$app/navigation';
  import auth from '$lib/stores/auth.js';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    error = '';
    loading = true;

    try {
      await auth.login(email, password);
      goto('/');
    } catch (e) {
      error = e.message;
    }

    loading = false;
  }
</script>

<svelte:head>
  <title>Login - Kehadiran</title>
</svelte:head>

<div class="login-page">
  <div class="login-container">
    <div class="login-card animate-fade-in">
      <!-- Logo -->
      <div class="login-header">
        <span class="logo-icon">⏱️</span>
        <h1 class="logo-text">Kehadiran</h1>
        <p class="tagline">Sistem Kehadiran Digital</p>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit} class="login-form">
        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}

        <div class="form-group">
          <label for="email" class="label">Email</label>
          <input
            type="email"
            id="email"
            class="input"
            placeholder="nama@syarikat.com"
            bind:value={email}
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="password" class="label">Kata Laluan</label>
          <input
            type="password"
            id="password"
            class="input"
            placeholder="••••••••"
            bind:value={password}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-full" disabled={loading}>
          {#if loading}
            <span class="spinner"></span>
            <span>Logging in...</span>
          {:else}
            <span>Log Masuk</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md);
    background: 
      radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15), transparent 50%),
      radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.1), transparent 50%),
      var(--color-bg);
  }

  .login-container {
    width: 100%;
    max-width: 400px;
  }

  .login-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    box-shadow: var(--shadow-lg);
  }

  .login-header {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .logo-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .logo-text {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .tagline {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .error-message {
    padding: var(--space-sm) var(--space-md);
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: 0.875rem;
    text-align: center;
  }

  .btn-full {
    width: 100%;
  }

  .demo-info {
    margin-top: var(--space-xl);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
    text-align: center;
  }

  .demo-title {
    font-size: 0.75rem;
    color: var(--color-text-dim);
    margin-bottom: var(--space-xs);
  }

  .demo-creds {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-family: monospace;
  }
</style>
