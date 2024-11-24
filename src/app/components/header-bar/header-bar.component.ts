import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AuthService } from '../../services/auth/auth.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.css'
})
export class HeaderBarComponent implements OnInit {
  currentToken: string | null = null;
  @Input() user:any = [];
  menuVisible = false;
  
  constructor(
    
    private authService: AuthService,
    private router: Router
    // private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentToken = this.authService.getCurrentToken();
    console.log(this.currentToken);
  }

  onFocus() {
    this.menuVisible = true;
  }

  onFocusOut() {
    setTimeout(() => {
      this.menuVisible = false;
    }, 100);
  }

  logout() {
    console.log("cerrar sesion");
    // this.authService.logout();
    location.reload();
  }

  changeUser(newToken: string, newRoute: string): void {
    this.authService.changeToken(newToken).then(() => {
      this.router.navigate([newRoute]).then(() => {
        window.location.reload(); // Recargar la página después de la navegación
      });
    });
  }
  
  // const tokenRouteMap: { [key: string]: string } = {
  //   'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTdXBlclRyYW5zcG9ydGUiLCJhdXRob3JpdGllcyI6Ilt7XCJpZFwiOjEsXCJub21icmVcIjpcIlN1cGVyVHJhbnNwb3J0ZVwiLFwic2lzdGVtYVwiOlwiTUFUX1NVUEVSVFJBTlNQT1JURVwiLFwicGVybWlzb3NcIjpbe1wiaWRcIjoxLFwibm9tYnJlXCI6XCJOYXZlZ2FyIG1lbnUgU3VwZXIgVHJhbnNwb3J0ZVwiLFwic2lzdGVtYVwiOlwiTUFUX01FTlVTVVBFUlRSQU5TUE9SVEVcIn0se1wiaWRcIjoyLFwibm9tYnJlXCI6XCJHZXN0aW9uYXIgdGVtcG9yYWRhc1wiLFwic2lzdGVtYVwiOlwiTUFUX0dFU1RJT05URU1QT1JBREFTXCJ9LHtcImlkXCI6MyxcIm5vbWJyZVwiOlwiVmFsaWRhciB0ZW1wb3JhZGFzXCIsXCJzaXN0ZW1hXCI6XCJNQVRfVkFMSURBQ0lPTlRFTVBPUkFEQVNcIn0sIHtcImlkXCI6NCxcIm5vbWJyZVwiOlwiQ2VycmFyIHRlbXBvcmFkYVwiLFwic2lzdGVtYVwiOlwiTUFUX0NJRVJSRVRFTVBPUkFEQVNcIn1dfV0iLCJpZCI6MjEsInVzZXIiOiJ7XCJpZFwiOjIxLFwibm9tYnJlc1wiOlwiU3VwZXJUcmFuc3BvcnRlXCIsXCJhcGVsbGlkb3NcIjpudWxsLFwiY29ycmVvXCI6XCJwcnVlYmFzc3VwZXJwQGdtYWlsLmNvbVwiLFwiZGVsZWdhdHVyYUlkXCI6bnVsbCxcInJhem9uU29jaWFsXCI6XCJTdXBlclRyYW5zcG9ydGVcIn0iLCJleHAiOjE3MzIyODI2OTQsImlhdCI6MTczMDk4NjY5NH0.HBTg_ZTSvx6ZYkYfktFf4WqmIi1ejFs0iW6qykoaygE': '/inicioaltatemporada',
  //   'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUZXJtaW5hbGVzIiwiYXV0aG9yaXRpZXMiOiJbe1wiaWRcIjoxLFwibm9tYnJlXCI6XCJUZXJtaW5hbGVzXCIsXCJzaXN0ZW1hXCI6XCJNQVRfVEVSTUlOQUxFU1wiLFwicGVybWlzb3NcIjpbe1wiaWRcIjoxLFwibm9tYnJlXCI6XCJOYXZlZ2FyIG1lbnUgVGVybWluYWxlc1wiLFwic2lzdGVtYVwiOlwiTUFUX01FTlVURVJNSU5BTEVTXCJ9LHtcImlkXCI6MixcIm5vbWJyZVwiOlwiR2VzdGlvbmFyIHNvbGljaXR1ZGVzXCIsXCJzaXN0ZW1hXCI6XCJNQVRfR0VTVElPTlNPTElDSVRVREVTXCJ9XX1dIiwiaWQiOjIxLCJ1c2VyIjoie1wiaWRcIjoyMSxcIm5vbWJyZXNcIjpcIlRlcm1pbmFsZXNcIixcImFwZWxsaWRvc1wiOm51bGwsXCJjb3JyZW9cIjpcInBydWViYXNzdXBlcnBAZ21haWwuY29tXCIsXCJjb2RpZ29cIjo0NzAwMTAwMCxcInJhem9uU29jaWFsXCI6XCJUZXJtaW5hbGVzXCJ9IiwiZXhwIjoxNzMyMjgyNjk0LCJpYXQiOjE3MzA5ODY2OTR9.QRiXt_8MgwjeF80UWwyZ2HsUpYpZgbhhT2Vey47c1_8': '/solicitudteraltatemporada',
  //   'token-usuario-3': '/ruta-usuario-3'
      
  // };
}