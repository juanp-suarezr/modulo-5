import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export default class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null; // Variable para almacenar el mensaje de error
  users: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.users = this.authService.getUsers();
    console.log(this.users);
  }
  onSubmit(): void {
    if (this.email && this.password) {
      this.authService
        .login(this.email, this.password)
        .subscribe((response) => {
          if (response.error) {
            console.log(response.error); // Puedes manejar los errores aquí
            this.setErrorMessage(response.error); // Almacena el mensaje de error
          } else {
            this.errorMessage = null;
            this.router.navigate(['/dashboard']).then(() => {
              location.reload();
            });
            console.log(response.user); // Aquí puedes redirigir o manejar la lógica según el rol
          }
        });
    }
  }

  // Función para traducir o personalizar mensajes de error
  setErrorMessage(error: string): void {
    switch (error) {
      case 'Invalid credentials':
        this.errorMessage =
          'Credenciales incorrectas. Por favor, verifica tu correo electrónico y contraseña.';
        break;
      case 'User not found':
        this.errorMessage =
          'Usuario no encontrado. Por favor, regístrate primero.';
        break;
      case 'Account locked':
        this.errorMessage =
          'Cuenta bloqueada. Contacta al soporte para obtener ayuda.';
        break;
      default:
        this.errorMessage = 'Ocurrió un error. Inténtalo nuevamente más tarde.';
    }
  }
}
