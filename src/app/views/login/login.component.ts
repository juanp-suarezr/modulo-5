import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export default class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.email && this.password) {
      this.authService
        .login(this.email, this.password)
        .subscribe((response) => {
          if (response.error) {
            console.log(response.error); // Puedes manejar los errores aquí
          } else {
            console.log(response.user); // Aquí puedes redirigir o manejar la lógica según el rol
          }
        });
    }
  }
}
