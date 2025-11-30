import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

type AgeGroup = 'Age 1–5' | 'Age 6–12' | 'Age 13–18' | 'Age 18–60';
type NutritionStatus = 'good' | 'medium' | 'low';

interface AgeGroupCard {
  label: AgeGroup;
  status: NutritionStatus;
  issue: string;
  score: number;
  trend: string;
}

interface ConsumptionMix {
  ageGroup: AgeGroup;
  rice: number;
  vegetables: number;
  milk: number;
  others: number;
}

interface HeatmapRow {
  province: string;
  levels: Record<AgeGroup, NutritionStatus>;
}

interface RiskRow {
  province: string;
  ageGroup: AgeGroup;
  risk: NutritionStatus;
  cause: string;
}

@Component({
  selector: 'app-human-capital',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Human capital / child nutrition</h1>
          <p class="lede">
            Track nutrition and food consumption across age groups and provinces to spot risks early.
          </p>
        </div>
        <div class="header-actions">
          <button class="ghost-btn">Export snapshot</button>
          <button mat-raised-button color="primary">Add new record</button>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="card kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <p class="kpi-label">{{ kpi.label }}</p>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="pill" [ngClass]="kpi.status">{{ kpi.statusLabel }}</span>
          </div>
          <p class="kpi-hint">{{ kpi.hint }}</p>
        </div>
      </div>

      <div class="grid two-col">
        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Age groups</p>
              <h2>Status by age</h2>
            </div>
          </div>
          <div class="age-grid">
            <div class="age-card" *ngFor="let group of ageGroupCards">
              <div class="age-head">
                <span class="age-label">{{ group.label }}</span>
                <span class="status" [ngClass]="group.status">
                  {{ group.status | titlecase }}
                </span>
              </div>
              <p class="issue">{{ group.issue }}</p>
              <div class="score-row">
                <span class="score">{{ group.score }}</span>
                <span class="trend">{{ group.trend }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Consumption</p>
              <h2>Age group consumption mix</h2>
            </div>
          </div>
          <div class="stacked-chart">
            <div class="stacked-row" *ngFor="let mix of consumption">
              <div class="row-head">
                <span class="label">{{ mix.ageGroup }}</span>
                <span class="score">{{ total(mix) }} kcal eq.</span>
              </div>
              <div class="stacked-bar">
                <div class="segment rice" [style.width]="segmentWidth(mix.rice, mix)"></div>
                <div class="segment vegetables" [style.width]="segmentWidth(mix.vegetables, mix)"></div>
                <div class="segment milk" [style.width]="segmentWidth(mix.milk, mix)"></div>
                <div class="segment others" [style.width]="segmentWidth(mix.others, mix)"></div>
              </div>
              <div class="legend-row">
                <span><span class="dot rice"></span>Rice {{ mix.rice }}%</span>
                <span><span class="dot vegetables"></span>Veg {{ mix.vegetables }}%</span>
                <span><span class="dot milk"></span>Milk {{ mix.milk }}%</span>
                <span><span class="dot others"></span>Others {{ mix.others }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Heatmap</p>
            <h2>Province vs age group nutrition</h2>
          </div>
        </div>
        <div class="heatmap">
          <div class="heatmap-header">
            <span class="corner">Province</span>
            <span class="age-col" *ngFor="let age of ageGroups">{{ age }}</span>
          </div>
          <div class="heatmap-row" *ngFor="let row of heatmap">
            <span class="province">{{ row.province }}</span>
            <span
              class="cell"
              *ngFor="let age of ageGroups"
              [ngClass]="row.levels[age]"
            >
              {{ row.levels[age] | titlecase }}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">At-risk list</p>
            <h2>Children at risk by province</h2>
          </div>
        </div>
        <div class="risk-table">
          <div class="table-head">
            <span>Province</span>
            <span>Age group</span>
            <span>Risk</span>
            <span>Main cause</span>
          </div>
          <div class="table-row" *ngFor="let risk of riskList">
            <span>{{ risk.province }}</span>
            <span>{{ risk.ageGroup }}</span>
            <span class="pill" [ngClass]="risk.risk">{{ risk.risk | titlecase }}</span>
            <span>{{ risk.cause }}</span>
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
        max-width: 620px;
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

      .kpi-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
      }

      :host-context(.dark) .kpi-value {
        color: #f8fafc;
      }

      .kpi-hint {
        margin: 4px 0 0;
        color: #475569;
      }

      :host-context(.dark) .kpi-hint {
        color: #cbd5e1;
      }

      .pill {
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
        background: rgba(15, 23, 42, 0.06);
        color: #0f172a;
      }

      .pill.good {
        background: rgba(22, 163, 74, 0.16);
        color: #0f9d58;
      }

      .pill.medium {
        background: rgba(245, 158, 11, 0.18);
        color: #b45309;
      }

      .pill.low {
        background: rgba(239, 68, 68, 0.18);
        color: #b91c1c;
      }

      .grid.two-col {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
      }

      .age-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
      }

      .age-card {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        padding: 12px 14px;
        background: rgba(248, 250, 252, 0.7);
      }

      :host-context(.dark) .age-card {
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba(255, 255, 255, 0.05);
      }

      .age-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .age-label {
        font-weight: 700;
      }

      .status {
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        text-transform: capitalize;
      }

      .status.good {
        background: rgba(16, 185, 129, 0.16);
        color: #0f9d58;
      }

      .status.medium {
        background: rgba(245, 158, 11, 0.16);
        color: #b45309;
      }

      .status.low {
        background: rgba(239, 68, 68, 0.16);
        color: #b91c1c;
      }

      .issue {
        margin: 6px 0 8px;
        color: #475569;
      }

      :host-context(.dark) .issue {
        color: #cbd5e1;
      }

      .score-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
      }

      .score {
        font-size: 18px;
      }

      .trend {
        font-size: 13px;
        color: #0f9d58;
      }

      .stacked-chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .stacked-row {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        padding: 10px 12px;
      }

      :host-context(.dark) .stacked-row {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .row-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .stacked-bar {
        display: flex;
        height: 18px;
        border-radius: 12px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.06);
      }

      :host-context(.dark) .stacked-bar {
        background: rgba(255, 255, 255, 0.08);
      }

      .segment {
        height: 100%;
      }

      .segment.rice {
        background: #16a34a;
      }

      .segment.vegetables {
        background: #22c55e;
      }

      .segment.milk {
        background: #60a5fa;
      }

      .segment.others {
        background: #f59e0b;
      }

      .legend-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-top: 6px;
        font-size: 12px;
        color: #475569;
        gap: 6px;
      }

      :host-context(.dark) .legend-row {
        color: #cbd5e1;
      }

      .dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 6px;
      }

      .dot.rice {
        background: #16a34a;
      }

      .dot.vegetables {
        background: #22c55e;
      }

      .dot.milk {
        background: #60a5fa;
      }

      .dot.others {
        background: #f59e0b;
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
        grid-template-columns: 1.1fr repeat(4, 1fr);
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

      .cell.good {
        background: rgba(22, 163, 74, 0.18);
        color: #0f9d58;
      }

      .cell.medium {
        background: rgba(245, 158, 11, 0.18);
        color: #b45309;
      }

      .cell.low {
        background: rgba(239, 68, 68, 0.18);
        color: #b91c1c;
      }

      .province {
        font-weight: 700;
      }

      .risk-table {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        overflow: hidden;
      }

      :host-context(.dark) .risk-table {
        border-color: rgba(255, 255, 255, 0.05);
      }

      .table-head,
      .table-row {
        display: grid;
        grid-template-columns: 1.2fr 1fr 0.8fr 1.4fr;
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

      @media (max-width: 960px) {
        .page-header {
          flex-direction: column;
        }

        .grid.two-col {
          grid-template-columns: 1fr;
        }

        .legend-row {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .heatmap-header,
        .heatmap-row,
        .table-head,
        .table-row {
          grid-template-columns: 1fr;
          grid-auto-rows: auto;
        }

        .heatmap-header span,
        .heatmap-row span,
        .table-head span,
        .table-row span {
          justify-self: flex-start;
        }
      }
    `,
  ],
})
export class HumanCapitalComponent {
  readonly kpis = [
    {
      label: 'Average nutrition score (all children)',
      value: '82',
      status: 'good' as NutritionStatus,
      statusLabel: 'Good',
      hint: 'Across all provinces',
    },
    {
      label: 'Age groups at high risk',
      value: '2',
      status: 'medium' as NutritionStatus,
      statusLabel: 'Watch',
      hint: '6–12 and 13–18 need attention',
    },
    {
      label: 'Province with best child nutrition',
      value: 'Western',
      status: 'good' as NutritionStatus,
      statusLabel: 'Leader',
      hint: 'Score 88 / improving',
    },
    {
      label: 'Province with worst nutrition',
      value: 'Northern',
      status: 'low' as NutritionStatus,
      statusLabel: 'High risk',
      hint: 'Score 66 / milk intake low',
    },
  ];

  readonly ageGroups: AgeGroup[] = ['Age 1–5', 'Age 6–12', 'Age 13–18', 'Age 18–60'];

  readonly ageGroupCards: AgeGroupCard[] = [
    {
      label: 'Age 1–5',
      status: 'good',
      issue: 'Balanced intake; monitor iron',
      score: 86,
      trend: '+2.1 pts vs last month',
    },
    {
      label: 'Age 6–12',
      status: 'medium',
      issue: 'Milk intake low in Northern province',
      score: 74,
      trend: '-1.4 pts vs last month',
    },
    {
      label: 'Age 13–18',
      status: 'low',
      issue: 'Vegetable intake low; calories under target',
      score: 68,
      trend: '-3.2 pts vs last month',
    },
    {
      label: 'Age 18–60',
      status: 'medium',
      issue: 'Protein intake modest; sugar slightly high',
      score: 72,
      trend: '-0.8 pts vs last month',
    },
  ];

  readonly consumption: ConsumptionMix[] = [
    { ageGroup: 'Age 1–5', rice: 32, vegetables: 28, milk: 30, others: 10 },
    { ageGroup: 'Age 6–12', rice: 38, vegetables: 24, milk: 26, others: 12 },
    { ageGroup: 'Age 13–18', rice: 42, vegetables: 22, milk: 20, others: 16 },
    { ageGroup: 'Age 18–60', rice: 40, vegetables: 26, milk: 18, others: 16 },
  ];

  readonly heatmap: HeatmapRow[] = [
    {
      province: 'Western',
      levels: {
        'Age 1–5': 'good',
        'Age 6–12': 'good',
        'Age 13–18': 'medium',
        'Age 18–60': 'good',
      },
    },
    {
      province: 'Central',
      levels: {
        'Age 1–5': 'medium',
        'Age 6–12': 'medium',
        'Age 13–18': 'low',
        'Age 18–60': 'medium',
      },
    },
    {
      province: 'Southern',
      levels: {
        'Age 1–5': 'good',
        'Age 6–12': 'medium',
        'Age 13–18': 'medium',
        'Age 18–60': 'good',
      },
    },
    {
      province: 'Northern',
      levels: {
        'Age 1–5': 'medium',
        'Age 6–12': 'low',
        'Age 13–18': 'low',
        'Age 18–60': 'medium',
      },
    },
    {
      province: 'Eastern',
      levels: {
        'Age 1–5': 'medium',
        'Age 6–12': 'medium',
        'Age 13–18': 'medium',
        'Age 18–60': 'medium',
      },
    },
  ];

  readonly riskList: RiskRow[] = [
    { province: 'Northern', ageGroup: 'Age 6–12', risk: 'low', cause: 'Milk intake low' },
    { province: 'Northern', ageGroup: 'Age 13–18', risk: 'low', cause: 'Calorie gap vs target' },
    { province: 'Central', ageGroup: 'Age 13–18', risk: 'medium', cause: 'Vegetables below target' },
    { province: 'Eastern', ageGroup: 'Age 6–12', risk: 'medium', cause: 'Protein shortfall' },
    { province: 'Central', ageGroup: 'Age 18–60', risk: 'medium', cause: 'High sugar, low protein' },
  ];

  segmentWidth(value: number, mix: ConsumptionMix): string {
    const total = this.total(mix);
    const width = total === 0 ? 0 : (value / total) * 100;
    return `${width}%`;
  }

  total(mix: ConsumptionMix): number {
    return mix.rice + mix.vegetables + mix.milk + mix.others;
  }
}
