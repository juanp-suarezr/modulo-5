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
          route: '/validador_nit',
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
      this.items = [
        { 
          label: 'Inicio', route: '/dashboard' 
        }
      ];
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
            //INDICADOR 1
            {
              label: 'Comparativo contractual de vehículos y placas',
              route: '/comparativoVehiculo-placas',
            },
            //INDICADOR 2
            {
              label: 'Solicitudes enviadas por territoriales',
              route: '/solicitudxterritorial',
            },
            // INDICADOR 3
            {
              label: 'Vehículos requeridos por territorial ',
              route: '/vehiculosxterritorial',
            },
            // INDICADOR 4
            {
              label: 'Capacidad de un departamento para cierta cantidad de vehículos',
              route: '/capacidadDepartamentoxvehiculos',
            },
            // INDICADORES 5
            {
              label: 'Solicitudes realizadas año a año',
              route: '/solicitudesxaño',
            },
            //INDICADORES 6
            {
              label: 'Solicitudes realizadas mes a mes',
              route: '/solicitudesxmes',
            },
            //INDICADOR 7
            {
              label: 'Cantidad de Empresas que solicitan Fijación de Capacidad Transportadora',
              route: '/empresasxfijacion',
            },
            //INDICADOR 8
            {
              label: 'Cantidad de Empresas que solicitan Incremento de Capacidad Transportadora',
              route: '/solicitudxterritorial',
            },
            // INDICADOR 9
            {
              label: 'Cantidad de Empresas con liquidez',
              route: '/vehiculosxterritorial',
            },
            // INDICADOR 10
            {
              label: 'Cumplimiento del 10% flota propia o 7% mediante la figura de leasing financiero',
              route: '/capacidadDepartamentoxvehiculos',
            },
            // INDICADORES 11
            {
              label: 'Cumplimiento de Capital Social / Patrimonio líquido para la totalidad de vehículos requeridos',
              route: '/solicitudesxaño',
            },
            //INDICADORES 12
            {
              label: 'Medición estados financieros',
              route: '/solicitudesxmes',
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
