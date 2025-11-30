import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-food-manufacturing',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">Food Manufacturing</p>
          <h1>Provincial production pulse</h1>
          <p class="lede">
            Track how each province performs by food type, month, and target attainment across Sri
            Lanka.
          </p>
        </div>
        <div class="header-actions">
          <button class="ghost-btn">Export snapshot</button>
          <button mat-raised-button color="primary">Add new record</button>
        </div>
      </div>

      <div class="card kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <p class="kpi-label">{{ kpi.label }}</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-change" [class.positive]="kpi.change.startsWith('+')">
              {{ kpi.change }}
            </span>
          </div>
          <p class="kpi-hint">{{ kpi.hint }}</p>
        </div>
      </div>

      <div class="grid two-col">
        <!-- MAP + PROVINCE LIST -->
        <div class="card map-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Sri Lanka map</p>
              <h2>Production by province</h2>
            </div>
            <div class="legend">
              <span><span class="dot ok"></span>Green = OK</span>
              <span><span class="dot medium"></span>Yellow = Medium</span>
              <span><span class="dot low"></span>Red = Low</span>
            </div>
          </div>

          <div class="map-layout">
            <!-- Sri Lanka SVG + production badges -->
            <div class="map-wrapper">
              <img
                class="lk-map"
                src="assets/food-manufacturing/Sri_Lanka_provinces.svg"
                alt="Sri Lanka provincial production map"
              />

              <!-- Badges use provinces[] to show production and status colours -->
              <div class="map-badges">
                <div
                  class="badge"
                  *ngFor="let province of provinces"
                  [ngClass]="province.status"
                >
                  <span class="name">{{ province.name }}</span>
                  <span class="value">{{ province.production | number }} t</span>
                </div>
              </div>

              <p class="map-hint">
                Provinces are coloured on the map; badges show production for this month.
              </p>
            </div>

            <!-- Province chip list -->
            <div class="province-grid">
              <button
                type="button"
                class="province-chip"
                *ngFor="let province of provinces"
                [class.ok]="province.status === 'ok'"
                [class.medium]="province.status === 'medium'"
                [class.low]="province.status === 'low'"
                [class.active]="province.name === selectedProvinceName"
                (click)="selectProvince(province.name)"
              >
                <span class="name">{{ province.name }}</span>
                <span class="production">{{ province.production | number }} t</span>
              </button>
            </div>
          </div>
        </div>

        <!-- DETAILS PANEL -->
        <div class="card details-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Province details</p>
              <h2>{{ selectedProvince.name }}</h2>
              <p class="lede">{{ selectedProvince.sentiment }}</p>
            </div>
            <span class="pill">{{ selectedProvince.changeText }}</span>
          </div>
          <div class="table">
            <div class="table-head">
              <span>Food type</span>
              <span class="right">This month</span>
              <span class="right">Last month</span>
              <span class="right">Change</span>
            </div>
            <div class="table-row" *ngFor="let item of selectedProvince.breakdown">
              <span class="cell-label">{{ item.type }}</span>
              <span class="right">{{ item.current | number }} t</span>
              <span class="right">{{ item.last | number }} t</span>
              <span
                class="right change"
                [class.up]="item.current >= item.last"
                [class.down]="item.current < item.last"
              >
                <span class="material-symbols-outlined">
                  {{ item.current >= item.last ? 'trending_up' : 'trending_down' }}
                </span>
                {{
                  ((item.current - item.last) / item.last) * 100
                    | number : '1.0-1'
                }}%
              </span>
            </div>
          </div>
          <p class="microcopy">
            Tap a province in the list to switch this panel. Small arrow shows direction of change
            month over month.
          </p>
        </div>
      </div>

      <!-- Existing comparison + target cards stay the same -->
      <div class="card">
        <div class="card-header controls">
          <div>
            <p class="eyebrow">Province comparison</p>
            <h2>Bar chart by province</h2>
          </div>
          <div class="segmented">
            <button
              *ngFor="let month of months"
              type="button"
              [class.active]="month === selectedMonth"
              (click)="setMonth(month)"
            >
              {{ month }}
            </button>
          </div>
          <div class="segmented">
            <button
              *ngFor="let type of foodTypes"
              type="button"
              [class.active]="type === selectedFoodType"
              (click)="setFoodType(type)"
            >
              {{ type }}
            </button>
          </div>
        </div>
        <div class="bar-chart">
          <div class="bar-row" *ngFor="let item of provinceComparisons[selectedFoodType]">
            <div class="label">
              <span class="name">{{ item.province }}</span>
              <span class="target">Target {{ item.target }} kt</span>
            </div>
            <div class="bar-track">
              <div class="bar" [style.width]="barWidth(item.value)">
                <span class="value">{{ item.value }} kt</span>
              </div>
              <div class="gap" [style.width]="gapWidth(item)" *ngIf="item.value < item.target">
                Gap {{ item.target - item.value }} kt
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card target-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Target vs actual</p>
            <h2>Close the production gap</h2>
          </div>
          <p class="lede">
            Compare against monthly targets to see where to boost resources.
          </p>
        </div>
        <div class="target-grid">
          <div class="target-item" *ngFor="let item of targetVsActual">
            <div class="target-head">
              <span class="label">{{ item.label }}</span>
              <span class="pill subtle">Gap {{ targetGap(item) }} kt</span>
            </div>
            <div class="target-bars">
              <div class="target-bar">
                <span>Target</span>
                <div class="track">
                  <div class="fill target" [style.width]="barWidth(item.target)"></div>
                </div>
                <span class="value">{{ item.target }} kt</span>
              </div>
              <div class="target-bar">
                <span>Actual</span>
                <div class="track">
                  <div class="fill actual" [style.width]="barWidth(item.actual)"></div>
                </div>
                <span class="value">{{ item.actual }} kt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .page h1 {
        margin: 4px 0 6px;
        font-size: 26px;
      }

      .page .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 11px;
        color: #0b8f61;
      }

      .page .lede {
        margin: 0;
        color: #475569;
        max-width: 640px;
      }

      :host-context(.dark) .page .lede {
        color: #cbd5e1;
      }

      .ghost-btn {
        border: 1px solid rgba(15, 167, 104, 0.35);
        background: rgba(15, 167, 104, 0.07);
        color: #0b8f61;
        padding: 10px 14px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .ghost-btn:hover {
        box-shadow: 0 10px 20px rgba(15, 157, 88, 0.15);
      }

      :host-context(.dark) .ghost-btn {
        background: rgba(16, 185, 129, 0.12);
        color: #befae0;
        border-color: rgba(16, 185, 129, 0.35);
      }

      .card {
        background: #ffffff;
        border-radius: 18px;
        padding: 18px 20px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
      }

      :host-context(.dark) .card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.04);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      }

      .kpi-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .kpi-card {
        padding: 14px 16px;
        border-radius: 14px;
        background: linear-gradient(
          145deg,
          rgba(16, 185, 129, 0.08),
          rgba(34, 197, 94, 0.04)
        );
        border: 1px solid rgba(16, 185, 129, 0.15);
      }

      :host-context(.dark) .kpi-card {
        background: linear-gradient(
          145deg,
          rgba(16, 185, 129, 0.14),
          rgba(15, 23, 42, 0.65)
        );
        border-color: rgba(16, 185, 129, 0.25);
      }

      .kpi-label {
        margin: 0;
        font-size: 12px;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      :host-context(.dark) .kpi-label {
        color: #94a3b8;
      }

      .kpi-value-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .kpi-value {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
      }

      :host-context(.dark) .kpi-value {
        color: #f8fafc;
      }

      .kpi-change {
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(100, 116, 139, 0.15);
        color: #334155;
        font-weight: 600;
        font-size: 12px;
      }

      .kpi-change.positive {
        background: rgba(16, 185, 129, 0.16);
        color: #0f9d58;
      }

      .kpi-hint {
        margin: 4px 0 0;
        color: #475569;
      }

      :host-context(.dark) .kpi-hint {
        color: #cbd5e1;
      }

      .grid.two-col {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
      }

      .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .card-header h2 {
        margin: 4px 0;
      }

      .legend {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 13px;
        color: #475569;
        flex-wrap: wrap;
      }

      :host-context(.dark) .legend {
        color: #cbd5e1;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }

      .dot.ok {
        background: #16a34a;
      }

      .dot.medium {
        background: #f59e0b;
      }

      .dot.low {
        background: #ef4444;
      }

      /* --------- MAP LAYOUT --------- */

      .map-layout {
        display: grid;
        grid-template-columns: minmax(200px, 260px) 1fr;
        gap: 16px;
        align-items: stretch;
      }

      .map-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .lk-map {
        width: 100%;
        max-width: 260px;
        height: auto;
        display: block;
      }

      .map-hint {
        font-size: 12px;
        color: #6b7280;
      }

      :host-context(.dark) .map-hint {
        color: #cbd5e1;
      }

      /* badges under the map */

      .map-badges {
        display: grid;
        grid-template-columns: 1fr;
        gap: 4px;
        width: 100%;
        max-width: 260px;
      }

      .badge {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: #ffffff;
      }

      .badge .name {
        font-weight: 500;
      }

      .badge .value {
        font-weight: 700;
      }

      .badge.ok {
        border-color: rgba(22, 163, 74, 0.35);
        background: rgba(187, 247, 208, 0.45);
      }

      .badge.medium {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(254, 243, 199, 0.45);
      }

      .badge.low {
        border-color: rgba(239, 68, 68, 0.35);
        background: rgba(254, 226, 226, 0.45);
      }

      :host-context(.dark) .badge {
        background: rgba(15, 23, 42, 0.85);
        border-color: rgba(255, 255, 255, 0.08);
      }

      :host-context(.dark) .badge.ok {
        background: rgba(22, 163, 74, 0.25);
      }

      :host-context(.dark) .badge.medium {
        background: rgba(234, 179, 8, 0.25);
      }

      :host-context(.dark) .badge.low {
        background: rgba(248, 113, 113, 0.25);
      }

      /* --------- PROVINCE CHIPS --------- */

      .province-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }

      .province-chip {
        text-align: left;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: rgba(248, 250, 252, 0.85);
        color: #0f172a;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      :host-context(.dark) .province-chip {
        background: rgba(15, 23, 42, 0.65);
        color: #e2e8f0;
        border-color: rgba(255, 255, 255, 0.05);
      }

      .province-chip .production {
        font-weight: 700;
      }

      .province-chip.ok {
        border-color: rgba(22, 163, 74, 0.4);
      }

      .province-chip.medium {
        border-color: rgba(245, 158, 11, 0.4);
      }

      .province-chip.low {
        border-color: rgba(239, 68, 68, 0.4);
      }

      .province-chip.active {
        box-shadow: 0 10px 24px rgba(16, 185, 129, 0.2);
        transform: translateY(-1px);
      }

      .details-card .pill {
        background: rgba(16, 185, 129, 0.14);
        color: #0f9d58;
        padding: 8px 12px;
        border-radius: 999px;
        font-weight: 700;
      }

      :host-context(.dark) .details-card .pill {
        color: #bbf7d0;
      }

      .table {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        overflow: hidden;
      }

      :host-context(.dark) .table {
        border-color: rgba(255, 255, 255, 0.06);
      }

      .table-head,
      .table-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 10px;
        padding: 12px 14px;
        align-items: center;
      }

      .table-head {
        background: rgba(15, 23, 42, 0.04);
        font-weight: 700;
      }

      :host-context(.dark) .table-head {
        background: rgba(255, 255, 255, 0.04);
      }

      .table-row:nth-child(odd) {
        background: rgba(15, 23, 42, 0.02);
      }

      :host-context(.dark) .table-row:nth-child(odd) {
        background: rgba(255, 255, 255, 0.02);
      }

      .cell-label {
        font-weight: 700;
      }

      .right {
        text-align: right;
      }

      .change {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 700;
      }

      .change .material-symbols-outlined {
        font-size: 18px;
      }

      .change.up {
        color: #0f9d58;
      }

      .change.down {
        color: #ef4444;
      }

      .microcopy {
        margin: 10px 0 0;
        color: #6b7280;
        font-size: 13px;
      }

      :host-context(.dark) .microcopy {
        color: #cbd5e1;
      }

      .controls {
        flex-wrap: wrap;
      }

      .segmented {
        display: inline-flex;
        background: rgba(15, 23, 42, 0.04);
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        overflow: hidden;
      }

      :host-context(.dark) .segmented {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .segmented button {
        padding: 8px 12px;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-weight: 600;
      }

      .segmented button.active {
        background: rgba(16, 185, 129, 0.14);
        color: #0f9d58;
      }

      :host-context(.dark) .segmented button.active {
        color: #bbf7d0;
      }

      .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 12px;
      }

      .bar-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .bar-row .label {
        display: flex;
        justify-content: space-between;
        color: #475569;
        font-weight: 600;
      }

      :host-context(.dark) .bar-row .label {
        color: #cbd5e1;
      }

      .bar-track {
        display: grid;
        grid-template-columns: 1fr;
        background: rgba(15, 23, 42, 0.05);
        border-radius: 12px;
        overflow: hidden;
        position: relative;
      }

      :host-context(.dark) .bar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .bar {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #fff;
        padding: 10px 12px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: width 0.2s ease;
      }

      .gap {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(239, 68, 68, 0.14);
        color: #b91c1c;
        display: grid;
        place-items: center;
        font-weight: 700;
        padding-right: 10px;
      }

      :host-context(.dark) .gap {
        color: #fecdd3;
      }

      .target-card .card-header {
        align-items: center;
      }

      .target-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 14px;
      }

      .target-item {
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: rgba(248, 250, 252, 0.6);
      }

      :host-context(.dark) .target-item {
        background: rgba(15, 23, 42, 0.55);
        border-color: rgba(255, 255, 255, 0.06);
      }

      .target-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .pill.subtle {
        background: rgba(15, 23, 42, 0.06);
        color: #475569;
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 700;
      }

      :host-context(.dark) .pill.subtle {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
      }

      .target-bars {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .target-bar {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: center;
      }

      .track {
        height: 10px;
        background: rgba(15, 23, 42, 0.06);
        border-radius: 999px;
        overflow: hidden;
      }

      :host-context(.dark) .track {
        background: rgba(255, 255, 255, 0.08);
      }

      .fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.2s ease;
      }

      .fill.target {
        background: linear-gradient(135deg, #a5b4fc, #6366f1);
      }

      .fill.actual {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }

      .target-bar .value {
        font-weight: 700;
      }

      @media (max-width: 960px) {
        .page-header {
          flex-direction: column;
        }

        .grid.two-col {
          grid-template-columns: 1fr;
        }

        .card-header {
          flex-direction: column;
        }

        .controls {
          align-items: flex-start;
        }

        .map-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FoodManufacturingComponent {
  readonly kpis = [
    {
      label: 'Total production this month',
      value: '162,480 t',
      hint: 'All Sri Lanka - Oct 2025',
      change: '+6.2%',
    },
    {
      label: 'Top producing province',
      value: 'Western',
      hint: '32,400 t - +4.1%',
      change: '+',
    },
    {
      label: 'Provinces below target',
      value: '3',
      hint: 'Central, Uva, Northern',
      change: '-',
    },
    {
      label: 'Avg target achievement',
      value: '93%',
      hint: 'Stretch goal: 98%',
      change: '+2.3pts',
    },
  ];

  readonly provinces = [
    { name: 'Western', status: 'ok', production: 32400 },
    { name: 'Central', status: 'medium', production: 18800 },
    { name: 'Southern', status: 'ok', production: 27600 },
    { name: 'Northern', status: 'low', production: 14200 },
    { name: 'Eastern', status: 'medium', production: 20500 },
    { name: 'North Western', status: 'ok', production: 23100 },
    { name: 'North Central', status: 'ok', production: 21900 },
    { name: 'Uva', status: 'low', production: 13800 },
    { name: 'Sabaragamuwa', status: 'ok', production: 21400 },
  ];

  readonly provinceBreakdowns = [
    {
      name: 'Western',
      sentiment: 'Production improving',
      changeText: '+4.1% vs last month',
      breakdown: [
        { type: 'Rice', current: 12800, last: 12000 },
        { type: 'Vegetables', current: 7600, last: 7120 },
        { type: 'Milk', current: 5400, last: 5200 },
        { type: 'Child food', current: 3600, last: 3400 },
      ],
    },
    {
      name: 'Central',
      sentiment: 'Production dropping',
      changeText: '-3.2% vs last month',
      breakdown: [
        { type: 'Rice', current: 8200, last: 8700 },
        { type: 'Vegetables', current: 5100, last: 5400 },
        { type: 'Milk', current: 3600, last: 3800 },
        { type: 'Child food', current: 1900, last: 1950 },
      ],
    },
    {
      name: 'Northern',
      sentiment: 'Production dropping',
      changeText: '-5.8% vs last month',
      breakdown: [
        { type: 'Rice', current: 5200, last: 5600 },
        { type: 'Vegetables', current: 4100, last: 4400 },
        { type: 'Milk', current: 2600, last: 2800 },
        { type: 'Child food', current: 2300, last: 2400 },
      ],
    },
    {
      name: 'Uva',
      sentiment: 'Production improving',
      changeText: '+2.1% vs last month',
      breakdown: [
        { type: 'Rice', current: 5200, last: 5100 },
        { type: 'Vegetables', current: 4100, last: 4050 },
        { type: 'Milk', current: 2700, last: 2680 },
        { type: 'Child food', current: 1800, last: 1740 },
      ],
    },
  ];

  readonly foodTypes = ['Rice', 'Vegetables', 'Milk', 'Child food'];
  readonly months = ['Aug', 'Sep', 'Oct'];
  selectedFoodType = this.foodTypes[0];
  selectedMonth = 'Oct';
  selectedProvinceName = this.provinceBreakdowns[0].name;

  readonly provinceComparisons: Record<
    string,
    { province: string; value: number; target: number }[]
  > = {
    Rice: [
      { province: 'Western', value: 128, target: 130 },
      { province: 'Central', value: 82, target: 90 },
      { province: 'Southern', value: 114, target: 112 },
      { province: 'Northern', value: 52, target: 70 },
      { province: 'Eastern', value: 98, target: 102 },
      { province: 'North Western', value: 105, target: 110 },
      { province: 'North Central', value: 101, target: 104 },
      { province: 'Uva', value: 52, target: 60 },
      { province: 'Sabaragamuwa', value: 96, target: 98 },
    ],
    Vegetables: [
      { province: 'Western', value: 76, target: 78 },
      { province: 'Central', value: 51, target: 54 },
      { province: 'Southern', value: 64, target: 62 },
      { province: 'Northern', value: 41, target: 48 },
      { province: 'Eastern', value: 55, target: 58 },
      { province: 'North Western', value: 60, target: 62 },
      { province: 'North Central', value: 57, target: 59 },
      { province: 'Uva', value: 41, target: 44 },
      { province: 'Sabaragamuwa', value: 52, target: 56 },
    ],
    Milk: [
      { province: 'Western', value: 54, target: 56 },
      { province: 'Central', value: 36, target: 40 },
      { province: 'Southern', value: 48, target: 50 },
      { province: 'Northern', value: 26, target: 32 },
      { province: 'Eastern', value: 33, target: 36 },
      { province: 'North Western', value: 38, target: 40 },
      { province: 'North Central', value: 36, target: 38 },
      { province: 'Uva', value: 27, target: 30 },
      { province: 'Sabaragamuwa', value: 34, target: 36 },
    ],
    'Child food': [
      { province: 'Western', value: 36, target: 38 },
      { province: 'Central', value: 19, target: 22 },
      { province: 'Southern', value: 28, target: 30 },
      { province: 'Northern', value: 23, target: 26 },
      { province: 'Eastern', value: 25, target: 28 },
      { province: 'North Western', value: 28, target: 30 },
      { province: 'North Central', value: 26, target: 28 },
      { province: 'Uva', value: 18, target: 20 },
      { province: 'Sabaragamuwa', value: 25, target: 27 },
    ],
  };

  readonly targetVsActual = [
    { label: 'Rice', target: 130, actual: 124 },
    { label: 'Vegetables', target: 78, actual: 74 },
    { label: 'Milk', target: 56, actual: 52 },
    { label: 'Child food', target: 38, actual: 34 },
  ];

  get selectedProvince() {
    return (
      this.provinceBreakdowns.find((p) => p.name === this.selectedProvinceName) ??
      this.provinceBreakdowns[0]
    );
  }

  selectProvince(name: string): void {
    this.selectedProvinceName = name;
  }

  setFoodType(type: string): void {
    this.selectedFoodType = type;
  }

  setMonth(month: string): void {
    this.selectedMonth = month;
  }

  barWidth(value: number): string {
    const width = Math.min(100, (value / 140) * 100);
    return `${width}%`;
  }

  gapWidth(item: { value: number; target: number }): string {
    const diff = Math.max(0, item.target - item.value);
    const width = Math.min(100, (diff / 140) * 100);
    return `${width}%`;
  }

  targetGap(item: { target: number; actual: number }): number {
    return item.target - item.actual;
  }
}
