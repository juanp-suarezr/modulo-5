import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-menu-navegacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-navegacion.component.html',
  styleUrl: './menu-navegacion.component.css',
})
export default class MenuNavegacionComponent implements AfterViewInit {
  @ViewChild('navbarMenu', { static: false }) navbarMenu!: ElementRef;

  menuCollapsed = true;
  userInfo: any;
  hasSolicitudes: boolean = false;
  hasIndicadores: boolean = false;

  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private eRef: ElementRef,
    private router: Router,
  ) {
    this.hasSolicitudes = this.authService.hasPermission('MSF_CREAR_SOLICITUD');
    this.hasIndicadores = this.authService.hasPermission(
      'MSF_LISTAR_INDICADORES'
    );
  }

  ngAfterViewInit(): void {
    this.initHeader();
    if (isPlatformBrowser(this.platformId)) {
      this.initHeader();
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const dropdowns =
      this.eRef.nativeElement.querySelectorAll('.items_dropdown');
    dropdowns.forEach((dropdownMenu: HTMLElement) => {
      if (!this.eRef.nativeElement.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
      }
    });
  }

  toggleMenu() {
    this.menuCollapsed = !this.menuCollapsed;
  }

  initHeader() {
    this.initMenu();
  }

  initMenu() {
    const dropdownMenus =
      this.navbarMenu.nativeElement.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach((element: HTMLElement) => {
      this.renderer.listen(element, 'click', (e: Event) => {
        e.stopPropagation();
      });
    });

    const menuLinks = this.navbarMenu.nativeElement.querySelectorAll(
      '.navbar-menu-govco a.dir-menu-govco'
    );
    menuLinks.forEach((element: HTMLElement) => {
      this.renderer.listen(element, 'click', this.eventClickItem.bind(this));
    });
  }

  eventClickItem(event: Event) {
    const target = event.target as HTMLElement;
    const parentNavbar = target.closest('.navbar-menu-govco') as HTMLElement;

    if (parentNavbar) {
      const activeElements = parentNavbar.querySelectorAll('a.active');

      activeElements.forEach((element) => {
        (element as HTMLElement).classList.remove('active');
      });

      target.classList.add('active');

      const container = target.closest('.nav-item') as HTMLElement;
      const itemParent = container?.querySelector('.nav-link') as HTMLElement;

      if (itemParent) {
        itemParent.classList.add('active');
      }
    }
  }

  toggleDropdown(dropdownItem: HTMLElement): void {
    const dropdownMenu = dropdownItem.querySelector('.items_dropdown');

    if (dropdownMenu?.classList.contains('hidden')) {
      console.log(dropdownMenu);
      dropdownMenu.classList.remove('hidden');
    } else {
      dropdownMenu?.classList.add('hidden');
    }
  }

  navigateTo(route: string, dropdownItem: HTMLElement): void {
    this.router.navigate([route]);
    const dropdownMenu = dropdownItem.querySelector('.items_dropdown');
    dropdownMenu?.classList.add('hidden'); // Cierra el menú desplegable
    dropdownItem.classList.remove('is-expanded'); // Elimina la clase expandida
  }
}
