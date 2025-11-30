import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-weather-loss',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <section class="page">
      <mat-card class="page-card">
        <div class="page-header">
          <div>
            <p class="eyebrow">Admin Data Entry</p>
            <h1>Weather-Related Food Loss</h1>
            <p class="lede">Track provincial loss % and reasons to inform impact charts and maps.</p>
          </div>
          <button mat-raised-button color="primary">Add new record</button>
        </div>
        <div class="placeholder">
          Form coming next: year, month, province, weather loss percent, reason, national summary.
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

      .primary {
        background: linear-gradient(135deg, #10b981, #0f9d58);
        color: #fff;
        border: none;
        padding: 12px 16px;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(15, 157, 88, 0.22);
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
export class WeatherLossComponent {}
