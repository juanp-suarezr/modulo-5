import { Component } from '@angular/core';
import { HeaderBarComponent } from '../../components/header-bar/header-bar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import VerificacionComponent from '../../views/verificacion/verificacion.component';
import MenuNavegacionComponent from '../../components/menu-navegacion/menu-navegacion.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [FooterComponent, HeaderBarComponent, VerificacionComponent, RouterOutlet,  MenuNavegacionComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export default class AuthLayoutComponent {

}
