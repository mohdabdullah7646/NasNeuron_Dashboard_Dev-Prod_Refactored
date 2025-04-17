import { Component, Signal, signal, computed } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoutButtonComponent } from "../logout-button/logout-button.component";
import { UIText } from '../shared/constants/ui-text.constants';
import { FeatureEnum } from '../shared/enums/provider.enum';

@Component({
  selector: 'app-homepage',
  imports: [FooterComponent, HeaderComponent, CommonModule, LogoutButtonComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})

export class HomepageComponent {

  constructor(private router: Router) { }

  uiText = UIText;

  selectedCards = signal<string[]>([]);
  selectedCheckboxes = signal<string[]>([]);
  showError = signal(false);

  featureList: FeatureEnum[] = [
    FeatureEnum.PBM,
    FeatureEnum.NON_PBM,
    FeatureEnum.REASS,
    FeatureEnum.PERSON_REGISTER,
    FeatureEnum.CLAIMS,
    FeatureEnum.RE
  ];
  
  getCardImage(card: string): string {
    return card === 'NAS UAE' ? this.uiText.IMAGES.NAS : this.uiText.IMAGES.NEURON;
  }

  getFeatureLabel(feature: FeatureEnum): string {
    switch (feature) {
      case FeatureEnum.PBM: return this.uiText.LABELS.PBM;
      case FeatureEnum.NON_PBM: return this.uiText.LABELS.NON_PBM;
      case FeatureEnum.REASS: return this.uiText.LABELS.REASS;
      case FeatureEnum.PERSON_REGISTER: return this.uiText.LABELS.PERSON_REGISTER;
      case FeatureEnum.CLAIMS: return this.uiText.LABELS.CLAIMS;
      case FeatureEnum.RE: return this.uiText.LABELS.RE;
      default: return '';
    }
  }


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

  onCheckboxChange(event: any, feature: string) {
    const selectedCheckboxes = this.selectedCheckboxes();
    if (event.target.checked) {
      selectedCheckboxes.push(feature);
    } else {
      const index = selectedCheckboxes.indexOf(feature);
      if (index !== -1) {
        selectedCheckboxes.splice(index, 1);
      }
    }
    this.selectedCheckboxes.set([...selectedCheckboxes]);
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
