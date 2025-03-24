import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LogoutButtonComponent } from "../logout-button/logout-button.component";
import { ApiService } from '../services/api.service';
import { error } from 'console';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, LogoutButtonComponent, MatPaginatorModule]
})

export class DatatableComponent implements OnInit {

  private router = inject(Router);
  private demoApiService = inject(ApiService);

  selectedCards = signal<string[]>([]);
  selectedCheckboxes = signal<string[]>([]);

  // Table Data
  displayedColumns1: string[] = [];
  apiData1 = signal<any[]>([]);
  displayedColumns2: string[] = [];
  apiData2 = signal<any[]>([]);

  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;

  ngOnInit() {
    this.loadSelections();
    this.fetchTableData();
  }

  ngAfterViewInit() {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource2.paginator = this.paginator2;
  }

  loadSelections() {
    if (typeof window !== 'undefined' && localStorage) { 
      const storedCards = localStorage.getItem('selectedCards');
      const storedCheckboxes = localStorage.getItem('selectedCheckboxes');
  
      if (storedCards) this.selectedCards.set(JSON.parse(storedCards));
      if (storedCheckboxes) this.selectedCheckboxes.set(JSON.parse(storedCheckboxes));
    }
  }

  // fetchTableData() {
  //   // Replace with actual API calls later
  //   this.apiData1.set([]);
  //   this.apiData2.set([]);
  //   this.displayedColumns1 = []; // ✅ Changed from `signal`
  //   this.displayedColumns2 = [];
  // }
  
  getCardImage(card: string): string {
    const images: { [key: string]: string } = {
      'NAS UAE': 'assets/images/nas-uae.svg',
      'Neuron': 'assets/images/neuron.svg'
    };
    return images[card] || 'assets/images/default.svg';
  }
  
  goBack() {
    this.router.navigate(['/homepage']);
  }

  fetchTableData() {
    const apiUrl1 = 'https://jsonplaceholder.typicode.com/todos'; // Replace with any API
    const apiUrl2 = 'https://jsonplaceholder.typicode.com/posts'; // Replace with any API

    this.demoApiService.fetchData(apiUrl1).subscribe(
      (data)=>{
        this.dataSource1.data = data;
        this.displayedColumns1 = data.length > 0 ? Object.keys(data[0]) : [];
      },
      (error)=>{        
        console.error('Error fetching Table 1 data:', error)
      }
    );

    this.demoApiService.fetchData(apiUrl2).subscribe(
      (data) => {
        this.dataSource2.data = data;
        this.displayedColumns2 = data.length ? Object.keys(data[0]) : [];
      },
      (error) => console.error('Error fetching Table 2 data:', error)
    );
  }


}
