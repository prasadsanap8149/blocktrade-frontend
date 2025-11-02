import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { HeaderComponent } from './layout/header/header.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    HeaderComponent,
    SidenavComponent,
    FooterComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          #drawer 
          class="sidenav" 
          fixedInViewport 
          [attr.role]="'navigation'"
          [mode]="'side'"
          [opened]="true">
          <app-sidenav></app-sidenav>
        </mat-sidenav>
        
        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      background-color: #f5f5f5;
      border-right: 1px solid #e0e0e0;
    }

    .main-content {
      padding: 20px;
      background-color: #fafafa;
      overflow-x: hidden;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .main-content {
        padding: 10px;
      }
    }
  `]
})
export class AppComponent {
  title = 'BlockTrade - Trade Finance Platform';
}
