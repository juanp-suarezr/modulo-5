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
import {CommonModule} from '@angular/common';
import {PrimaryButtonComponent} from '../primary-button/primary-button.component';

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
  @Input() fileValue: File[] = [];
  @Output() fileSelected = new EventEmitter<File[]>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  files: File[] = [];
  fileName: string = '';
  isFileUpdate: boolean | null = null;
  islimit: boolean | false = false;
  currentIndex = 0;
  maxVisibleFiles = 2;

  constructor(private cd: ChangeDetectorRef) {
  }

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

    // Convierte los archivos seleccionados en un array
    const selectedFiles = Array.from(event.target.files) as File[];

    // Verifica si el número de archivos supera el máximo permitido
    if (this.files.length + selectedFiles.length > this.maxFiles && this.maxFiles !== 0) {
      this.islimit = true;
    } else {
      // Agrega los nuevos archivos a la lista existente sin duplicar archivos
      selectedFiles.forEach((file) => {
        if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
          this.files.push(file);
        }
      });

      // Inmediatamente mostrar los archivos sin esperar al botón "Cargar archivo"
      this.fileName = this.files.length > 0 ? this.files[0].name : '';
      this.islimit = false;

      // Emitir la lista de archivos actualizada
      this.fileSelected.emit(this.files);
    }

    // Restablece el valor del input para permitir la selección del mismo archivo nuevamente
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // Detectar cambios para asegurarse de que el archivo se muestre inmediatamente
    this.cd.detectChanges();
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

    // Ajusta el índice si el número de archivos cambia y previene que el índice sea mayor que los archivos disponibles
    if (this.currentIndex > this.files.length - this.maxVisibleFiles) {
      this.currentIndex = Math.max(0, this.files.length - this.maxVisibleFiles);
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
    }
  }

  truncatedFileName(fileName: string, maxLength: number = 20): string {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const truncated = fileName.substring(0, maxLength - 3) + '...';
    return truncated;
  }

  get visibleFiles(): File[] {
    return this.files.slice(this.currentIndex, this.currentIndex + this.maxVisibleFiles);
  }

  moveLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  moveRight(): void {
    if (this.currentIndex < this.files.length - this.maxVisibleFiles) {
      this.currentIndex++;
    }
  }

  viewDocument(file: File) {
    if (file) {
      console.log(file);
      
      const url = URL.createObjectURL(file);

      window.open(url);
    }
  }

}
