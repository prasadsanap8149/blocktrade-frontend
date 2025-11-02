import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for doesn't exist.</p>
        <button mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Go to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      text-align: center;
    }
    
    .not-found-content {
      max-width: 400px;
    }
    
    .not-found-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #ccc;
      margin-bottom: 24px;
    }
    
    h1 {
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    p {
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
  `]
})
export class NotFoundComponent {}
