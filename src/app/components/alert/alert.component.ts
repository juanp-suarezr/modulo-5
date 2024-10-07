import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SafeHtml } from '@angular/platform-browser';


type AlertType = 'loader' | 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleInOut', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('300ms', style({ transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: 'scale(0)' }))
      ])
    ])
  ]
})
export class AlertComponent {
  @Input() showModal: boolean = false;
  @Input() title: string = 'Header';
  @Input() subtitle: string = 'Header';
  @Input() message: SafeHtml = '';
  @Input() textColor: string = 'text-primary1';
  @Input() buttonText: string = 'Go back';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showTitle: boolean = true;
  @Input() showSubtitle: boolean = true;
  @Input() showFirstButton: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() TypeAlert: AlertType = 'info';
  @Input() isIcon: boolean = true;
  @Output() close = new EventEmitter<void>();
  @Output() closeByButton1 = new EventEmitter<void>();
  @Output() closeByButton2 = new EventEmitter<void>();
  @Output() closeByIcon = new EventEmitter<void>();
  @Output() closeByBackdrop = new EventEmitter<void>();

   alertSettings: Record<AlertType, { icon: string; iconColor: string; titleColor: string }> = {
    loader: { icon: 'pi pi-spinner', iconColor: 'text-purple-500', titleColor: 'text-green-500' },
    error: { icon: 'pi pi-times-circle', iconColor: 'text-red-500', titleColor: 'text-red-500' },
    warning: { icon: 'pi pi-exclamation-triangle', iconColor: 'text-yellow-500', titleColor: 'text-orange-500' },
    info: { icon: 'pi pi-info-circle', iconColor: this.textColor, titleColor: this.textColor },
    success: { icon: 'pi pi-check-circle', iconColor: this.textColor, titleColor: this.textColor }
  };

  get icon() {
    return this.alertSettings[this.TypeAlert].icon;
  }

  get iconColor() {
    
    return this.alertSettings[this.TypeAlert].iconColor;
  }

  get titleColor() {
    return this.alertSettings[this.TypeAlert].titleColor;
  }

  closeModal() {
    this.showModal = false;
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    this.closeModal();
    this.closeByBackdrop.emit();
  }

  onCloseIconClick() {
    this.closeModal();
    this.closeByIcon.emit();
  }

  onButton1Click() {
    this.closeModal();
    this.closeByButton1.emit();
  }

  onButton2Click() {
    this.closeModal();
    this.closeByButton2.emit();
  }
}