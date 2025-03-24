import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-button',
  imports: [],
  templateUrl: './logout-button.component.html',
  styleUrl: './logout-button.component.css'
})
export class LogoutButtonComponent {

  constructor(private router: Router) {}

  logout() {
    // Clear user session if needed
    localStorage.clear();
    this.router.navigate(['/login']); // Navigate to login page
  }
}
