<script>
  import { onMount } from 'svelte';
  import api from '$lib/api/client.js';

  let locations = [];
  let loading = true;
  let showModal = false;
  let editingLocation = null;
  let formData = { name: '', address: '', latitude: '', longitude: '', radius: 100, is_active: true };
  let formError = '';
  let formLoading = false;

  onMount(() => {
    fetchLocations();
  });

  async function fetchLocations() {
    loading = true;
    try {
      const result = await api.getLocations();
      locations = result.data || [];
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
    loading = false;
  }

  function openAddModal() {
    editingLocation = null;
    formData = { name: '', address: '', latitude: '', longitude: '', radius: 100, is_active: true };
    formError = '';
    showModal = true;
  }

  function openEditModal(location) {
    editingLocation = location;
    formData = { 
      name: location.name, 
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      is_active: location.is_active
    };
    formError = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingLocation = null;
    formError = '';
  }

  async function handleSubmit() {
    formError = '';
    formLoading = true;

    // Validate
    if (!formData.name || !formData.latitude || !formData.longitude) {
      formError = 'Nama, latitude, dan longitude diperlukan';
      formLoading = false;
      return;
    }

    try {
      if (editingLocation) {
        await api.updateLocation(editingLocation.id, formData);
      } else {
        await api.createLocation(formData);
      }
      closeModal();
      fetchLocations();
    } catch (error) {
      formError = error.message;
    }

    formLoading = false;
  }

  async function handleDelete(id) {
    if (!confirm('Adakah anda pasti mahu padam lokasi ini?')) return;
    
    try {
      await api.deleteLocation(id);
      fetchLocations();
    } catch (error) {
      alert('Gagal padam: ' + error.message);
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      formError = 'GPS tidak disokong';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        formData.latitude = position.coords.latitude.toFixed(8);
        formData.longitude = position.coords.longitude.toFixed(8);
      },
      (error) => {
        formError = 'Gagal mendapatkan lokasi: ' + error.message;
      },
      { enableHighAccuracy: true }
    );
  }
</script>

<svelte:head>
  <title>Lokasi - Kehadiran</title>
</svelte:head>

<div class="locations-page">
  <div class="container">
    <div class="page-header">
      <div>
        <h1>📍 Lokasi Check-in</h1>
        <p class="subtitle">Urus lokasi yang dibenarkan untuk check-in/check-out</p>
      </div>
      <button class="btn btn-primary" on:click={openAddModal}>
        + Tambah Lokasi
      </button>
    </div>

    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <span>Memuatkan...</span>
      </div>
    {:else if locations.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📍</span>
        <h3>Tiada lokasi dikonfigurasi</h3>
        <p>Tambah lokasi untuk mengaktifkan geofencing.<br>Jika tiada lokasi, check-in dibenarkan dari mana-mana.</p>
        <button class="btn btn-primary" on:click={openAddModal}>
          + Tambah Lokasi Pertama
        </button>
      </div>
    {:else}
      <div class="locations-grid">
        {#each locations as location}
          <div class="location-card" class:inactive={!location.is_active}>
            <div class="location-header">
              <h3>{location.name}</h3>
              {#if location.is_active}
                <span class="badge badge-success">Aktif</span>
              {:else}
                <span class="badge badge-danger">Tidak Aktif</span>
              {/if}
            </div>
            
            {#if location.address}
              <p class="location-address">{location.address}</p>
            {/if}
            
            <div class="location-coords">
              <div class="coord-item">
                <span class="coord-label">Lat</span>
                <span class="coord-value">{location.latitude}</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">Lng</span>
                <span class="coord-value">{location.longitude}</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">Radius</span>
                <span class="coord-value">{location.radius}m</span>
              </div>
            </div>
            
            <div class="location-actions">
              <button class="btn btn-outline btn-sm" on:click={() => openEditModal(location)}>
                ✏️ Edit
              </button>
              <button class="btn btn-danger btn-sm" on:click={() => handleDelete(location.id)}>
                🗑️ Padam
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Modal -->
{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi'}</h2>
        <button class="modal-close" on:click={closeModal}>×</button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="modal-body">
        {#if formError}
          <div class="error-message">{formError}</div>
        {/if}

        <div class="form-group">
          <label for="name" class="label">Nama Lokasi *</label>
          <input 
            type="text" 
            id="name" 
            class="input" 
            bind:value={formData.name}
            placeholder="Contoh: Pejabat Utama"
            required
          />
        </div>

        <div class="form-group">
          <label for="address" class="label">Alamat</label>
          <textarea 
            id="address" 
            class="input textarea" 
            bind:value={formData.address}
            placeholder="Alamat penuh (pilihan)"
            rows="2"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="latitude" class="label">Latitude *</label>
            <input 
              type="number" 
              id="latitude" 
              class="input" 
              bind:value={formData.latitude}
              step="0.00000001"
              placeholder="3.1390"
              required
            />
          </div>

          <div class="form-group">
            <label for="longitude" class="label">Longitude *</label>
            <input 
              type="number" 
              id="longitude" 
              class="input" 
              bind:value={formData.longitude}
              step="0.00000001"
              placeholder="101.6869"
              required
            />
          </div>
        </div>

        <button type="button" class="btn btn-outline" style="width: 100%; margin-bottom: var(--space-md);" on:click={getCurrentLocation}>
          📍 Gunakan Lokasi Semasa
        </button>

        <div class="form-row">
          <div class="form-group">
            <label for="radius" class="label">Radius (meter)</label>
            <input 
              type="number" 
              id="radius" 
              class="input" 
              bind:value={formData.radius}
              min="10"
              max="1000"
            />
          </div>

          <div class="form-group">
            <label for="status" class="label">Status</label>
            <select id="status" class="input" bind:value={formData.is_active}>
              <option value={true}>Aktif</option>
              <option value={false}>Tidak Aktif</option>
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
  .locations-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .page-header h1 {
    font-size: 1.5rem;
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .locations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-md);
  }

  .location-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
  }

  .location-card.inactive {
    opacity: 0.6;
  }

  .location-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
  }

  .location-header h3 {
    font-size: 1.125rem;
    margin: 0;
  }

  .location-address {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
  }

  .location-coords {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
    flex-wrap: wrap;
  }

  .coord-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .coord-label {
    font-size: 0.65rem;
    color: var(--color-text-dim);
    text-transform: uppercase;
  }

  .coord-value {
    font-size: 0.875rem;
    font-family: monospace;
  }

  .location-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .btn-sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
  }

  .btn-danger {
    background: transparent;
    border: 1px solid var(--color-danger);
    color: var(--color-danger);
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl);
    color: var(--color-text-muted);
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-md);
  }

  .empty-state h3 {
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }

  .empty-state p {
    margin-bottom: var(--space-lg);
    line-height: 1.5;
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
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
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
    position: sticky;
    top: 0;
    background: var(--color-bg-card);
  }

  .modal-header h2 {
    font-size: 1.125rem;
    margin: 0;
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

  .textarea {
    resize: vertical;
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

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: var(--space-md);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
