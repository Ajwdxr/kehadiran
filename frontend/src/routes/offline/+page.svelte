<script>
</script>

<svelte:head>
  <title>Offline - Kehadiran</title>
</svelte:head>

<div class="offline-page">
  <div class="offline-content">
    <div class="offline-icon">📡</div>
    <h1>Tiada Sambungan Internet</h1>
    <p>Sila semak sambungan internet anda dan cuba lagi.</p>
    
    <div class="offline-actions">
      <button class="btn btn-primary" on:click={() => window.location.reload()}>
        Cuba Lagi
      </button>
    </div>

    <div class="offline-hint">
      <p>💡 Tip: Anda boleh melihat rekod yang telah di-cache sebelum ini.</p>
    </div>
  </div>
</div>

<style>
  .offline-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md);
    background: var(--color-bg);
  }

  .offline-content {
    text-align: center;
    max-width: 400px;
  }

  .offline-icon {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: var(--space-md);
  }

  p {
    color: var(--color-text-muted);
    margin-bottom: var(--space-lg);
  }

  .offline-actions {
    margin-bottom: var(--space-xl);
  }

  .offline-hint {
    padding: var(--space-md);
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .offline-hint p {
    margin: 0;
    font-size: 0.875rem;
  }
</style>
