import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

export type StorageType = 'Cold room' | 'Normal store' | 'Outdoor';
export type StorageIssue = 'Spoilage' | 'Heat' | 'Poor packing' | 'Expired';

export interface NewStorageLossRecord {
  month: string;
  province: string;
  storageType: StorageType;
  storageLossPercent: number | null;
  transportLossPercent: number | null;
  mainStorageIssue: StorageIssue;
  totalPostProductionLossPercent: number | null;
}

@Component({
  selector: 'app-add-storage-record-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-shell" (click)="onClose()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div>
            <p class="eyebrow">Add new record</p>
            <h3>Storage & supply loss</h3>
          </div>
          <button type="button" class="icon-btn" (click)="onClose()">×</button>
        </div>

        <form #recordForm="ngForm" (ngSubmit)="onSubmit(recordForm)" novalidate>
          <section class="section">
            <h4>Basic info</h4>
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
            <h4>Loss details</h4>
            <div class="field-grid">
              <label>
                <span>Storage type</span>
                <select name="storageType" required [(ngModel)]="form.storageType">
                  <option *ngFor="let type of storageTypes" [value]="type">{{ type }}</option>
                </select>
              </label>
              <label>
                <span>Storage loss percent</span>
                <input
                  type="number"
                  name="storageLossPercent"
                  min="0"
                  max="100"
                  required
                  [(ngModel)]="form.storageLossPercent"
                />
              </label>
              <label>
                <span>Transport loss percent</span>
                <input
                  type="number"
                  name="transportLossPercent"
                  min="0"
                  max="100"
                  required
                  [(ngModel)]="form.transportLossPercent"
                />
              </label>
              <label>
                <span>Main storage issue</span>
                <select name="mainStorageIssue" required [(ngModel)]="form.mainStorageIssue">
                  <option *ngFor="let issue of issues" [value]="issue">{{ issue }}</option>
                </select>
              </label>
              <label>
                <span>Total post production loss %</span>
                <input
                  type="number"
                  name="totalPostProductionLossPercent"
                  min="0"
                  max="100"
                  required
                  [(ngModel)]="form.totalPostProductionLossPercent"
                />
              </label>
            </div>
            <p class="helper">(storage + transport)</p>
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
        width: min(640px, 100%);
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

      .helper {
        margin: 6px 0 0;
        font-size: 12px;
        color: #475569;
      }

      :host-context(.dark) .helper {
        color: #cbd5e1;
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
export class AddStorageRecordDialogComponent {
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

  readonly storageTypes: StorageType[] = ['Cold room', 'Normal store', 'Outdoor'];
  readonly issues: StorageIssue[] = ['Spoilage', 'Heat', 'Poor packing', 'Expired'];

  form: NewStorageLossRecord = {
    month: '',
    province: '',
    storageType: 'Cold room',
    storageLossPercent: null,
    transportLossPercent: null,
    mainStorageIssue: 'Spoilage',
    totalPostProductionLossPercent: null,
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewStorageLossRecord>();

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
