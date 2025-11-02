import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-letter-of-credit-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lc-container">
      <h1>Letters of Credit</h1>
      <p>Letters of Credit management will be implemented here</p>
    </div>
  `,
  styles: [`
    .lc-container {
      padding: 24px;
    }
  `]
})
export class LetterOfCreditListComponent {}
