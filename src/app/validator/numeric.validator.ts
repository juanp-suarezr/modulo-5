import { AbstractControl, ValidatorFn } from '@angular/forms';

// Validador para longitud mínima en números
export function minLengthNumericValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value != null && value.toString().length < minLength) {
        return { 'minLengthNumeric': { value: control.value } };
      }
      return null;
    };
}