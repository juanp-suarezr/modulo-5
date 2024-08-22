// alert.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';

@NgModule({
  declarations: [AlertComponent],
  imports: [
    CommonModule, // Importa CommonModule en lugar de BrowserModule
  ],
  exports: [AlertComponent]
})
export class AlertModule { }