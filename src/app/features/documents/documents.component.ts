import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Documents</h1><p>Document management coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class DocumentsComponent {}
