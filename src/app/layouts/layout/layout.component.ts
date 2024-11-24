import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderBarComponent } from '../../components/header-bar/header-bar.component';
import { RouterService } from '../../services/breadcrumb/router.service';
import { Subscription } from 'rxjs';
//servicios de consultas api
import { ApiService } from '../../services/api/api.service';
import { AuthService } from '../../services/auth/auth.service';
import MenuNavegacionComponent from '../../components/menu-navegacion/menu-navegacion.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    HeaderBarComponent,
    RouterOutlet,
    CommonModule,
    MenuNavegacionComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export default class LayoutComponent implements OnInit, OnDestroy {
  breadcrumb: { name: string; route: string }[] = [];
  private breadcrumbSubscription?: Subscription;

  constructor(
    private breadcrumbService: RouterService,
    private authService: AuthService
  ) {}

  user: any;
  hasPermission: boolean = false;

  ngOnInit(): void {
    this.breadcrumbSubscription = this.breadcrumbService.breadcrumb$.subscribe(
      (breadcrumb) => {
        this.breadcrumb = breadcrumb;
      }
    );

    //traer los datos de la consulta
    this.user = this.authService.getUserInfo();
    this.hasPermission = this.authService.hasPermission(
      'MSF_TERRITORIAL'
    );
  }

  ngOnDestroy(): void {
    if (this.breadcrumbSubscription) {
      this.breadcrumbSubscription.unsubscribe();
    }
  }

}
