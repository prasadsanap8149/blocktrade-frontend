import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/letters-of-credit', icon: 'description', label: 'Letters of Credit' },
    { path: '/documents', icon: 'folder', label: 'Documents' },
    { path: '/payments', icon: 'payment', label: 'Payments' },
    { path: '/reports', icon: 'assessment', label: 'Reports' },
    { path: '/settings', icon: 'settings', label: 'Settings' }
  ];
}
