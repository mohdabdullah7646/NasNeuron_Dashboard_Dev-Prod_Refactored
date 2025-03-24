import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { DatatableComponent } from './datatable/datatable.component';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },
    { path: 'datatable', component: DatatableComponent } // Route for the second screen
];
