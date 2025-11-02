import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to TradeFinance Platform</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 16px;
    }
  `]
})
export class DashboardComponent {}
