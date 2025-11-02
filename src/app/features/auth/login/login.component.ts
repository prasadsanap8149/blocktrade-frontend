import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h1>Login</h1>
      <p>Login functionality will be implemented here</p>
    </div>
  `,
  styles: [`
    .login-container {
      padding: 24px;
      max-width: 400px;
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {}
