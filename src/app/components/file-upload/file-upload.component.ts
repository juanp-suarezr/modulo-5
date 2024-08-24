import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [PrimaryButtonComponent, CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent implements OnInit, AfterViewInit {
  @Input() dataClass: any = [];
  @Input() mimes: string = '*';
  @Input() maxFiles: number = 0; // Define el máximo de archivos permitidos
  @Input() error: boolean = false;
  @Output() fileSelected = new EventEmitter<File[]>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  files: File[] = [];
  fileName: string = '';
  isFileUpdate: boolean | null = null;
  islimit: boolean | false = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    // Inicialización necesaria antes de que la vista esté disponible

  }

  ngAfterViewInit() {
    // La referencia a fileInput estará disponible aquí
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['error'] && changes['error'].currentValue) {
      this.cd.detectChanges();
      console.log(this.error);
    }
  }

  onFileSelected(event: any) {
    this.islimit = false;
    this.isFileUpdate = null;
    const selectedFiles = Array.from(event.target.files) as File[];

    if (selectedFiles.length > this.maxFiles && this.maxFiles !== 0) {
      this.files = [];
      this.fileName = '';
      this.islimit = true;
    } else {
      this.files = selectedFiles;
      this.fileName = this.files.length > 0 ? this.files[0].name : '';
      this.islimit = false;
    }

    this.fileSelected.emit(this.files);

    // Restablece el valor del input para permitir la selección del mismo archivo nuevamente
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


  deleteFile(file: File) {
    this.files = this.files.filter(f => f !== file);
    this.fileName = this.files.length > 0 ? this.files[0].name : '';

    // Emitir la lista actualizada de archivos
    this.fileSelected.emit(this.files);

    // Si todos los archivos fueron eliminados, establece isFileUpdate en null
    if (this.files.length === 0) {
      this.isFileUpdate = null;
    }
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onUpdateButton() {
    if (this.files.length === 0) {
      this.isFileUpdate = false;
    } else {

      this.isFileUpdate = true;
      // Lógica adicional para manejar la carga del archivo
    }
  }

  truncatedFileName(fileName: string, maxLength: number = 20): string {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const truncated = fileName.substring(0, maxLength - 3) + '...';
    return truncated;
  }
}