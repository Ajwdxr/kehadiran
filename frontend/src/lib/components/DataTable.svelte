<script>
  export let data = [];
  export let columns = [];
  export let loading = false;
  export let emptyMessage = 'Tiada data';

  // For mobile, show only key columns
  $: mobileColumns = columns.filter(c => 
    ['date', 'check_in', 'check_out', 'status'].includes(c.key)
  );
</script>

<div class="table-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Memuatkan...</span>
    </div>
  {:else if data.length === 0}
    <div class="empty-state">
      <span class="empty-icon">📭</span>
      <span>{emptyMessage}</span>
    </div>
  {:else}
    <!-- Desktop Table -->
    <div class="desktop-table">
      <table class="table">
        <thead>
          <tr>
            {#each columns as col}
              <th>{col.label}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data as row, i}
            <tr class="animate-fade-in" style="animation-delay: {i * 30}ms">
              {#each columns as col}
                <td>
                  {#if col.render}
                    {@html col.render(row[col.key], row)}
                  {:else}
                    {row[col.key] ?? '-'}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="mobile-cards">
      {#each data as row, i}
        <div class="card-item animate-fade-in" style="animation-delay: {i * 30}ms">
          <div class="card-header">
            <span class="card-date">{row.date}</span>
            {#if row.status === 'present'}
              <span class="badge badge-success">Hadir</span>
            {:else if row.status === 'late' || row.is_late}
              <span class="badge badge-warning">Lewat</span>
            {:else if row.status === 'absent'}
              <span class="badge badge-danger">Tidak Hadir</span>
            {:else}
              <span class="badge badge-info">{row.status || '-'}</span>
            {/if}
            {#if row.is_early_leave}
              <span class="badge badge-warning">Awal</span>
            {/if}
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Masuk</span>
              <span class="card-value">{row.check_in || '-'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Keluar</span>
              <span class="card-value">{row.check_out || '-'}</span>
            </div>
            {#if row.work_hours}
              <div class="card-row">
                <span class="card-label">Jam</span>
                <span class="card-value">
                  {row.work_hours}
                  {#if parseFloat(row.overtime_hours) > 0}
                    <span class="ot-tag">+{row.overtime_hours} OT</span>
                  {/if}
                </span>
              </div>
            {/if}
            {#if row.note}
              <div class="card-note">
                📝 {row.note}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .table-container {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  /* Desktop Table */
  .desktop-table {
    display: none;
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    min-width: 500px;
  }

  .table th {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--color-text-muted);
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .table td {
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.8rem;
  }

  .table tr:last-child td {
    border-bottom: none;
  }

  .table tbody tr {
    transition: background var(--transition-fast);
  }

  .table tbody tr:hover {
    background: var(--color-bg-hover);
  }

  /* Mobile Cards */
  .mobile-cards {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-sm);
  }

  .card-item {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
    flex-wrap: wrap;
  }

  .card-date {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }

  .card-label {
    color: var(--color-text-muted);
  }

  .card-value {
    font-weight: 500;
  }

  .ot-tag {
    font-size: 0.65rem;
    color: var(--color-success);
    margin-left: var(--space-xs);
  }

  .card-note {
    margin-top: var(--space-xs);
    padding: var(--space-xs);
    background: rgba(245, 158, 11, 0.1);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    color: var(--color-warning);
  }

  /* States */
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    color: var(--color-text-muted);
  }

  .empty-icon {
    font-size: 2rem;
  }

  .animate-fade-in {
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  /* Desktop */
  @media (min-width: 768px) {
    .desktop-table {
      display: block;
    }

    .mobile-cards {
      display: none;
    }

    .table th,
    .table td {
      padding: var(--space-md);
      font-size: 0.875rem;
    }

    .table th {
      font-size: 0.75rem;
    }
  }
</style>
