import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Settings</h1><p>Settings configuration coming soon</p></div>`,
  styles: [`
    .container { padding: 24px; }
  `]
})
export class SettingsComponent {}
