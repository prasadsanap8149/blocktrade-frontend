import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Payments</h1><p>Payment processing coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class PaymentsComponent {}
