import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.css'
})
export class HeaderBarComponent implements OnInit {

  token: string | null;
  constructor(private authService: AuthService) {
    this.token = this.authService.getTestToken();
  }

  

  userInfo: any;
  apiUrl = environment.LOGOUT;

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
  }

  menuVisible = false;

  onFocus() {
    this.menuVisible = true;
  }

  onFocusOut() {
    setTimeout(() => {
      this.menuVisible = false;
    }, 100);
  }

  cerrarsesion(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.classList.add("pointer-events-none");
    event.preventDefault();

    this.authService.clearToken();
  }

  
  volverInicio(event: MouseEvent){
    const target = event.target as HTMLElement;
    target.classList.add("pointer-events-none");
    event.preventDefault();
    
    window.location.href = this.apiUrl+'/transversales/usuarios/inicio/gateway?authtoken='+this.token;
  }
  
}
