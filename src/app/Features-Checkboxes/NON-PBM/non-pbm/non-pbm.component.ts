import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LogoutButtonComponent } from "../../../logout-button/logout-button.component";
import { CommonModule } from '@angular/common';

interface TableData {
  title: string;
  dataSource: MatTableDataSource<any>;
  columns: string[];
}

@Component({
  selector: 'app-non-pbm',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, LogoutButtonComponent],
  templateUrl: './non-pbm.component.html',
  styleUrl: './non-pbm.component.css'
})
export class NONPBMComponent implements OnInit, AfterViewInit {

  private apiService = inject(ApiService);
  private router = inject(Router);

  selectedCards = signal<string[]>([]);
  selectedCheckboxes = signal<string[]>([]);
  loading = signal<boolean>(true);

  tableList: TableData[] = [];

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  ngOnInit() {
    this.loadSelections();
    this.fetchNonPBMData();
  }

  fetchNonPBMData() {
    this.loading.set(true);
    const providerIds: number[] = [];

    if (this.selectedCards().includes('NAS UAE')) providerIds.push(1);
    if (this.selectedCards().includes('Neuron')) providerIds.push(6);

    let pendingRequests = providerIds.length * 2;

    const statusTables: TableData[] = [];
    const errorTables: TableData[] = [];

    this.tableList = [];

    providerIds.forEach(providerId => {
      // Fetch Status API Data
      const statusApiUrl = `/j/ICP.svc/Dashboard_NonPBM_Status?SPROVIDERID=${providerId}`;
      this.apiService.fetchDataForNonPbm(statusApiUrl).subscribe(
        (response) => {
          console.log("Raw API Response for Status:", response);

          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse?.Data?.length > 0) {

              // Convert Date Fields
              parsedResponse.Data = parsedResponse.Data.map((item: any) => this.formatDateFields(item));

              const columns = Object.keys(parsedResponse.Data[0]);
              const title = `NON-PBM - STATUS : (${this.getProviderName(providerId)})`;
              const dataSource = new MatTableDataSource<any>(parsedResponse.Data);

              statusTables.push({ title, dataSource, columns });
            }
          } catch (error) {
            console.error("Error parsing JSON for Status API:", error);
          }

          pendingRequests--;
          this.finalizeDataLoading(pendingRequests, statusTables, errorTables);
        },
        (error) => this.handleApiError(error, --pendingRequests, statusTables, errorTables)
      );

      // Fetch Erro API Data
      const errorsApiUrl = `/j/ICP.svc/Dashboard_NonPBM_Errors?SPROVIDERID=${providerId}`;
      this.apiService.fetchDataForNonPbm(errorsApiUrl).subscribe(
        (response) => {
          console.log("Raw API Response for Errors:", response);

          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse?.Data?.length > 0) {

              // Convert Date Fields
              parsedResponse.Data = parsedResponse.Data.map((item: any) => this.formatDateFields(item));

              const columns = Object.keys(parsedResponse.Data[0]);
              const title = `NON-PBM - ERRORS : (${this.getProviderName(providerId)})`;
              const dataSource = new MatTableDataSource<any>(parsedResponse.Data);

              errorTables.push({ title, dataSource, columns });
            }
          } catch (error) {
            console.error("Error parsing JSON for Errors API:", error);
          }

          pendingRequests--;
          this.finalizeDataLoading(pendingRequests, statusTables, errorTables);
        },
        (error) => this.handleApiError(error, --pendingRequests, statusTables, errorTables)
      );
    });
  }

  finalizeDataLoading(pendingRequests: number, statusTables: TableData[], errorTables: TableData[]) {
    if (pendingRequests === 0) {
      this.tableList = [...statusTables, ...errorTables];
      this.loading.set(false);
    }
  }

  handleApiError(error: any, pendingRequests: number, statusTables: TableData[], errorTables: TableData[]) {
    console.error('Error fetching NON-PBM data:', error);
    if (pendingRequests === 0) {
      this.tableList = [...statusTables, ...errorTables];
      this.loading.set(false);
    }
  }

  getProviderName(providerId: number): string {
    return providerId === 1 ? 'NAS UAE' : 'Neuron';
  }

  /**
 * Converts date strings from API format `/Date(1736971200000)/` to `MM/DD/YYYY HH:MM` format.
 */

  formatDateFields(data: any): any {
    const dateFields = ['TRANSACTION_DATE', 'CREATION_FROM', 'CREATION_TO'];

    dateFields.forEach(field => {
      if (data[field]) {
        data[field] = this.convertToDateTime(data[field]);
      }
    });

    return data;
  }


  /**
  * Extracts timestamp from API date string and converts it to `MM/DD/YYYY HH:MM` format.
  */

  convertToDateTime(dateString: string): string {
    const match = dateString.match(/\d+/); // Extracts numeric timestamp
    if (!match) return dateString; // Return original string if format is incorrect

    const timestamp = parseInt(match[0], 10);
    const date = new Date(timestamp);

    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return formattedDate;
  }

  ngAfterViewInit() {
    this.paginators.changes.subscribe(() => {
      this.paginators.toArray().forEach((paginator, index) => {
        if (this.tableList[index]) {
          this.tableList[index].dataSource.paginator = paginator;
        }
      });
    });
  }

  loadSelections() {
    if (typeof window !== 'undefined' && localStorage) {
      const storedCards = localStorage.getItem('selectedCards');
      const storedCheckboxes = localStorage.getItem('selectedCheckboxes');

      if (storedCards) {
        this.selectedCards.set(JSON.parse(storedCards));
      }

      if (storedCheckboxes) {
        this.selectedCheckboxes.set(JSON.parse(storedCheckboxes));
      }
    }
  }

  getCardImage(card: string): string {
    const images: { [key: string]: string } = {
      'NAS UAE': 'assets/images/nas-uae.svg',
      'Neuron': 'assets/images/neuron.svg'
    };
    return images[card] || 'assets/images/default.svg';
  }

  getCardImageFn = (card: string) => this.getCardImage(card);

  goBack() {
    this.router.navigate(['/homepage']);
  }

}
