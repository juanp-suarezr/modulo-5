import { Component } from '@angular/core';
import { HeaderBarComponent } from '../../components/header-bar/header-bar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import LoginComponent from '../../views/login/login.component';
import VerificacionComponent from '../../views/verificacion/verificacion.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [FooterComponent, HeaderBarComponent, LoginComponent, VerificacionComponent, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export default class AuthLayoutComponent {

}
