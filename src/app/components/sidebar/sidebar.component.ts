import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isSmallScreen: boolean = false;
  isSidebarOpen = true;
  activeItem: string | null = null;
  user: any;

  // Define the menu items
  items: any[] = [
    { label: 'Inicio', route: '/dashboard' },
    {
      label: 'Tramitar solicitud',
      isExpanded: false, // Flag to manage the expansion state
      subItems: [
        {
          label: 'Fijación de Capacidad Transportadora',
          route: '/fijacioncapacidadtransportadora',
        },
        {
          label: 'Incremento de Capacidad Transportadora',
          route: '/incrementocapacidadtransportadora',
        },
      ],
    },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 639px)'])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
        if (this.isSmallScreen) {
          this.isSidebarOpen = false;
        }
      });
    this.user = this.authService.currentUser;

    if (
      this.user.roles.some((role: any) =>
        role.roleName.includes('ROLE_ESCRITURA_GESDOC')
      )
    ) {
      this.items = [{ label: 'Inicio', route: '/dashboard' }];
    } else if (
      this.user.roles.some((role: any) =>
        role.roleName.includes('ROLE_SUPERTRANSPORTE')
      )
    ) {
      this.items = [
        { label: 'Inicio', route: '/dashboard' },
        {
          label: 'Indicadores',
          isExpanded: false, // Flag to manage the expansion state
          subItems: [
            {
              label: 'Comparativo contractual de vehículos y placas',
              route: '/vehículosplacas',
            },
            {
              label: 'Solicitudes enviadas por territoriales',
              route: '/solicitudxterritorial',
            },
          ],
        },
      ];
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSubItems(item: any) {
    item.isExpanded = !item.isExpanded; // Toggle the expansion state
    if (!item.isExpanded) {
      this.activeItem = null;
    }
  }

  selectSubItem(itemLabel: string) {
    this.items.forEach((item) => (item.isExpanded = false));
    this.activeItem = itemLabel;
  }
}
