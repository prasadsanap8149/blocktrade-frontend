import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Compliance</h1><p>Compliance management coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class ComplianceComponent {}
