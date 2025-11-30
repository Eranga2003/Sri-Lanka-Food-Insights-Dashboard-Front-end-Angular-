import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <section class="page">
      <mat-card class="page-card">
        <div class="page-header">
          <div>
            <p class="eyebrow">Overview</p>
            <h1>Dashboard</h1>
            <p class="lede">
              High-level view for production, losses, nutrition, and alerts. Replace with your KPI
              cards and charts.
            </p>
          </div>
          <button mat-raised-button color="primary">Add widget</button>
        </div>
        <div class="placeholder">
          Placeholder dashboard layout. Add KPI cards, trend charts, and map components here.
        </div>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
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
      }

      :host-context(.dark) .page .lede {
        color: #cbd5e1;
      }

      .placeholder {
        border: 1px dashed rgba(15, 167, 104, 0.4);
        border-radius: 14px;
        padding: 20px;
        background: rgba(15, 167, 104, 0.04);
        color: #0f172a;
      }

      :host-context(.dark) .placeholder {
        color: #e2e8f0;
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.25);
      }
    `,
  ],
})
export class DashboardComponent {}
