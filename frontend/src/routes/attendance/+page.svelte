<script>
  import { onMount } from "svelte";
  import attendance from "$lib/stores/attendance.js";
  import auth from "$lib/stores/auth.js";
  import AttendanceButton from "$lib/components/AttendanceButton.svelte";
  import { formatTime } from "$lib/utils.js";

  let currentTime = "";

  // Wait for auth to be ready and authenticated before fetching data
  let initialFetchDone = false;
  $: if (!$auth.isLoading && $auth.isAuthenticated && !initialFetchDone) {
    initialFetchDone = true;
    attendance.fetchToday();
  }

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date().toLocaleTimeString("ms-MY");
    }, 1000);
    currentTime = new Date().toLocaleTimeString("ms-MY");

    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Kehadiran - Check In/Out</title>
</svelte:head>

<div class="attendance-page">
  <div class="container">
    <div class="page-header">
      <h1>Kehadiran</h1>
      <p class="subtitle">Rekod kehadiran anda untuk hari ini</p>
    </div>

    <div class="attendance-content">
      <!-- Time Display -->
      <div class="current-time-card animate-fade-in">
        <span class="time-label">Masa Sekarang</span>
        <span class="time-value">{currentTime}</span>
        <span class="date-value">
          {new Date().toLocaleDateString("ms-MY", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <!-- Attendance Button -->
      <div
        class="button-section animate-fade-in"
        style="animation-delay: 100ms"
      >
        <AttendanceButton />
      </div>

      <!-- Today's Record -->
      {#if $attendance.today}
        <div class="record-card animate-fade-in" style="animation-delay: 200ms">
          <h3>Rekod Hari Ini</h3>
          <div class="record-grid">
            <div class="record-item">
              <span class="record-label">Tarikh</span>
              <span class="record-value">{$attendance.today.date}</span>
            </div>
            <div class="record-item">
              <span class="record-label">Check In</span>
              <span class="record-value"
                >{formatTime($attendance.today.check_in)}</span
              >
            </div>
            <div class="record-item">
              <span class="record-label">Check Out</span>
              <span class="record-value"
                >{formatTime($attendance.today.check_out)}</span
              >
            </div>
            <div class="record-item">
              <span class="record-label">Status</span>
              <span class="record-value">
                {#if $attendance.today.status === "present"}
                  <span class="badge badge-success">Hadir</span>
                {:else if $attendance.today.status === "late"}
                  <span class="badge badge-warning">Lewat</span>
                {:else}
                  <span class="badge badge-info"
                    >{$attendance.today.status}</span
                  >
                {/if}
              </span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .attendance-page {
    max-width: 600px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .page-header h1 {
    font-size: 1.75rem;
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
  }

  .attendance-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
  }

  .current-time-card {
    text-align: center;
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 100%;
  }

  .time-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    margin-bottom: var(--space-sm);
  }

  .time-value {
    display: block;
    font-size: 3rem;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .date-value {
    display: block;
    margin-top: var(--space-sm);
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .button-section {
    padding: var(--space-lg) 0;
  }

  .record-card {
    width: 100%;
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
  }

  .record-card h3 {
    font-size: 1rem;
    margin-bottom: var(--space-md);
    color: var(--color-text-muted);
  }

  .record-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .record-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .record-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-dim);
  }

  .record-value {
    font-size: 1rem;
    font-weight: 500;
  }
</style>
