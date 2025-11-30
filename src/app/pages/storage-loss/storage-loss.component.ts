import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  AddStorageRecordDialogComponent,
  NewStorageLossRecord,
  StorageIssue,
  StorageType,
} from './add-storage-record-dialog.component';

interface ProvinceLossRow {
  province: string;
  storageType: StorageType;
  lossPercent: number;
}

interface TransportLossBar {
  label: string;
  lossPercent: number;
}

interface ReasonSlice {
  reason: StorageIssue;
  percent: number;
}

interface AlertItem {
  text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Component({
  selector: 'app-storage-loss',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, AddStorageRecordDialogComponent],
  template: `
    <section class="page">
      <app-add-storage-record-dialog
        *ngIf="showAddDialog"
        (close)="closeAddDialog()"
        (save)="handleRecordSave($event)"
      ></app-add-storage-record-dialog>

      <div class="page-header">
        <div>
          <p class="eyebrow">7.4 Storage & supply</p>
          <h1>Post-production food loss</h1>
          <p class="lede">
            Gauge storage and transport losses, top reasons, and province-level gaps.
          </p>
        </div>
        <div class="header-actions">
          <button class="ghost-btn">Export snapshot</button>
          <button mat-raised-button color="primary" (click)="openAddDialog()">Add new record</button>
        </div>
      </div>

      <div class="grid two-col">
        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Gauge</p>
              <h2>Overall wasted after production</h2>
            </div>
          </div>
          <div class="gauge">
            <div class="gauge-outer">
              <div class="gauge-fill" [style.width]="overallLoss + '%'"></div>
            </div>
            <div class="gauge-value">{{ overallLoss }}%</div>
            <p class="hint">Storage + transport combined</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Pie</p>
              <h2>Reasons for loss</h2>
            </div>
          </div>
          <div class="pie">
            <div class="slice" *ngFor="let slice of reasonSlices">
              <span class="dot" [ngStyle]="{ background: sliceColor(slice.reason) }"></span>
              <span class="label">{{ slice.reason }}</span>
              <span class="value">{{ slice.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Table</p>
            <h2>Province storage loss</h2>
          </div>
        </div>
        <div class="table">
          <div class="table-head">
            <span>Province</span>
            <span>Storage type</span>
            <span class="right">Loss %</span>
          </div>
          <div class="table-row" *ngFor="let row of provinceLoss">
            <span>{{ row.province }}</span>
            <span>{{ row.storageType }}</span>
            <span class="right">{{ row.lossPercent }}%</span>
          </div>
        </div>
      </div>

      <div class="grid two-col">
        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Transport</p>
              <h2>Transport loss by segment</h2>
            </div>
          </div>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let bar of transportLoss">
              <div class="label">
                <span>{{ bar.label }}</span>
                <span class="value">{{ bar.lossPercent }}%</span>
              </div>
              <div class="bar-track">
                <div class="bar" [style.width]="barWidth(bar.lossPercent)"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Alerts</p>
              <h2>Recent storage alerts</h2>
            </div>
          </div>
          <div class="alert-list">
            <div class="alert" *ngFor="let alert of alerts">
              <span class="pill" [ngClass]="alert.severity">{{ alert.severity }}</span>
              <span class="text">{{ alert.text }}</span>
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
        gap: 18px;
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
        padding: 16px 18px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
      }

      :host-context(.dark) .card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.04);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      }

      .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .grid.two-col {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
      }

      .gauge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .gauge-outer {
        width: 100%;
        height: 18px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.06);
        overflow: hidden;
      }

      :host-context(.dark) .gauge-outer {
        background: rgba(255, 255, 255, 0.08);
      }

      .gauge-fill {
        height: 100%;
        background: linear-gradient(135deg, #22c55e, #ef4444);
      }

      .gauge-value {
        font-size: 22px;
        font-weight: 800;
      }

      .hint {
        color: #475569;
        font-size: 13px;
      }

      :host-context(.dark) .hint {
        color: #cbd5e1;
      }

      .pie {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .slice {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 8px 10px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
      }

      :host-context(.dark) .slice {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }

      .table {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        overflow: hidden;
      }

      :host-context(.dark) .table {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .table-head,
      .table-row {
        display: grid;
        grid-template-columns: 1.2fr 1fr 0.6fr;
        padding: 10px 12px;
        align-items: center;
        gap: 6px;
      }

      .table-head {
        font-weight: 700;
        background: rgba(15, 23, 42, 0.05);
      }

      :host-context(.dark) .table-head {
        background: rgba(255, 255, 255, 0.06);
      }

      .table-row:nth-child(odd) {
        background: rgba(15, 23, 42, 0.02);
      }

      :host-context(.dark) .table-row:nth-child(odd) {
        background: rgba(255, 255, 255, 0.02);
      }

      .right {
        justify-self: flex-end;
        font-weight: 700;
      }

      .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .bar-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .label {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .bar-track {
        height: 14px;
        background: rgba(15, 23, 42, 0.06);
        border-radius: 10px;
        overflow: hidden;
      }

      :host-context(.dark) .bar-track {
        background: rgba(255, 255, 255, 0.08);
      }

      .bar {
        height: 100%;
        background: linear-gradient(135deg, #f97316, #ef4444);
      }

      .alert-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .alert {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        background: rgba(248, 250, 252, 0.7);
      }

      :host-context(.dark) .alert {
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba(255, 255, 255, 0.05);
      }

      .alert .text {
        color: #0f172a;
      }

      :host-context(.dark) .alert .text {
        color: #e2e8f0;
      }

      .pill {
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
        text-align: center;
      }

      .pill.HIGH {
        background: rgba(239, 68, 68, 0.18);
        color: #b91c1c;
      }

      .pill.MEDIUM {
        background: rgba(245, 158, 11, 0.18);
        color: #b45309;
      }

      .pill.LOW {
        background: rgba(22, 163, 74, 0.18);
        color: #0f9d58;
      }

      @media (max-width: 960px) {
        .page-header {
          flex-direction: column;
        }

        .grid.two-col {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StorageLossComponent {
  showAddDialog = false;
  overallLoss = 14;

  readonly provinceLoss: ProvinceLossRow[] = [
    { province: 'Southern', storageType: 'Cold room', lossPercent: 12 },
    { province: 'Western', storageType: 'Normal store', lossPercent: 9 },
    { province: 'Central', storageType: 'Outdoor', lossPercent: 15 },
    { province: 'Northern', storageType: 'Normal store', lossPercent: 11 },
  ];

  readonly transportLoss: TransportLossBar[] = [
    { label: 'Farm to storage', lossPercent: 6 },
    { label: 'Storage to market', lossPercent: 5 },
    { label: 'Market to retail', lossPercent: 3 },
  ];

  readonly reasonSlices: ReasonSlice[] = [
    { reason: 'Spoilage', percent: 35 },
    { reason: 'Heat', percent: 25 },
    { reason: 'Poor packing', percent: 20 },
    { reason: 'Expired', percent: 20 },
  ];

  readonly alerts: AlertItem[] = [
    { text: 'Milk spoilage high due to lack of cold storage in Southern Province.', severity: 'HIGH' },
    { text: 'Heat damage reported in outdoor storage (Central).', severity: 'MEDIUM' },
    { text: 'Poor packing causing losses in Northern transport leg.', severity: 'MEDIUM' },
  ];

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
  }

  handleRecordSave(record: NewStorageLossRecord): void {
    // Integrate with backend/store as needed.
    console.log('Storage loss record submitted', record);
    this.showAddDialog = false;
  }

  barWidth(percent: number): string {
    const width = Math.min(100, percent);
    return `${width}%`;
  }

  sliceColor(reason: StorageIssue): string {
    switch (reason) {
      case 'Spoilage':
        return '#ef4444';
      case 'Heat':
        return '#f97316';
      case 'Poor packing':
        return '#f59e0b';
      case 'Expired':
        return '#16a34a';
      default:
        return '#0ea5e9';
    }
  }
}
