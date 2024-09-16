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
          ctrl.setErrors({ negativeNumber: true });
          hasError = true;
        } else {
          if (ctrl.hasError('negativeNumber')) {
            const errors = { ...ctrl.errors };
            delete errors['negativeNumber'];
            ctrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });

    return hasError ? { negativeNumber: true } : null;  // Devolver error global si alguno de los controles tiene error
  }

  return null;
};
