import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  AddProductionRecordDialogComponent,
  NewProductionRecord,
} from './add-production-record-dialog.component';

type FoodType = 'Rice' | 'Vegetables' | 'Milk' | 'Child food';

interface ProductionRecordDoc extends NewProductionRecord {
  id?: string;
  createdAt?: { toDate?: () => Date } | null;
}

interface ProvinceCard {
  name: string;
  statusClass: 'ok' | 'medium' | 'low';
  production: number;
}

interface ProvinceBreakdown {
  name: string;
  sentiment: string;
  changeText: string;
  breakdown: { type: FoodType; current: number; last: number }[];
}

interface ComparisonItem {
  province: string;
  value: number;
  target: number;
}

interface TargetItem {
  label: FoodType;
  target: number;
  actual: number;
}

interface ViewModel {
  months: string[];
  month: string | null;
  provinceCards: ProvinceCard[];
  provinceBreakdowns: ProvinceBreakdown[];
  comparisons: Record<FoodType, ComparisonItem[]>;
  targetVsActual: TargetItem[];
  totalProduction: number;
  topProvince?: string;
  topProvinceValue?: number;
  belowTargetCount: number;
  avgTargetAchievement: number;
}

@Component({
  selector: 'app-food-manufacturing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    AddProductionRecordDialogComponent,
    AsyncPipe,
    DatePipe,
  ],
  template: `
    <section class="page" *ngIf="vm$ | async as vm">
      <app-add-production-record-dialog
        *ngIf="showAddDialog"
        (close)="closeAddDialog()"
        (save)="handleRecordSave($event)"
      ></app-add-production-record-dialog>
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Live records</p>
            <h2>Firestore: productionRecords</h2>
          </div>
          <span class="pill subtle">{{ vm.provinceCards.length }} record(s)</span>
        </div>
        <div class="table">
          <div class="table-head">
            <span>Month</span>
            <span class="right">Province</span>
            <span class="right">Status</span>
            <span class="right">Updated</span>
          </div>
          <div class="table-row" *ngFor="let record of productionRecords$ | async">
            <span class="cell-label">{{ record.month }}</span>
            <span class="right">{{ record.province }}</span>
            <span class="right">{{ record.provinceProductionStatus }}</span>
            <span class="right">{{ formatCreatedAt(record) | date: 'medium' }}</span>
          </div>
          <p class="microcopy" *ngIf="!(productionRecords$ | async)?.length">
            No records yet. Use "Add new record" to create one.
          </p>
        </div>
      </div>

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
          <button mat-raised-button color="primary" (click)="openAddDialog()">Add new record</button>
        </div>
      </div>

      <div class="card kpi-grid">
        <div class="kpi-card">
          <p class="kpi-label">Total production this month</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ vm.totalProduction | number }} t</span>
          </div>
          <p class="kpi-hint">Across all provinces for {{ vm.month || '—' }}</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-label">Top producing province</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ vm.topProvince || '—' }}</span>
          </div>
          <p class="kpi-hint">
            {{ vm.topProvinceValue ? (vm.topProvinceValue | number) + ' t' : 'Awaiting data' }}
          </p>
        </div>
        <div class="kpi-card">
          <p class="kpi-label">Provinces below target</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ vm.belowTargetCount }}</span>
          </div>
          <p class="kpi-hint">Count of provinces under summed targets</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-label">Avg target achievement</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ vm.avgTargetAchievement | number : '1.0-1' }}%</span>
          </div>
          <p class="kpi-hint">Across all food types</p>
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
                  *ngFor="let province of vm.provinceCards"
                  [ngClass]="province.statusClass"
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
                *ngFor="let province of vm.provinceCards"
                [class.ok]="province.statusClass === 'ok'"
                [class.medium]="province.statusClass === 'medium'"
                [class.low]="province.statusClass === 'low'"
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
              <h2>{{ selectedProvince(vm)?.name || 'Select a province' }}</h2>
              <p class="lede">{{ selectedProvince(vm)?.sentiment || 'Awaiting data' }}</p>
            </div>
            <span class="pill">{{ selectedProvince(vm)?.changeText }}</span>
          </div>
          <div class="table">
            <div class="table-head">
              <span>Food type</span>
              <span class="right">This month</span>
              <span class="right">Last month</span>
              <span class="right">Change</span>
            </div>
            <div class="table-row" *ngFor="let item of selectedProvince(vm)?.breakdown || []">
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
                  item.last
                    ? (((item.current - item.last) / item.last) * 100 | number : '1.0-1')
                    : '—'
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
              *ngFor="let month of vm.months"
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
          <div class="bar-row" *ngFor="let item of vm.comparisons[selectedFoodType] || []">
            <div class="label">
              <span class="name">{{ item.province }}</span>
              <span class="target">Target {{ item.target | number }} t</span>
            </div>
            <div class="bar-track">
              <div class="bar" [style.width]="barWidth(item.value)">
                <span class="value">{{ item.value | number }} t</span>
              </div>
              <div class="gap" [style.width]="gapWidth(item)" *ngIf="item.value < item.target">
                Gap {{ item.target - item.value | number }} t
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
          <div class="target-item" *ngFor="let item of vm.targetVsActual">
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
                <span class="value">{{ item.target | number }} t</span>
              </div>
              <div class="target-bar">
                <span>Actual</span>
                <div class="track">
                  <div class="fill actual" [style.width]="barWidth(item.actual)"></div>
                </div>
                <span class="value">{{ item.actual | number }} t</span>
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
  readonly productionRecords$: Observable<ProductionRecordDoc[]>;
  readonly vm$: Observable<ViewModel>;
  readonly foodTypes: FoodType[] = ['Rice', 'Vegetables', 'Milk', 'Child food'];
  selectedFoodType: FoodType = this.foodTypes[0];
  selectedMonth: string | null = null;
  selectedProvinceName: string | null = null;
  showAddDialog = false;

  private readonly selectedMonth$ = new BehaviorSubject<string | null>(null);

  constructor(private firestore: Firestore) {
    this.productionRecords$ = collectionData(
      collection(this.firestore, 'productionRecords'),
      { idField: 'id' }
    ) as Observable<ProductionRecordDoc[]>;

    this.vm$ = combineLatest([this.productionRecords$, this.selectedMonth$]).pipe(
      map(([records, selectedMonth]) => this.buildViewModel(records, selectedMonth))
    );
  }

  selectProvince(name: string): void {
    this.selectedProvinceName = name;
  }

  setFoodType(type: FoodType): void {
    this.selectedFoodType = type;
  }

  setMonth(month: string): void {
    this.selectedMonth = month;
    this.selectedMonth$.next(month);
  }

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
  }

  handleRecordSave(record: NewProductionRecord): void {
    // TODO: integrate with data store/API; Firestore write handled in dialog
    console.log('New production record submitted', record);
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

  formatCreatedAt(record: ProductionRecordDoc): Date | null {
    return record.createdAt && typeof record.createdAt.toDate === 'function'
      ? record.createdAt.toDate()
      : null;
  }

  selectedProvince(vm: ViewModel): ProvinceBreakdown | undefined {
    const match =
      vm.provinceBreakdowns.find((p) => p.name === this.selectedProvinceName) ||
      vm.provinceBreakdowns[0];
    if (!this.selectedProvinceName && match) {
      this.selectedProvinceName = match.name;
    }
    return match;
  }

  private buildViewModel(
    records: ProductionRecordDoc[],
    selectedMonth: string | null
  ): ViewModel {
    const months = Array.from(new Set(records.map((r) => r.month))).sort(
      (a, b) => this.monthIndex(a) - this.monthIndex(b)
    );
    const month =
      selectedMonth && months.includes(selectedMonth) ? selectedMonth : months.at(-1) ?? null;
    if (!month) {
      return {
        months,
        month: null,
        provinceCards: [],
        provinceBreakdowns: [],
        comparisons: {
          Rice: [],
          Vegetables: [],
          Milk: [],
          'Child food': [],
        },
        targetVsActual: [],
        totalProduction: 0,
        topProvince: undefined,
        topProvinceValue: undefined,
        belowTargetCount: 0,
        avgTargetAchievement: 0,
      };
    }

    const monthRecords = records.filter((r) => r.month === month);

    const provinceCards = monthRecords.map((r) => ({
      name: r.province,
      statusClass: this.statusClass(r.provinceProductionStatus),
      production: this.totalProduction(r),
    }));

    const provinceBreakdowns = monthRecords.map((r) => ({
      name: r.province,
      sentiment: this.sentimentText(r.provinceProductionStatus),
      changeText: this.changeText(r.provinceProductionStatus),
      breakdown: this.buildBreakdown(records, r, month),
    }));

    const comparisons = this.buildComparisons(monthRecords);
    const targetVsActual = this.buildTargets(monthRecords);

    const totalProduction = monthRecords.reduce(
      (sum, r) => sum + this.totalProduction(r),
      0
    );
    const topProvinceEntry = provinceCards.reduce(
      (top, p) => (p.production > (top?.production ?? -1) ? p : top),
      undefined as ProvinceCard | undefined
    );

    const belowTargetCount = monthRecords.filter((r) => this.isBelowTarget(r)).length;
    const avgTargetAchievement = this.avgTargetAchievement(monthRecords);

    if (!this.selectedMonth && month) {
      this.selectedMonth = month;
    }

    return {
      months,
      month,
      provinceCards,
      provinceBreakdowns,
      comparisons,
      targetVsActual,
      totalProduction,
      topProvince: topProvinceEntry?.name,
      topProvinceValue: topProvinceEntry?.production,
      belowTargetCount,
      avgTargetAchievement,
    };
  }

  private buildBreakdown(
    records: ProductionRecordDoc[],
    record: ProductionRecordDoc,
    month: string
  ): { type: FoodType; current: number; last: number }[] {
    const prevMonth = this.previousMonth(records, record.province, month);
    return [
      {
        type: 'Rice',
        current: record.riceProduction ?? 0,
        last: prevMonth?.riceProduction ?? 0,
      },
      {
        type: 'Vegetables',
        current: record.vegetableProduction ?? 0,
        last: prevMonth?.vegetableProduction ?? 0,
      },
      {
        type: 'Milk',
        current: record.milkProduction ?? 0,
        last: prevMonth?.milkProduction ?? 0,
      },
      {
        type: 'Child food',
        current: record.childFoodProduction ?? 0,
        last: prevMonth?.childFoodProduction ?? 0,
      },
    ];
  }

  private buildComparisons(
    monthRecords: ProductionRecordDoc[]
  ): Record<FoodType, ComparisonItem[]> {
    const comparisons: Record<FoodType, ComparisonItem[]> = {
      Rice: [],
      Vegetables: [],
      Milk: [],
      'Child food': [],
    };

    monthRecords.forEach((r) => {
      comparisons.Rice.push({
        province: r.province,
        value: r.riceProduction ?? 0,
        target: r.riceTarget ?? 0,
      });
      comparisons.Vegetables.push({
        province: r.province,
        value: r.vegetableProduction ?? 0,
        target: r.vegetableTarget ?? 0,
      });
      comparisons.Milk.push({
        province: r.province,
        value: r.milkProduction ?? 0,
        target: r.milkTarget ?? 0,
      });
      comparisons['Child food'].push({
        province: r.province,
        value: r.childFoodProduction ?? 0,
        target: r.childFoodTarget ?? 0,
      });
    });

    return comparisons;
  }

  private buildTargets(monthRecords: ProductionRecordDoc[]): TargetItem[] {
    const totals = {
      Rice: { target: 0, actual: 0 },
      Vegetables: { target: 0, actual: 0 },
      Milk: { target: 0, actual: 0 },
      'Child food': { target: 0, actual: 0 },
    };

    monthRecords.forEach((r) => {
      totals.Rice.target += r.riceTarget ?? 0;
      totals.Rice.actual += r.riceProduction ?? 0;
      totals.Vegetables.target += r.vegetableTarget ?? 0;
      totals.Vegetables.actual += r.vegetableProduction ?? 0;
      totals.Milk.target += r.milkTarget ?? 0;
      totals.Milk.actual += r.milkProduction ?? 0;
      totals['Child food'].target += r.childFoodTarget ?? 0;
      totals['Child food'].actual += r.childFoodProduction ?? 0;
    });

    return (Object.keys(totals) as FoodType[]).map((label) => ({
      label,
      target: totals[label].target,
      actual: totals[label].actual,
    }));
  }

  private totalProduction(r: ProductionRecordDoc): number {
    return (
      (r.riceProduction ?? 0) +
      (r.vegetableProduction ?? 0) +
      (r.milkProduction ?? 0) +
      (r.childFoodProduction ?? 0)
    );
  }

  private statusClass(status: string): 'ok' | 'medium' | 'low' {
    switch (status) {
      case 'GOOD':
        return 'ok';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
      default:
        return 'low';
    }
  }

  private sentimentText(status: string): string {
    switch (status) {
      case 'GOOD':
        return 'Production improving';
      case 'MEDIUM':
        return 'Production steady';
      case 'LOW':
      default:
        return 'Production dropping';
    }
  }

  private changeText(status: string): string {
    switch (status) {
      case 'GOOD':
        return 'Trending up';
      case 'MEDIUM':
        return 'Flat vs last month';
      case 'LOW':
      default:
        return 'Trending down';
    }
  }

  private previousMonth(
    records: ProductionRecordDoc[],
    province: string,
    month: string
  ): ProductionRecordDoc | undefined {
    const orderedMonths = Array.from(new Set(records.map((r) => r.month))).sort(
      (a, b) => this.monthIndex(a) - this.monthIndex(b)
    );
    const currentIndex = orderedMonths.indexOf(month);
    if (currentIndex <= 0) {
      return undefined;
    }
    const prevMonth = orderedMonths[currentIndex - 1];
    return records.find((r) => r.province === province && r.month === prevMonth);
  }

  private monthIndex(month: string): number {
    const order = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const idx = order.indexOf(month);
    return idx === -1 ? 99 : idx;
  }

  private isBelowTarget(record: ProductionRecordDoc): boolean {
    const actual = this.totalProduction(record);
    const target =
      (record.riceTarget ?? 0) +
      (record.vegetableTarget ?? 0) +
      (record.milkTarget ?? 0) +
      (record.childFoodTarget ?? 0);
    return target > 0 && actual < target;
  }

  private avgTargetAchievement(records: ProductionRecordDoc[]): number {
    const ratios: number[] = [];
    records.forEach((r) => {
      const actual = this.totalProduction(r);
      const target =
        (r.riceTarget ?? 0) +
        (r.vegetableTarget ?? 0) +
        (r.milkTarget ?? 0) +
        (r.childFoodTarget ?? 0);
      if (target > 0) {
        ratios.push(actual / target);
      }
    });
    if (!ratios.length) {
      return 0;
    }
    return (ratios.reduce((sum, r) => sum + r, 0) / ratios.length) * 100;
  }
}
