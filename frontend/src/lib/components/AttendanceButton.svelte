<script>
  import { onMount } from 'svelte';
  import { attendance, hasCheckedIn, hasCheckedOut } from '$lib/stores/attendance.js';
  import api from '$lib/api/client.js';
  
  let loading = false;
  let message = '';
  let messageType = '';
  let showNoteModal = false;
  let noteText = '';
  let pendingAction = null; // 'checkin' or 'checkout'
  let requiresNote = false;
  let noteReason = '';
  
  // Location state
  let gettingLocation = false;
  let locationError = '';
  let currentLocation = null;

  function getCurrentTime() {
    return new Date().toLocaleTimeString('ms-MY', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function isLateCheckIn() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours > 9) || (hours === 9 && minutes > 0);
  }

  function isEarlyCheckOut() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Thursday: before 3:00 PM (15:00)
    if (day === 4) {
      return currentMinutes < (15 * 60);
    }
    // Other days: before 4:30 PM (16:30)
    return currentMinutes < (16 * 60 + 30);
  }

  // Get current GPS location
  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS tidak disokong oleh browser ini'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Sila benarkan akses lokasi untuk check-in'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Maklumat lokasi tidak tersedia'));
              break;
            case error.TIMEOUT:
              reject(new Error('Permintaan lokasi tamat masa'));
              break;
            default:
              reject(new Error('Ralat mendapatkan lokasi'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  async function handleCheckIn() {
    loading = true;
    gettingLocation = true;
    message = '';
    locationError = '';

    try {
      // Get GPS location first
      currentLocation = await getLocation();
      gettingLocation = false;

      // Check if late - require note
      if (isLateCheckIn()) {
        pendingAction = 'checkin';
        requiresNote = true;
        noteReason = 'Check-in lewat (selepas 9:00 pagi)';
        showNoteModal = true;
        loading = false;
        return;
      }
      
      await doCheckIn();
    } catch (error) {
      gettingLocation = false;
      loading = false;
      message = error.message;
      messageType = 'error';
      locationError = error.message;
    }
  }

  async function doCheckIn(note = null) {
    loading = true;
    message = '';
    try {
      const result = await api.checkIn({ 
        source: 'web', 
        note,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude
      });
      await attendance.fetchToday();
      message = `Check-in berjaya pada ${getCurrentTime()}`;
      messageType = 'success';
      showNoteModal = false;
      noteText = '';
      currentLocation = null;
    } catch (error) {
      // If error says note required, show modal
      if (error.message.includes('catatan')) {
        pendingAction = 'checkin';
        requiresNote = true;
        noteReason = 'Check-in lewat';
        showNoteModal = true;
      } else {
        message = error.message;
        messageType = 'error';
      }
    }
    loading = false;
  }

  async function handleCheckOut() {
    loading = true;
    gettingLocation = true;
    message = '';
    locationError = '';

    try {
      // Get GPS location first
      currentLocation = await getLocation();
      gettingLocation = false;

      // Check if early - require note
      if (isEarlyCheckOut()) {
        pendingAction = 'checkout';
        requiresNote = true;
        const day = new Date().getDay();
        const time = day === 4 ? '3:00 petang' : '4:30 petang';
        noteReason = `Check-out awal (sebelum ${time})`;
        showNoteModal = true;
        loading = false;
        return;
      }
      
      await doCheckOut();
    } catch (error) {
      gettingLocation = false;
      loading = false;
      message = error.message;
      messageType = 'error';
      locationError = error.message;
    }
  }

  async function doCheckOut(note = null) {
    loading = true;
    message = '';
    try {
      const result = await api.checkOut({ 
        note,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude
      });
      await attendance.fetchToday();
      message = `Check-out berjaya pada ${getCurrentTime()}`;
      messageType = 'success';
      showNoteModal = false;
      noteText = '';
      currentLocation = null;
    } catch (error) {
      // If error says note required, show modal
      if (error.message.includes('catatan')) {
        pendingAction = 'checkout';
        requiresNote = true;
        noteReason = 'Check-out awal';
        showNoteModal = true;
      } else {
        message = error.message;
        messageType = 'error';
      }
    }
    loading = false;
  }

  function submitNote() {
    if (!noteText.trim()) {
      return;
    }
    
    if (pendingAction === 'checkin') {
      doCheckIn(noteText);
    } else if (pendingAction === 'checkout') {
      doCheckOut(noteText);
    }
  }

  function cancelNote() {
    showNoteModal = false;
    noteText = '';
    pendingAction = null;
    requiresNote = false;
    currentLocation = null;
    loading = false;
  }
</script>

<div class="attendance-button-container">
  {#if !$hasCheckedIn}
    <!-- Not checked in yet -->
    <button 
      class="attendance-btn check-in"
      on:click={handleCheckIn}
      disabled={loading}
    >
      {#if loading}
        <span class="spinner"></span>
      {:else}
        <span class="btn-icon">👋</span>
        <span class="btn-label">Check In</span>
        <span class="btn-time">{getCurrentTime()}</span>
      {/if}
    </button>
  {:else if !$hasCheckedOut}
    <!-- Checked in, not checked out -->
    <button 
      class="attendance-btn check-out"
      on:click={handleCheckOut}
      disabled={loading}
    >
      {#if loading}
        <span class="spinner"></span>
      {:else}
        <span class="btn-icon">👋</span>
        <span class="btn-label">Check Out</span>
        <span class="btn-time">{getCurrentTime()}</span>
      {/if}
    </button>
  {:else}
    <!-- Both done -->
    <div class="attendance-done">
      <span class="done-icon">✅</span>
      <span class="done-label">Kehadiran Hari Ini Selesai</span>
      <div class="done-times">
        <span>Masuk: {$attendance.today?.check_in}</span>
        <span>Keluar: {$attendance.today?.check_out}</span>
      </div>
      {#if $attendance.today?.work_hours}
        <div class="work-hours">
          <span class="hours-label">Jam Bekerja:</span>
          <span class="hours-value">{$attendance.today.work_hours} jam</span>
          {#if parseFloat($attendance.today.overtime_hours) > 0}
            <span class="overtime-badge">+{$attendance.today.overtime_hours} OT</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if message}
    <div class="message" class:success={messageType === 'success'} class:error={messageType === 'error'}>
      {message}
    </div>
  {/if}
</div>

<!-- Note Modal -->
{#if showNoteModal}
  <div class="modal-overlay" on:click={cancelNote}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h3>📝 Catatan Diperlukan</h3>
      </div>
      <div class="modal-body">
        <p class="note-reason">{noteReason}</p>
        <label for="note" class="label">Sila masukkan sebab:</label>
        <textarea 
          id="note"
          class="input textarea"
          placeholder="Contoh: Trafik sesak, Urusan kecemasan..."
          bind:value={noteText}
          rows="3"
        ></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" on:click={cancelNote}>Batal</button>
        <button 
          class="btn btn-primary" 
          on:click={submitNote}
          disabled={!noteText.trim() || loading}
        >
          {loading ? 'Menghantar...' : 'Hantar'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .attendance-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .attendance-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-family: inherit;
  }

  .attendance-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .check-in {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4);
  }

  .check-in:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 15px 50px rgba(34, 197, 94, 0.5);
  }

  .check-out {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);
  }

  .check-out:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 15px 50px rgba(245, 158, 11, 0.5);
  }

  .btn-icon {
    font-size: 3rem;
    margin-bottom: var(--space-sm);
  }

  .btn-label {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .btn-time {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin-top: var(--space-xs);
  }

  .attendance-done {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-xl);
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
  }

  .done-icon {
    font-size: 3rem;
    margin-bottom: var(--space-sm);
  }

  .done-label {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-success);
  }

  .done-times {
    display: flex;
    gap: var(--space-lg);
    margin-top: var(--space-md);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .work-hours {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: rgba(99, 102, 241, 0.1);
    border-radius: var(--radius-md);
  }

  .hours-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .hours-value {
    font-weight: 600;
    color: var(--color-primary-light);
  }

  .overtime-badge {
    background: var(--color-success);
    color: white;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .message {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .message.success {
    background: rgba(34, 197, 94, 0.2);
    color: var(--color-success);
  }

  .message.error {
    background: rgba(239, 68, 68, 0.2);
    color: var(--color-danger);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
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
    max-width: 400px;
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
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.125rem;
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .note-reason {
    background: rgba(245, 158, 11, 0.2);
    color: var(--color-warning);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
  }

  .textarea {
    resize: vertical;
    min-height: 80px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
