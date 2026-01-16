<script>
  import { createEventDispatcher } from 'svelte';

  export let year = new Date().getFullYear();
  export let month = new Date().getMonth();
  export let attendanceData = [];

  const dispatch = createEventDispatcher();

  const dayNames = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  $: daysInMonth = new Date(year, month + 1, 0).getDate();
  $: firstDayIndex = new Date(year, month, 1).getDay();
  $: days = generateDays(year, month, daysInMonth, firstDayIndex);

  function generateDays(y, m, total, startIndex) {
    const result = [];
    
    // Empty cells before first day
    for (let i = 0; i < startIndex; i++) {
      result.push({ day: null, date: null });
    }
    
    // Days of month
    for (let d = 1; d <= total; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const attendance = attendanceData.find(a => a.date === dateStr);
      result.push({
        day: d,
        date: dateStr,
        attendance,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    return result;
  }

  function prevMonth() {
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
    dispatch('change', { year, month });
  }

  function nextMonth() {
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
    dispatch('change', { year, month });
  }

  function getStatusClass(attendance) {
    if (!attendance) return '';
    switch (attendance.status) {
      case 'present': return 'status-present';
      case 'late': return 'status-late';
      case 'absent': return 'status-absent';
      case 'leave': return 'status-leave';
      default: return '';
    }
  }
</script>

<div class="calendar">
  <div class="calendar-header">
    <button class="nav-btn" on:click={prevMonth}>←</button>
    <h3 class="calendar-title">{monthNames[month]} {year}</h3>
    <button class="nav-btn" on:click={nextMonth}>→</button>
  </div>

  <div class="calendar-grid">
    {#each dayNames as dayName}
      <div class="day-header">{dayName}</div>
    {/each}

    {#each days as { day, date, attendance, isToday }}
      <div 
        class="day-cell"
        class:empty={!day}
        class:today={isToday}
        class:has-attendance={attendance}
      >
        {#if day}
          <span class="day-number">{day}</span>
          {#if attendance}
            <div class="status-dot {getStatusClass(attendance)}"></div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  <div class="calendar-legend">
    <div class="legend-item">
      <span class="legend-dot status-present"></span>
      <span>Hadir</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot status-late"></span>
      <span>Lewat</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot status-absent"></span>
      <span>Tidak Hadir</span>
    </div>
  </div>
</div>

<style>
  .calendar {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
    padding: var(--space-md);
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }

  .calendar-title {
    font-size: 1rem;
    font-weight: 600;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--color-border);
    background: transparent;
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all var(--transition-fast);
  }

  .nav-btn:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  .day-header {
    padding: var(--space-xs);
    text-align: center;
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
    min-height: 36px;
  }

  .day-cell:not(.empty):hover {
    background: var(--color-bg-hover);
  }

  .day-cell.empty {
    background: transparent;
  }

  .day-cell.today {
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid var(--color-primary);
  }

  .day-number {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-dot,
  .legend-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-present { background: var(--color-success); }
  .status-late { background: var(--color-warning); }
  .status-absent { background: var(--color-danger); }
  .status-leave { background: var(--color-primary); }

  .calendar-legend {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 0.65rem;
    color: var(--color-text-muted);
  }

  /* Desktop */
  @media (min-width: 768px) {
    .calendar {
      padding: var(--space-lg);
    }

    .calendar-header {
      margin-bottom: var(--space-lg);
    }

    .calendar-title {
      font-size: 1.125rem;
    }

    .nav-btn {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }

    .calendar-grid {
      gap: 2px;
    }

    .day-header {
      padding: var(--space-sm);
      font-size: 0.75rem;
    }

    .day-cell {
      gap: 4px;
      border-radius: var(--radius-md);
    }

    .day-number {
      font-size: 0.875rem;
    }

    .status-dot,
    .legend-dot {
      width: 8px;
      height: 8px;
    }

    .calendar-legend {
      gap: var(--space-lg);
      margin-top: var(--space-lg);
      padding-top: var(--space-md);
    }

    .legend-item {
      gap: var(--space-sm);
      font-size: 0.75rem;
    }
  }
</style>
