import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LogoutButtonComponent } from "../../../logout-button/logout-button.component";
import { CommonModule } from '@angular/common';
import { UIText } from '../../../shared/constants/ui-text.constants';
import { NonPBMProviderEnum, ProviderNames } from '../../../shared/enums/provider.enum';
import { ApiEndpoints } from '../../../shared/constants/api-endpoints.constants';

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

  uiText = UIText;
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

    if (this.selectedCards().includes(ProviderNames[NonPBMProviderEnum.NAS])) {
      providerIds.push(NonPBMProviderEnum.NAS);
    }
    if (this.selectedCards().includes(ProviderNames[NonPBMProviderEnum.NEURON])) {
      providerIds.push(NonPBMProviderEnum.NEURON);
    }

    let pendingRequests = providerIds.length * 2;
    const statusTables: TableData[] = [];
    const errorTables: TableData[] = [];

    this.tableList = [];

    providerIds.forEach(providerId => {
      const statusApiUrl = ApiEndpoints.NON_PBM.STATUS(providerId);

      this.apiService.fetchDataForNonPbm(statusApiUrl).subscribe(
        (response) => {
          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse?.Data?.length > 0) {
              parsedResponse.Data = parsedResponse.Data.map((item: any) => this.formatDateFields(item));
              const columns = Object.keys(parsedResponse.Data[0]);
              const title = `${UIText.LABELS.STATUS_TITLE} (${this.getProviderName(providerId)})`;
              const dataSource = new MatTableDataSource<any>(parsedResponse.Data);

              statusTables.push({ title, dataSource, columns });
            }
          } catch (error) {
            console.error(UIText.MESSAGES.ERROR_STATUS_JSON, error);
          }

          pendingRequests--;
          this.finalizeDataLoading(pendingRequests, statusTables, errorTables);
        },
        (error) => this.handleApiError(error, --pendingRequests, statusTables, errorTables)
      );

      const errorsApiUrl = ApiEndpoints.NON_PBM.ERRORS(providerId);

      this.apiService.fetchDataForNonPbm(errorsApiUrl).subscribe(
        (response) => {
          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse?.Data?.length > 0) {
              parsedResponse.Data = parsedResponse.Data.map((item: any) => this.formatDateFields(item));
              const columns = Object.keys(parsedResponse.Data[0]);
              const title = `${UIText.LABELS.ERRORS_TITLE} (${this.getProviderName(providerId)})`;
              const dataSource = new MatTableDataSource<any>(parsedResponse.Data);

              errorTables.push({ title, dataSource, columns });
            }
          } catch (error) {
            console.error(UIText.MESSAGES.ERROR_ERROR_JSON, error);
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
    console.error(UIText.MESSAGES.API_FETCH_ERROR, error);
    if (pendingRequests === 0) {
      this.tableList = [...statusTables, ...errorTables];
      this.loading.set(false);
    }
  }

  getProviderName(providerId: number): string {
    return ProviderNames[providerId as NonPBMProviderEnum] || 'Unknown Provider';
  }

  formatDateFields(data: any): any {
    const dateFields = ['TRANSACTION_DATE', 'CREATION_FROM', 'CREATION_TO'];

    dateFields.forEach(field => {
      if (data[field]) {
        data[field] = this.convertToDateTime(data[field]);
      }
    });

    return data;
  }

  convertToDateTime(dateString: string): string {
    const match = dateString.match(/\d+/);
    if (!match) return dateString;

    const timestamp = parseInt(match[0], 10);
    const date = new Date(timestamp);

    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().
      padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().
        padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

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
      [ProviderNames[NonPBMProviderEnum.NAS]]: UIText.IMAGES.NAS,
      [ProviderNames[NonPBMProviderEnum.NEURON]]: UIText.IMAGES.NEURON
    };
    return images[card] || UIText.IMAGES.DEFAULT;
  }

  getCardImageFn = (card: string) => this.getCardImage(card);

  goBack() {
    this.router.navigate([UIText.ROUTES.HOMEPAGE]);
  }

}
