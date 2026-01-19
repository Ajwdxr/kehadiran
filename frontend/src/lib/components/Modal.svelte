<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let show = false;
  export let title = '';
  
  const dispatch = createEventDispatcher();
  
  let portalTarget;
  let modalElement;
  
  onMount(() => {
    // Create portal target in body
    portalTarget = document.createElement('div');
    portalTarget.id = 'modal-portal';
    document.body.appendChild(portalTarget);
  });
  
  onDestroy(() => {
    if (portalTarget && portalTarget.parentNode) {
      portalTarget.parentNode.removeChild(portalTarget);
    }
  });
  
  function handleOverlayClick() {
    dispatch('close');
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      dispatch('close');
    }
  }
  
  $: if (portalTarget && modalElement) {
    portalTarget.appendChild(modalElement);
  }
  
  $: if (show) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div bind:this={modalElement} class="modal-portal-wrapper">
    <div class="modal-overlay" on:click={handleOverlayClick}>
      <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
        {#if title}
          <div class="modal-header">
            <h3>{title}</h3>
          </div>
        {/if}
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-portal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }
  
  .modal {
    background: var(--color-bg-card, #1e1e2e);
    border: 1px solid var(--color-border, #333);
    border-radius: 1rem;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow: hidden;
    animation: modalSlideUp 0.3s ease;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  }
  
  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border, #333);
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--color-text, #fff);
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: 60vh;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border, #333);
  }
  
  .modal-footer:empty {
    display: none;
  }
</style>
