import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

// Validador global que asegura que solo se ingresen números enteros de 0 a 9
export const OnlyNumberGlobal: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control instanceof FormGroup) {
    const controls = control.controls;

    Object.keys(controls).forEach(key => {
      const ctrl = controls[key];

      if (ctrl.value !== null && ctrl.value !== undefined) {
        const regex = /^[0-9]+$/; // Acepta solo números enteros del 0 al 9

        // Convertir el valor a cadena para aplicar la expresión regular
        const valueAsString = ctrl.value.toString();

        // Si el valor no cumple con la expresión regular, establece el error
        if (!regex.test(valueAsString)) {
          ctrl.setErrors({ invalidCharacter: true });
        } else {
          // Si el valor es válido, elimina el error 'invalidCharacter' si está presente
          if (ctrl.hasError('invalidCharacter')) {
            const errors = { ...ctrl.errors };
            delete errors['invalidCharacter'];
            ctrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });

    return null; // No devuelve un error global para el grupo de controles
  }

  return null;
};
