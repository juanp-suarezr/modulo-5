import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('fecha_inicio')?.value;
  const endDate = control.get('fecha_terminacion')?.value;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    
    console.log(end < start);
    
    // Verificar si la fecha de terminación es menor que la fecha de inicio
    if (end < start) {
      return { 'dateRangeInvalid': true };
    }
  }

  return null;
};
