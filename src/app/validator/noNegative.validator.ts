import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export const NoNegativeGlobal: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control instanceof FormGroup) {
    const controls = control.controls;
    let hasError = false;

    Object.keys(controls).forEach(key => {
      const ctrl = controls[key];
      
      if (ctrl.value && !isNaN(ctrl.value)) {
        const value = parseFloat(ctrl.value);

        if (value < 0) {
          // Establecer el error solo en este control
          ctrl.setErrors({ negativeNumber: true });
          hasError = true;
        } else {
          // Eliminar el error 'negativeNumber' si el valor es positivo
          if (ctrl.hasError('negativeNumber')) {
            const errors = { ...ctrl.errors };
            delete errors['negativeNumber'];
            ctrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });

    // El validador del grupo en sí no necesita devolver un error global
    return null;
  }

  return null;
};
