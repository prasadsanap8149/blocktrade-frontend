import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-supply-chain',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Supply Chain</h1><p>Supply Chain features coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class SupplyChainComponent {}
