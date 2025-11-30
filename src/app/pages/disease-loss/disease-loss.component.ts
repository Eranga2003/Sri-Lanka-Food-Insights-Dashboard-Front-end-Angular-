import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  AddDiseaseRecordDialogComponent,
  DiseaseSeverity,
  NewDiseaseLossRecord,
} from './add-disease-record-dialog.component';

interface HeatmapRow {
  province: string;
  severity: Record<string, DiseaseSeverity>;
}

interface TrendPoint {
  month: string;
  cases: number;
}

interface AlertItem {
  text: string;
  severity: DiseaseSeverity;
}

@Component({
  selector: 'app-disease-loss',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, AddDiseaseRecordDialogComponent],
  template: `
    <section class="page">
      <app-add-disease-record-dialog
        *ngIf="showAddDialog"
        (close)="closeAddDialog()"
        (save)="handleRecordSave($event)"
      ></app-add-disease-record-dialog>

      <div class="page-header">
        <div>
          <p class="eyebrow">7.3 Disease / Fungal</p>
          <h1>Why food is lost to disease</h1>
          <p class="lede">
            Heatmaps, trend lines, and alerts show where fungal and livestock diseases are hurting output.
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
              <p class="eyebrow">Heatmap</p>
              <h2>Province vs disease severity</h2>
            </div>
          </div>
          <div class="heatmap">
            <div class="heatmap-header">
              <span class="corner">Province</span>
              <span class="col" *ngFor="let food of foodTypes">{{ food }}</span>
            </div>
            <div class="heatmap-row" *ngFor="let row of heatmap">
              <span class="province">{{ row.province }}</span>
              <span
                class="cell"
                *ngFor="let food of foodTypes"
                [ngClass]="row.severity[food]"
              >
                {{ row.severity[food] }}
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Trend</p>
              <h2>Disease cases across months</h2>
            </div>
          </div>
          <div class="trend-chart">
            <div class="trend-row" *ngFor="let point of trend">
              <div class="label">
                <span>{{ point.month }}</span>
                <span class="value">{{ point.cases }} cases</span>
              </div>
              <div class="bar-track">
                <div class="bar" [style.width]="barWidth(point.cases)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Alerts</p>
            <h2>Recent disease alerts</h2>
          </div>
        </div>
        <div class="alert-list">
          <div class="alert" *ngFor="let alert of alerts">
            <span class="pill" [ngClass]="alert.severity">{{ alert.severity }}</span>
            <span class="text">{{ alert.text }}</span>
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

      .heatmap {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        overflow: hidden;
      }

      :host-context(.dark) .heatmap {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .heatmap-header,
      .heatmap-row {
        display: grid;
        grid-template-columns: 1.2fr repeat(4, 1fr);
        align-items: center;
      }

      .heatmap-header {
        background: rgba(15, 23, 42, 0.05);
        font-weight: 700;
        padding: 10px 12px;
      }

      :host-context(.dark) .heatmap-header {
        background: rgba(255, 255, 255, 0.06);
      }

      .heatmap-row {
        padding: 8px 12px;
        border-top: 1px solid rgba(15, 23, 42, 0.05);
      }

      :host-context(.dark) .heatmap-row {
        border-color: rgba(255, 255, 255, 0.04);
      }

      .cell {
        text-align: center;
        padding: 8px;
        border-radius: 10px;
        font-weight: 700;
      }

      .cell.HIGH {
        background: rgba(239, 68, 68, 0.18);
        color: #b91c1c;
      }

      .cell.MEDIUM {
        background: rgba(245, 158, 11, 0.18);
        color: #b45309;
      }

      .cell.LOW {
        background: rgba(22, 163, 74, 0.18);
        color: #0f9d58;
      }

      .province {
        font-weight: 700;
      }

      .trend-chart {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .trend-row {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        padding: 10px 12px;
      }

      :host-context(.dark) .trend-row {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
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
        background: linear-gradient(135deg, #38bdf8, #0ea5e9);
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

        .heatmap-header,
        .heatmap-row {
          grid-template-columns: 1fr;
          grid-auto-rows: auto;
        }
      }
    `,
  ],
})
export class DiseaseLossComponent {
  showAddDialog = false;
  readonly foodTypes = ['Rice', 'Vegetables', 'Milk', 'Child Food'];

  readonly heatmap: HeatmapRow[] = [
    {
      province: 'Central',
      severity: { Rice: 'HIGH', Vegetables: 'MEDIUM', Milk: 'LOW', 'Child Food': 'LOW' },
    },
    {
      province: 'Northern',
      severity: { Rice: 'MEDIUM', Vegetables: 'HIGH', Milk: 'LOW', 'Child Food': 'MEDIUM' },
    },
    {
      province: 'Western',
      severity: { Rice: 'LOW', Vegetables: 'LOW', Milk: 'LOW', 'Child Food': 'LOW' },
    },
    {
      province: 'Eastern',
      severity: { Rice: 'MEDIUM', Vegetables: 'MEDIUM', Milk: 'LOW', 'Child Food': 'MEDIUM' },
    },
  ];

  readonly trend: TrendPoint[] = [
    { month: 'January', cases: 42 },
    { month: 'February', cases: 36 },
    { month: 'March', cases: 30 },
    { month: 'April', cases: 24 },
  ];

  readonly alerts: AlertItem[] = [
    { text: 'Fungal infection affecting rice in Central Province.', severity: 'HIGH' },
    { text: 'Leaf blight spotted in Northern vegetables.', severity: 'MEDIUM' },
    { text: 'Rot fungus cases rising in Eastern storage.', severity: 'MEDIUM' },
  ];

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
  }

  handleRecordSave(record: NewDiseaseLossRecord): void {
    // Integrate with backend/store as needed.
    console.log('Disease loss record submitted', record);
    this.showAddDialog = false;
  }

  barWidth(cases: number): string {
    const max = Math.max(...this.trend.map((t) => t.cases), 1);
    return `${(cases / max) * 100}%`;
  }
}
