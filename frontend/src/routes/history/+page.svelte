<script>
  import { onMount } from "svelte";
  import api from "$lib/api/client.js";
  import auth from "$lib/stores/auth.js";
  import CalendarView from "$lib/components/CalendarView.svelte";
  import DataTable from "$lib/components/DataTable.svelte";

  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let attendanceData = [];
  let summary = null;
  let loading = true;

  const columns = [
    { key: "date", label: "Tarikh" },
    { key: "check_in", label: "Masuk" },
    { key: "check_out", label: "Keluar" },
    {
      key: "work_hours",
      label: "Jam",
      render: (value, row) => {
        if (!value) return "-";
        let html = `${value}`;
        if (parseFloat(row.overtime_hours) > 0) {
          html += ` <span style="color: #22c55e; font-size: 0.75rem;">(+${row.overtime_hours} OT)</span>`;
        }
        return html;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        let badges = [];

        if (value === "present") {
          badges.push('<span class="badge badge-success">Hadir</span>');
        } else if (value === "late" || row.is_late) {
          badges.push('<span class="badge badge-warning">Lewat</span>');
        } else if (value === "absent") {
          badges.push('<span class="badge badge-danger">Tidak Hadir</span>');
        } else {
          badges.push(`<span class="badge badge-info">${value || "-"}</span>`);
        }

        if (row.is_early_leave) {
          badges.push('<span class="badge badge-warning">Awal</span>');
        }

        return badges.join(" ");
      },
    },
    {
      key: "note",
      label: "Catatan",
      render: (value) => {
        if (!value) return "-";
        const truncated =
          value.length > 30 ? value.substring(0, 30) + "..." : value;
        return `<span title="${value}">${truncated}</span>`;
      },
    },
  ];

  // Wait for auth to be ready and authenticated before fetching data
  let initialFetchDone = false;
  $: if (!$auth.isLoading && $auth.isAuthenticated && !initialFetchDone) {
    initialFetchDone = true;
    fetchData();
  }

  async function fetchData() {
    loading = true;
    try {
      const result = await api.getMonthlySummary(year, month + 1);
      summary = result.data;
      attendanceData = result.data?.records || [];
    } catch (error) {
      console.error("Failed to fetch history:", error);
      attendanceData = [];
      summary = null;
    }
    loading = false;
  }

  function handleMonthChange(event) {
    year = event.detail.year;
    month = event.detail.month;
    fetchData();
  }
</script>

<svelte:head>
  <title>Sejarah Kehadiran - Kehadiran</title>
</svelte:head>

<div class="history-page">
  <div class="container">
    <div class="page-header">
      <h1>Sejarah Kehadiran</h1>
      <p class="subtitle">Lihat rekod kehadiran anda</p>
    </div>

    <!-- Stats Summary -->
    <div class="stats-row animate-fade-in">
      <div class="stat-box">
        <span class="stat-number">{summary?.total_days || 0}</span>
        <span class="stat-label">Jumlah Hari</span>
      </div>
      <div class="stat-box stat-present">
        <span class="stat-number">{summary?.present || 0}</span>
        <span class="stat-label">Hadir</span>
      </div>
      <div class="stat-box stat-late">
        <span class="stat-number">{summary?.late || 0}</span>
        <span class="stat-label">Lewat</span>
      </div>
      <div class="stat-box stat-early">
        <span class="stat-number">{summary?.early_leave || 0}</span>
        <span class="stat-label">Keluar Awal</span>
      </div>
    </div>

    <!-- Hours Summary -->
    <div class="hours-row animate-fade-in" style="animation-delay: 100ms">
      <div class="hours-box">
        <span class="hours-icon">⏱️</span>
        <div class="hours-content">
          <span class="hours-value">{summary?.total_work_hours || 0}</span>
          <span class="hours-label">Jumlah Jam Bekerja</span>
        </div>
      </div>
      <div class="hours-box overtime">
        <span class="hours-icon">🚀</span>
        <div class="hours-content">
          <span class="hours-value">{summary?.total_overtime_hours || 0}</span>
          <span class="hours-label">Jumlah Overtime</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- Calendar -->
      <div
        class="calendar-section animate-fade-in"
        style="animation-delay: 200ms"
      >
        <CalendarView
          {year}
          {month}
          {attendanceData}
          on:change={handleMonthChange}
        />
      </div>

      <!-- Table -->
      <div class="table-section animate-fade-in" style="animation-delay: 300ms">
        <h2>Senarai Kehadiran</h2>
        <DataTable
          data={attendanceData}
          {columns}
          {loading}
          emptyMessage="Tiada rekod kehadiran untuk bulan ini"
        />
      </div>
    </div>
  </div>
</div>

<style>
  .history-page {
    max-width: 1100px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: var(--space-lg);
  }

  .page-header h1 {
    font-size: 1.5rem;
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .stat-box {
    padding: var(--space-sm);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .stat-present .stat-number {
    color: var(--color-success);
  }
  .stat-late .stat-number {
    color: var(--color-warning);
  }
  .stat-early .stat-number {
    color: var(--color-warning);
  }

  .hours-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .hours-box {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .hours-box.overtime {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.1) 0%,
      rgba(16, 185, 129, 0.1) 100%
    );
    border-color: var(--color-success);
  }

  .hours-icon {
    font-size: 1.5rem;
  }

  .hours-content {
    display: flex;
    flex-direction: column;
  }

  .hours-value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .hours-box.overtime .hours-value {
    color: var(--color-success);
  }

  .hours-label {
    font-size: 0.65rem;
    color: var(--color-text-muted);
  }

  .content-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .calendar-section {
    width: 100%;
  }

  .table-section {
    width: 100%;
    overflow-x: auto;
  }

  .table-section h2 {
    font-size: 1rem;
    margin-bottom: var(--space-md);
    color: var(--color-text-muted);
  }

  /* Desktop layout */
  @media (min-width: 900px) {
    .page-header h1 {
      font-size: 1.75rem;
    }

    .stats-row {
      gap: var(--space-md);
    }

    .stat-box {
      padding: var(--space-md);
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }

    .hours-row {
      gap: var(--space-md);
    }

    .hours-box {
      padding: var(--space-lg);
      gap: var(--space-md);
    }

    .hours-icon {
      font-size: 2rem;
    }

    .hours-value {
      font-size: 1.5rem;
    }

    .hours-label {
      font-size: 0.75rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--space-xl);
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-number {
      font-size: 1.1rem;
    }

    .stat-label {
      font-size: 0.6rem;
    }

    .hours-row {
      grid-template-columns: 1fr;
    }
  }
</style>
