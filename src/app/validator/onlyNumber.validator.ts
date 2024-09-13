import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

// Validador global que asegura que solo se ingresen números enteros
export const OnlyNumberGlobal: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control instanceof FormGroup) {
    const controls = control.controls;

    Object.keys(controls).forEach(key => {
      const ctrl = controls[key];

      // Verificar si el valor del control es un número o una cadena
      if (ctrl.value !== null && ctrl.value !== undefined) {
        const regex = /^[0-9]+$/; // Solo acepta números enteros sin símbolos ni caracteres especiales

        // Convertir el valor a cadena para aplicar la expresión regular
        const valueAsString = ctrl.value.toString();

        if (!regex.test(valueAsString)) {
          // Si el valor contiene símbolos o caracteres especiales, establece el error
          ctrl.setErrors({ invalidCharacter: true });
        } else {
          // Si el valor es válido, elimina el error 'invalidCharacter'
          if (ctrl.hasError('invalidCharacter')) {
            const errors = { ...ctrl.errors };
            delete errors['invalidCharacter'];
            ctrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });

    return null; // No devolver un error global para el grupo de controles
  }

  return null;
};
