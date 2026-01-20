<script>
  import { onMount } from "svelte";
  import auth from "$lib/stores/auth.js";
  import attendance from "$lib/stores/attendance.js";
  import AttendanceButton from "$lib/components/AttendanceButton.svelte";
  import api from "$lib/api/client.js";

  let currentTime = "";
  let currentDate = "";
  let schedule = null;

  // Wait for auth to be ready and authenticated before fetching data
  $: if (!$auth.isLoading && $auth.isAuthenticated) {
    fetchData();
  }

  let dataFetched = false;
  async function fetchData() {
    if (dataFetched) return;
    dataFetched = true;

    // Fetch today's attendance
    attendance.fetchToday().catch(() => {});

    // Fetch schedule info
    try {
      const result = await api.getSchedule();
      schedule = result.data;
    } catch (e) {}
  }

  onMount(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  });

  function updateDateTime() {
    const now = new Date();
    currentTime = now.toLocaleTimeString("ms-MY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    currentDate = now.toLocaleDateString("ms-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Tengahari";
    if (hour < 18) return "Selamat Petang";
    return "Selamat Malam";
  }

  function isWorkingDay() {
    const day = new Date().getDay();
    return [0, 1, 2, 3, 4].includes(day); // Ahad - Khamis
  }

  function getTodaySchedule() {
    const day = new Date().getDay();
    if (day === 4) {
      return "Hari ini: Check-out 3:00 - 4:30 petang";
    } else if ([0, 1, 2, 3].includes(day)) {
      return "Hari ini: Check-out 4:30 - 6:00 petang";
    }
    return "Hari ini cuti";
  }

  $: greeting = getGreeting();
  $: workingDay = isWorkingDay();
  $: todaySchedule = getTodaySchedule();
</script>

<svelte:head>
  <title>Dashboard - Kehadiran</title>
</svelte:head>

<div class="dashboard">
  <div class="container">
    <!-- Welcome Section -->
    <div class="welcome-section animate-fade-in">
      <h1 class="greeting">
        {greeting}, {$auth.user?.name?.split(" ")[0]}! 👋
      </h1>
      <p class="date-display">{currentDate}</p>
    </div>

    <!-- Time Display -->
    <div class="time-section animate-fade-in" style="animation-delay: 100ms">
      <div class="time-display">{currentTime}</div>
      {#if workingDay}
        <p class="schedule-hint">{todaySchedule}</p>
      {:else}
        <p class="schedule-hint off-day">🏖️ Hari ini bukan hari bekerja</p>
      {/if}
    </div>

    <!-- Attendance Button -->
    <div
      class="attendance-section animate-fade-in"
      style="animation-delay: 200ms"
    >
      <AttendanceButton />
    </div>

    <!-- Quick Stats -->
    <div class="stats-section animate-fade-in" style="animation-delay: 300ms">
      <div class="stat-card">
        <span class="stat-icon">📅</span>
        <div class="stat-content">
          <span class="stat-label">Status Hari Ini</span>
          <span class="stat-value">
            {#if $attendance.today}
              {#if $attendance.today.status === "present"}
                <span class="badge badge-success">Hadir</span>
              {:else if $attendance.today.status === "late"}
                <span class="badge badge-warning">Lewat</span>
              {:else}
                <span class="badge badge-info">{$attendance.today.status}</span>
              {/if}
            {:else}
              <span class="badge badge-danger">Belum Check-in</span>
            {/if}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">⏰</span>
        <div class="stat-content">
          <span class="stat-label">Waktu Masuk</span>
          <span class="stat-value">{$attendance.today?.check_in || "-"}</span>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">🚪</span>
        <div class="stat-content">
          <span class="stat-label">Waktu Keluar</span>
          <span class="stat-value">{$attendance.today?.check_out || "-"}</span>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <div class="stat-content">
          <span class="stat-label">Jam Bekerja</span>
          <span class="stat-value">
            {#if $attendance.today?.work_hours}
              {$attendance.today.work_hours} jam
              {#if parseFloat($attendance.today.overtime_hours) > 0}
                <span class="overtime-tag"
                  >+{$attendance.today.overtime_hours} OT</span
                >
              {/if}
            {:else}
              -
            {/if}
          </span>
        </div>
      </div>
    </div>

    <!-- Note if exists -->
    {#if $attendance.today?.note}
      <div class="note-section animate-fade-in" style="animation-delay: 400ms">
        <div class="note-card">
          <span class="note-icon">📝</span>
          <div class="note-content">
            <span class="note-label">Catatan</span>
            <span class="note-text">{$attendance.today.note}</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Schedule Info -->
    {#if schedule}
      <div
        class="schedule-section animate-fade-in"
        style="animation-delay: 500ms"
      >
        <h3>📆 Waktu Bekerja</h3>
        <div class="schedule-grid">
          <div class="schedule-item">
            <span class="schedule-label">Hari Bekerja</span>
            <span class="schedule-value">{schedule.workingDays.join(", ")}</span
            >
          </div>
          <div class="schedule-item">
            <span class="schedule-label">Check-In</span>
            <span class="schedule-value"
              >{schedule.checkIn.earliest} - {schedule.checkIn.latest}</span
            >
          </div>
          <div class="schedule-item">
            <span class="schedule-label">Check-Out (Ahad-Rabu)</span>
            <span class="schedule-value"
              >{schedule.checkOut.regular.earliest} - {schedule.checkOut.regular
                .latest}</span
            >
          </div>
          <div class="schedule-item">
            <span class="schedule-label">Check-Out (Khamis)</span>
            <span class="schedule-value"
              >{schedule.checkOut.thursday.earliest} - {schedule.checkOut
                .thursday.latest}</span
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .greeting {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .date-display {
    color: var(--color-text-muted);
    font-size: 1rem;
  }

  .time-section {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .time-display {
    font-size: 4rem;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .schedule-hint {
    margin-top: var(--space-sm);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .schedule-hint.off-day {
    color: var(--color-warning);
  }

  .attendance-section {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-2xl);
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-md);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 600;
    margin-top: var(--space-xs);
  }

  .overtime-tag {
    font-size: 0.75rem;
    background: var(--color-success);
    color: white;
    padding: 2px 6px;
    border-radius: var(--radius-full);
    margin-left: var(--space-xs);
  }

  .note-section {
    margin-top: var(--space-lg);
  }

  .note-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--color-warning);
    border-radius: var(--radius-xl);
  }

  .note-icon {
    font-size: 1.5rem;
  }

  .note-content {
    display: flex;
    flex-direction: column;
  }

  .note-label {
    font-size: 0.75rem;
    color: var(--color-warning);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .note-text {
    font-size: 0.875rem;
    color: var(--color-text);
    margin-top: var(--space-xs);
  }

  .schedule-section {
    margin-top: var(--space-xl);
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
  }

  .schedule-section h3 {
    font-size: 1rem;
    margin-bottom: var(--space-md);
    color: var(--color-text-muted);
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .schedule-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .schedule-label {
    font-size: 0.75rem;
    color: var(--color-text-dim);
  }

  .schedule-value {
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 600px) {
    .time-display {
      font-size: 2.5rem;
    }

    .greeting {
      font-size: 1.25rem;
    }

    .schedule-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
