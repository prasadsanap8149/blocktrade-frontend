import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Reports</h1><p>Reporting features coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class ReportsComponent {}
