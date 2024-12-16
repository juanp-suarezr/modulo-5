import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  constructor(private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    const token = this.authService.getTestToken();

    if (token) {
      // Redirigir a inicio si el token es válido
      this.router.navigate(['/inicio']);
    } else {
      // Si no hay token, redirigir a la página de error
      this.router.navigate(['/errorautenticacion']);
    }
  }

}
