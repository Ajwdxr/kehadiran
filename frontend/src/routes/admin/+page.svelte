<script>
  import { onMount } from 'svelte';
  import api from '$lib/api/client.js';
  import auth from '$lib/stores/auth.js';
  import DataTable from '$lib/components/DataTable.svelte';

  let users = [];
  let loading = true;
  let showModal = false;
  let editingUser = null;
  let formData = { name: '', email: '', password: '', role_id: 3, status: 'active' };
  let formError = '';
  let formLoading = false;

  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role_name', 
      label: 'Peranan',
      render: (value) => {
        const colors = { admin: 'danger', manager: 'warning', staff: 'info' };
        return `<span class="badge badge-${colors[value] || 'info'}">${value || '-'}</span>`;
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        return value === 'active' 
          ? '<span class="badge badge-success">Aktif</span>'
          : '<span class="badge badge-danger">Tidak Aktif</span>';
      }
    },
    {
      key: 'actions',
      label: 'Tindakan',
      render: (_, row) => {
        return `<button class="btn btn-outline btn-sm" data-action="edit" data-id="${row.id}">Edit</button>`;
      }
    }
  ];

  onMount(() => {
    fetchUsers();
    
    // Handle table button clicks
    document.addEventListener('click', handleTableClick);
    return () => document.removeEventListener('click', handleTableClick);
  });

  async function fetchUsers() {
    loading = true;
    try {
      const result = await api.getUsers();
      users = result.data || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    loading = false;
  }

  function handleTableClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);
    
    if (action === 'edit') {
      const user = users.find(u => u.id === id);
      if (user) {
        editingUser = user;
        formData = { 
          name: user.name, 
          email: user.email, 
          password: '',
          role_id: user.role_id,
          status: user.status
        };
        showModal = true;
      }
    }
  }

  function openAddModal() {
    editingUser = null;
    formData = { name: '', email: '', password: '', role_id: 3, status: 'active' };
    formError = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingUser = null;
    formError = '';
  }

  async function handleSubmit() {
    formError = '';
    formLoading = true;

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        if (!formData.password) {
          throw new Error('Kata laluan diperlukan');
        }
        await api.createUser(formData);
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      formError = error.message;
    }

    formLoading = false;
  }
</script>

<svelte:head>
  <title>Admin - Kehadiran</title>
</svelte:head>

<div class="admin-page">
  <div class="container">
    <div class="page-header">
      <div>
        <h1>Panel Admin</h1>
        <p class="subtitle">Urus pengguna sistem</p>
      </div>
      {#if $auth.user?.role_id === 1}
        <button class="btn btn-primary" on:click={openAddModal}>
          + Tambah Pengguna
        </button>
      {/if}
    </div>

    <div class="content-section animate-fade-in">
      <DataTable 
        data={users} 
        {columns} 
        {loading}
        emptyMessage="Tiada pengguna dijumpai"
      />
    </div>
  </div>
</div>

<!-- Modal -->
{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
        <button class="modal-close" on:click={closeModal}>×</button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="modal-body">
        {#if formError}
          <div class="error-message">{formError}</div>
        {/if}

        <div class="form-group">
          <label for="name" class="label">Nama</label>
          <input 
            type="text" 
            id="name" 
            class="input" 
            bind:value={formData.name}
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="label">Email</label>
          <input 
            type="email" 
            id="email" 
            class="input" 
            bind:value={formData.email}
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="label">
            Kata Laluan {editingUser ? '(kosongkan jika tidak mahu tukar)' : ''}
          </label>
          <input 
            type="password" 
            id="password" 
            class="input" 
            bind:value={formData.password}
            required={!editingUser}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="role" class="label">Peranan</label>
            <select id="role" class="input" bind:value={formData.role_id}>
              <option value={1}>Admin</option>
              <option value={2}>Manager</option>
              <option value={3}>Staff</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status" class="label">Status</label>
            <select id="status" class="input" bind:value={formData.status}>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-outline" on:click={closeModal}>
            Batal
          </button>
          <button type="submit" class="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .admin-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
  }

  .page-header h1 {
    font-size: 1.75rem;
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-md);
  }

  .modal {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 450px;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h2 {
    font-size: 1.125rem;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background: var(--color-bg-hover);
    color: var(--color-text);
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .error-message {
    padding: var(--space-sm) var(--space-md);
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }
</style>
