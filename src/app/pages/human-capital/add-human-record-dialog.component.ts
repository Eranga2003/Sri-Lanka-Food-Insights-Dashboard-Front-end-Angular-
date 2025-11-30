import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

export type NutritionLevel = 'GOOD' | 'MEDIUM' | 'LOW';

export interface NewHumanNutritionRecord {
  month: string;
  province: string;
  age1to5_riceIntake: number | null;
  age1to5_vegIntake: number | null;
  age1to5_milkIntake: number | null;
  age1to5_otherFoodIntake: number | null;
  age1to5_nutritionScore: number | null;
  age1to5_status: NutritionLevel;
  age6to12_riceIntake: number | null;
  age6to12_vegIntake: number | null;
  age6to12_milkIntake: number | null;
  age6to12_otherFoodIntake: number | null;
  age6to12_nutritionScore: number | null;
  age6to12_status: NutritionLevel;
  age13to18_riceIntake: number | null;
  age13to18_vegIntake: number | null;
  age13to18_milkIntake: number | null;
  age13to18_otherFoodIntake: number | null;
  age13to18_nutritionScore: number | null;
  age13to18_status: NutritionLevel;
}

@Component({
  selector: 'app-add-human-record-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-shell" (click)="onClose()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div>
            <p class="eyebrow">Add new record</p>
            <h3>Child nutrition data entry</h3>
          </div>
          <button type="button" class="icon-btn" (click)="onClose()">×</button>
        </div>

        <form #recordForm="ngForm" (ngSubmit)="onSubmit(recordForm)" novalidate>
          <section class="section">
            <h4>A. Basic information</h4>
            <div class="field-row">
              <label for="month">Month</label>
              <select id="month" name="month" required [(ngModel)]="form.month">
                <option value="" disabled>Select month</option>
                <option *ngFor="let m of monthOptions" [value]="m">{{ m }}</option>
              </select>
            </div>
            <div class="field-row">
              <label for="province">Province</label>
              <select id="province" name="province" required [(ngModel)]="form.province">
                <option value="" disabled>Select province</option>
                <option *ngFor="let p of provinceOptions" [value]="p">{{ p }}</option>
              </select>
            </div>
          </section>

          <section class="section">
            <h4>B. Age group data</h4>
            <div class="age-section">
              <div class="age-title">Age 1–5</div>
              <div class="field-grid">
                <label>
                  <span>Rice intake</span>
                  <input type="number" name="age1to5_riceIntake" min="0" required [(ngModel)]="form.age1to5_riceIntake" />
                </label>
                <label>
                  <span>Vegetable intake</span>
                  <input type="number" name="age1to5_vegIntake" min="0" required [(ngModel)]="form.age1to5_vegIntake" />
                </label>
                <label>
                  <span>Milk intake</span>
                  <input type="number" name="age1to5_milkIntake" min="0" required [(ngModel)]="form.age1to5_milkIntake" />
                </label>
                <label>
                  <span>Other food</span>
                  <input type="number" name="age1to5_otherFoodIntake" min="0" required [(ngModel)]="form.age1to5_otherFoodIntake" />
                </label>
                <label>
                  <span>Nutrition score (0–100)</span>
                  <input
                    type="number"
                    name="age1to5_nutritionScore"
                    min="0"
                    max="100"
                    required
                    [(ngModel)]="form.age1to5_nutritionScore"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select name="age1to5_status" required [(ngModel)]="form.age1to5_status">
                    <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="age-section">
              <div class="age-title">Age 6–12</div>
              <div class="field-grid">
                <label>
                  <span>Rice intake</span>
                  <input type="number" name="age6to12_riceIntake" min="0" required [(ngModel)]="form.age6to12_riceIntake" />
                </label>
                <label>
                  <span>Vegetable intake</span>
                  <input type="number" name="age6to12_vegIntake" min="0" required [(ngModel)]="form.age6to12_vegIntake" />
                </label>
                <label>
                  <span>Milk intake</span>
                  <input type="number" name="age6to12_milkIntake" min="0" required [(ngModel)]="form.age6to12_milkIntake" />
                </label>
                <label>
                  <span>Other food</span>
                  <input type="number" name="age6to12_otherFoodIntake" min="0" required [(ngModel)]="form.age6to12_otherFoodIntake" />
                </label>
                <label>
                  <span>Nutrition score (0–100)</span>
                  <input
                    type="number"
                    name="age6to12_nutritionScore"
                    min="0"
                    max="100"
                    required
                    [(ngModel)]="form.age6to12_nutritionScore"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select name="age6to12_status" required [(ngModel)]="form.age6to12_status">
                    <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="age-section">
              <div class="age-title">Age 13–18</div>
              <div class="field-grid">
                <label>
                  <span>Rice intake</span>
                  <input type="number" name="age13to18_riceIntake" min="0" required [(ngModel)]="form.age13to18_riceIntake" />
                </label>
                <label>
                  <span>Vegetable intake</span>
                  <input type="number" name="age13to18_vegIntake" min="0" required [(ngModel)]="form.age13to18_vegIntake" />
                </label>
                <label>
                  <span>Milk intake</span>
                  <input type="number" name="age13to18_milkIntake" min="0" required [(ngModel)]="form.age13to18_milkIntake" />
                </label>
                <label>
                  <span>Other food</span>
                  <input
                    type="number"
                    name="age13to18_otherFoodIntake"
                    min="0"
                    required
                    [(ngModel)]="form.age13to18_otherFoodIntake"
                  />
                </label>
                <label>
                  <span>Nutrition score (0–100)</span>
                  <input
                    type="number"
                    name="age13to18_nutritionScore"
                    min="0"
                    max="100"
                    required
                    [(ngModel)]="form.age13to18_nutritionScore"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select name="age13to18_status" required [(ngModel)]="form.age13to18_status">
                    <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <div class="actions">
            <button type="button" class="ghost" (click)="onClose()">Cancel</button>
            <button type="submit" class="primary" [disabled]="recordForm.invalid">Save record</button>
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
        width: min(820px, 100%);
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

      .age-section {
        border: 1px solid rgba(15, 23, 42, 0.06);
        border-radius: 12px;
        padding: 10px 12px;
        margin-top: 10px;
      }

      :host-context(.dark) .age-section {
        border-color: rgba(255, 255, 255, 0.06);
      }

      .age-title {
        font-weight: 700;
        margin-bottom: 8px;
      }

      .field-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
export class AddHumanRecordDialogComponent {
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

  readonly statusOptions: NutritionLevel[] = ['GOOD', 'MEDIUM', 'LOW'];

  form: NewHumanNutritionRecord = {
    month: '',
    province: '',
    age1to5_riceIntake: null,
    age1to5_vegIntake: null,
    age1to5_milkIntake: null,
    age1to5_otherFoodIntake: null,
    age1to5_nutritionScore: null,
    age1to5_status: 'GOOD',
    age6to12_riceIntake: null,
    age6to12_vegIntake: null,
    age6to12_milkIntake: null,
    age6to12_otherFoodIntake: null,
    age6to12_nutritionScore: null,
    age6to12_status: 'GOOD',
    age13to18_riceIntake: null,
    age13to18_vegIntake: null,
    age13to18_milkIntake: null,
    age13to18_otherFoodIntake: null,
    age13to18_nutritionScore: null,
    age13to18_status: 'GOOD',
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewHumanNutritionRecord>();

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
