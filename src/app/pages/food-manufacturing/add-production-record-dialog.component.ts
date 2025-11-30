import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

export type ProvinceHealth = 'GOOD' | 'MEDIUM' | 'LOW';

export interface NewProductionRecord {
  month: string;
  province: string;
  riceProduction: number | null;
  vegetableProduction: number | null;
  milkProduction: number | null;
  childFoodProduction: number | null;
  riceTarget: number | null;
  vegetableTarget: number | null;
  milkTarget: number | null;
  childFoodTarget: number | null;
  provinceProductionStatus: ProvinceHealth;
}

@Component({
  selector: 'app-add-production-record-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-shell" (click)="onClose()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div>
            <p class="eyebrow">Add new record</p>
            <h3>Province production entry</h3>
          </div>
          <button type="button" class="icon-btn" (click)="onClose()">×</button>
        </div>

        <form #recordForm="ngForm" (ngSubmit)="onSubmit(recordForm)" novalidate>
          <section class="section">
            <h4>A. Basic Information</h4>
            <div class="field-row">
              <label for="month">Month</label>
              <select
                id="month"
                name="month"
                required
                [(ngModel)]="form.month"
              >
                <option value="" disabled>Select month</option>
                <option *ngFor="let m of monthOptions" [value]="m">{{ m }}</option>
              </select>
            </div>
            <div class="field-row">
              <label for="province">Province</label>
              <select
                id="province"
                name="province"
                required
                [(ngModel)]="form.province"
              >
                <option value="" disabled>Select province</option>
                <option *ngFor="let p of provinceOptions" [value]="p">{{ p }}</option>
              </select>
            </div>
          </section>

          <section class="section">
            <h4>B. Food Production Values</h4>
            <div class="field-grid">
              <label>
                <span>Rice production (t)</span>
                <input
                  type="number"
                  name="riceProduction"
                  min="0"
                  required
                  [(ngModel)]="form.riceProduction"
                />
              </label>
              <label>
                <span>Vegetable production (t)</span>
                <input
                  type="number"
                  name="vegetableProduction"
                  min="0"
                  required
                  [(ngModel)]="form.vegetableProduction"
                />
              </label>
              <label>
                <span>Milk production (L)</span>
                <input
                  type="number"
                  name="milkProduction"
                  min="0"
                  required
                  [(ngModel)]="form.milkProduction"
                />
              </label>
              <label>
                <span>Child food production (t)</span>
                <input
                  type="number"
                  name="childFoodProduction"
                  min="0"
                  required
                  [(ngModel)]="form.childFoodProduction"
                />
              </label>
            </div>
          </section>

          <section class="section">
            <h4>C. Targets</h4>
            <p class="helper">Optional, but helpful for KPI tracking.</p>
            <div class="field-grid">
              <label>
                <span>Rice target</span>
                <input
                  type="number"
                  name="riceTarget"
                  min="0"
                  [(ngModel)]="form.riceTarget"
                />
              </label>
              <label>
                <span>Vegetable target</span>
                <input
                  type="number"
                  name="vegetableTarget"
                  min="0"
                  [(ngModel)]="form.vegetableTarget"
                />
              </label>
              <label>
                <span>Milk target</span>
                <input
                  type="number"
                  name="milkTarget"
                  min="0"
                  [(ngModel)]="form.milkTarget"
                />
              </label>
              <label>
                <span>Child food target</span>
                <input
                  type="number"
                  name="childFoodTarget"
                  min="0"
                  [(ngModel)]="form.childFoodTarget"
                />
              </label>
            </div>
          </section>

          <section class="section">
            <h4>D. Overall Province Status</h4>
            <div class="field-row">
              <label for="provinceStatus">Province production status</label>
              <select
                id="provinceStatus"
                name="provinceProductionStatus"
                required
                [(ngModel)]="form.provinceProductionStatus"
              >
                <option *ngFor="let status of statusOptions" [value]="status">
                  {{ status }}
                </option>
              </select>
            </div>
          </section>

          <div class="actions">
            <button type="button" class="ghost" (click)="onClose()">Cancel</button>
            <button type="submit" class="primary" [disabled]="recordForm.invalid">
              Save record
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: grid;
        place-items: center;
        padding: 24px;
        z-index: 20;
      }

      .dialog {
        background: #ffffff;
        width: min(720px, 100%);
        border-radius: 18px;
        padding: 18px 20px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
        border: 1px solid rgba(15, 23, 42, 0.08);
        max-height: 90vh;
        overflow: auto;
      }

      :host-context(.dark) .dialog {
        background: #0f172a;
        color: #e2e8f0;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .dialog-header h3 {
        margin: 4px 0 0;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 11px;
        color: #0b8f61;
      }

      .section {
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 14px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }

      :host-context(.dark) .section {
        border-color: rgba(255, 255, 255, 0.08);
      }

      .section h4 {
        margin: 0 0 8px;
      }

      .helper {
        margin: 0 0 8px;
        font-size: 12px;
        color: #475569;
      }

      :host-context(.dark) .helper {
        color: #cbd5e1;
      }

      .field-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-weight: 600;
        color: #0f172a;
      }

      :host-context(.dark) label {
        color: #e2e8f0;
      }

      input,
      select {
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: #f8fafc;
        font-size: 14px;
      }

      :host-context(.dark) input,
      :host-context(.dark) select {
        background: rgba(255, 255, 255, 0.04);
        color: #e2e8f0;
        border-color: rgba(255, 255, 255, 0.08);
      }

      input:focus,
      select:focus {
        outline: 2px solid rgba(16, 185, 129, 0.35);
        border-color: rgba(16, 185, 129, 0.5);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
      }

      .ghost,
      .primary,
      .icon-btn {
        border: none;
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.2s ease;
      }

      .ghost {
        background: rgba(15, 23, 42, 0.05);
        color: #0f172a;
      }

      .primary {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        box-shadow: 0 10px 22px rgba(16, 185, 129, 0.35);
      }

      .icon-btn {
        padding: 8px 10px;
        background: rgba(15, 23, 42, 0.05);
        font-size: 18px;
        line-height: 1;
      }

      :host-context(.dark) .ghost,
      :host-context(.dark) .icon-btn {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class AddProductionRecordDialogComponent {
  readonly monthOptions = [
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

  readonly provinceOptions = [
    'Western',
    'Central',
    'Southern',
    'Northern',
    'Eastern',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa',
  ];

  readonly statusOptions: ProvinceHealth[] = ['GOOD', 'MEDIUM', 'LOW'];

  form: NewProductionRecord = {
    month: '',
    province: '',
    riceProduction: null,
    vegetableProduction: null,
    milkProduction: null,
    childFoodProduction: null,
    riceTarget: null,
    vegetableTarget: null,
    milkTarget: null,
    childFoodTarget: null,
    provinceProductionStatus: 'GOOD',
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewProductionRecord>();

  onClose(): void {
    this.close.emit();
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.save.emit({ ...this.form });
  }
}
