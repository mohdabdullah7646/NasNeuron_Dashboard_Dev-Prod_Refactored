import { Component, Signal, signal, computed } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoutButtonComponent } from "../logout-button/logout-button.component";

@Component({
  selector: 'app-homepage',
  imports: [FooterComponent, HeaderComponent, CommonModule, LogoutButtonComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})

export class HomepageComponent {

  constructor(private router: Router) { }

  selectedCards = signal<string[]>([]);
  selectedCheckboxes = signal<string[]>([]);
  showError = signal(false);

  isNextEnabled = computed(() =>
    this.selectedCards().length > 0 && this.selectedCheckboxes().length > 0
  );

  onButtonClick(card: string) {
    this.selectedCards.update(currentSelection =>
      currentSelection.includes(card)
        ? currentSelection.filter(item => item !== card)
        : [...currentSelection, card]
    );
  }

  onCheckboxChange(event: Event, name: string) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCheckboxes.update(currentSelection =>
      checked
        ? [...currentSelection, name]
        : currentSelection.filter(item => item !== name)
    );
  }

  onNextClick() {
    if (!this.isNextEnabled()) {
      this.showError.set(true);
    }
    else {
      this.showError.set(false);
      localStorage.setItem('selectedCards', JSON.stringify(this.selectedCards()));
      localStorage.setItem('selectedCheckboxes', JSON.stringify(this.selectedCheckboxes()));

      if (this.selectedCheckboxes().includes('PBM')) {
        this.router.navigate(['/pbm']);
      }

      else if (this.selectedCheckboxes().includes('NON-PBM')) {
        this.router.navigate(['/non-pbm']);
      }

    }
  }

}
