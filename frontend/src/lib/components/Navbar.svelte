<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import auth from '$lib/stores/auth.js';

  let mobileMenuOpen = false;

  $: isActive = (path) => $page.url.pathname === path;
  
  async function handleLogout() {
    await auth.logout();
    mobileMenuOpen = false;
    goto('/login');
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="navbar-brand" on:click={closeMobileMenu}>
      <span class="brand-icon">⏱️</span>
      <span class="brand-text">Kehadiran</span>
    </a>

    {#if $auth.isAuthenticated}
      <!-- Desktop Menu -->
      <div class="navbar-menu desktop-only">
        <a href="/" class="nav-link" class:active={isActive('/')}>
          Dashboard
        </a>
        <a href="/attendance" class="nav-link" class:active={isActive('/attendance')}>
          Kehadiran
        </a>
        <a href="/history" class="nav-link" class:active={isActive('/history')}>
          Sejarah
        </a>
        {#if $auth.user?.role_id <= 2}
          <a href="/admin" class="nav-link" class:active={isActive('/admin')}>
            Admin
          </a>
          {#if $auth.user?.role_id === 1}
            <a href="/admin/locations" class="nav-link" class:active={isActive('/admin/locations')}>
              Lokasi
            </a>
          {/if}
        {/if}
      </div>

      <div class="navbar-right">
        <span class="user-name desktop-only">{$auth.user?.name}</span>
        <button class="btn btn-outline btn-sm desktop-only" on:click={handleLogout}>
          Logout
        </button>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn mobile-only" on:click={toggleMobileMenu}>
          {#if mobileMenuOpen}
            <span class="menu-icon">✕</span>
          {:else}
            <span class="menu-icon">☰</span>
          {/if}
        </button>
      </div>

      <!-- Mobile Menu Dropdown -->
      {#if mobileMenuOpen}
        <div class="mobile-menu">
          <a href="/" class="mobile-nav-link" class:active={isActive('/')} on:click={closeMobileMenu}>
            📊 Dashboard
          </a>
          <a href="/attendance" class="mobile-nav-link" class:active={isActive('/attendance')} on:click={closeMobileMenu}>
            ⏰ Kehadiran
          </a>
          <a href="/history" class="mobile-nav-link" class:active={isActive('/history')} on:click={closeMobileMenu}>
            📅 Sejarah
          </a>
          {#if $auth.user?.role_id <= 2}
            <a href="/admin" class="mobile-nav-link" class:active={isActive('/admin')} on:click={closeMobileMenu}>
              ⚙️ Admin
            </a>
            {#if $auth.user?.role_id === 1}
              <a href="/admin/locations" class="mobile-nav-link" class:active={isActive('/admin/locations')} on:click={closeMobileMenu}>
                📍 Lokasi
              </a>
            {/if}
          {/if}
          <div class="mobile-menu-divider"></div>
          <div class="mobile-user-info">
            <span class="mobile-user-name">{$auth.user?.name}</span>
            <span class="mobile-user-email">{$auth.user?.email}</span>
          </div>
          <button class="mobile-logout-btn" on:click={handleLogout}>
            🚪 Logout
          </button>
        </div>
      {/if}
    {:else}
      <a href="/login" class="btn btn-primary">Login</a>
    {/if}
  </div>
</nav>

<!-- Overlay for mobile menu -->
{#if mobileMenuOpen}
  <div class="mobile-menu-overlay" on:click={closeMobileMenu}></div>
{/if}

<style>
  .navbar {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-md);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .navbar-menu {
    display: flex;
    gap: var(--space-xs);
  }

  .nav-link {
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-muted);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.875rem;
    transition: all var(--transition-fast);
  }

  .nav-link:hover {
    color: var(--color-text);
    background: var(--color-bg-hover);
  }

  .nav-link.active {
    color: var(--color-primary-light);
    background: rgba(99, 102, 241, 0.1);
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .user-name {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .btn-sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
  }

  /* Mobile Menu Button */
  .mobile-menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
  }

  .mobile-menu-btn:hover {
    background: var(--color-bg-hover);
  }

  /* Mobile Menu Dropdown */
  .mobile-menu {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--color-bg-card);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-md);
    flex-direction: column;
    gap: var(--space-xs);
    animation: slideDown 0.2s ease;
    z-index: 99;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mobile-nav-link {
    display: block;
    padding: var(--space-md);
    color: var(--color-text-muted);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 1rem;
    transition: all var(--transition-fast);
  }

  .mobile-nav-link:hover {
    color: var(--color-text);
    background: var(--color-bg-hover);
  }

  .mobile-nav-link.active {
    color: var(--color-primary-light);
    background: rgba(99, 102, 241, 0.1);
  }

  .mobile-menu-divider {
    height: 1px;
    background: var(--color-border);
    margin: var(--space-sm) 0;
  }

  .mobile-user-info {
    padding: var(--space-md);
  }

  .mobile-user-name {
    display: block;
    font-weight: 600;
    color: var(--color-text);
  }

  .mobile-user-email {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: var(--space-xs);
  }

  .mobile-logout-btn {
    width: 100%;
    padding: var(--space-md);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .mobile-logout-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  .mobile-menu-overlay {
    display: none;
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 98;
  }

  /* Responsive */
  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none !important;
    }
    
    .mobile-only {
      display: flex !important;
    }

    .mobile-menu {
      display: flex;
    }

    .mobile-menu-overlay {
      display: block;
    }

    .mobile-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
