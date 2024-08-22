import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
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
  @Input() message: string = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
  @Input() buttonText: string = 'Go back';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.showModal = false;
    this.close.emit();
  }
}