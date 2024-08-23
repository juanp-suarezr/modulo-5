import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {FileUploadComponent} from "../../components/file-upload/file-upload.component";
import {InputText} from "../../components/input/input.component";
import {LeftNavComponent} from "../../components/left-nav/left-nav.component";
import {PrimaryButtonComponent} from "../../components/primary-button/primary-button.component";
import {SttepperComponent} from "../../components/sttepper/sttepper.component";


@Component({
  selector: 'app-incremento',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, InputText, LeftNavComponent, PrimaryButtonComponent, ReactiveFormsModule, SttepperComponent],
  templateUrl: './incremento.component.html',
  styleUrl: './incremento.component.css'
})
export default class IncrementoComponent {


}
