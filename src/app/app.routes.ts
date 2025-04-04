import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { PBMComponent } from './Features-Checkboxes/PBM/pbm/pbm.component';
import { NONPBMComponent } from './Features-Checkboxes/NON-PBM/non-pbm/non-pbm.component';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },
    { path: 'pbm', component: PBMComponent },
    { path: 'non-pbm', component: NONPBMComponent },
];
