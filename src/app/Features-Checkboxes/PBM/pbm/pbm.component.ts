import { AfterViewInit, Component, inject, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LogoutButtonComponent } from "../../../logout-button/logout-button.component";
import { Router } from '@angular/router';
import { UIText } from '../../../shared/constants/ui-text.constants';
import { PBMProviderEnum, PBMProviderNames, PBMStatusEnum, PBMStatusLabels } from '../../../shared/enums/provider.enum';
import { ApiEndpoints } from '../../../shared/constants/api-endpoints.constants';

interface TableData {
  title: string;
  dataSource: MatTableDataSource<any>;
  columns: string[];
}

@Component({
  selector: 'app-pbm',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, LogoutButtonComponent],
  templateUrl: './pbm.component.html',
  styleUrl: './pbm.component.css'
})
export class PBMComponent implements OnInit, AfterViewInit {

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
    this.fetchPBMData();
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
        [PBMProviderNames[PBMProviderEnum.NAS]]: UIText.IMAGES.NAS,
        [PBMProviderNames[PBMProviderEnum.NEURON]]: UIText.IMAGES.NEURON
      };
      return images[card] || UIText.IMAGES.DEFAULT;
    }

  getCardImageFn = (card: string) => this.getCardImage(card);

  fetchPBMData() {
    this.loading.set(true);
    const clientIds: number[] = [];
   
    if (this.selectedCards().includes(PBMProviderNames[PBMProviderEnum.NAS])) clientIds.push(PBMProviderEnum.NAS);
    if (this.selectedCards().includes(PBMProviderNames[PBMProviderEnum.NEURON])) clientIds.push(PBMProviderEnum.NEURON);

    const statusValues = [PBMStatusEnum.InitialStatus, PBMStatusEnum.OtherStatus, PBMStatusEnum.ErrorStatus];
    let pendingRequests = clientIds.length * statusValues.length;
    let receivedValidData = false;

    const initialStatusTables: TableData[] = [];
    const otherStatusTables: TableData[] = [];
    const errorStatusTables: TableData[] = [];

    this.tableList = [];

    clientIds.forEach(clientId => {
      statusValues.forEach(status => {

        const apiUrl = ApiEndpoints.PBM.DASHBOARD(clientId, status);

        this.apiService.fetchDataForPbm(apiUrl).subscribe((data) => {
          if (data && data.length > 0) {
            receivedValidData = true;

            const formattedData = data.map((item: any) => this.formatDateFields(item));

            let columns = Object.keys(data[0]);

            if (status === PBMStatusEnum.InitialStatus || status === PBMStatusEnum.OtherStatus) {
              columns = columns.filter(col => !['REGULATOR', 'REMARKS', 'CREATION_DATE'].includes(col));
            }
            else if (status === PBMStatusEnum.ErrorStatus) {
              columns = columns.filter(col => !['FLOWSTATUS', 'CREATION_DATE'].includes(col));
            }

            columns = columns.map(col => col === 'FLOWSTATUS' ? 'STATUS' : col);

            const title = this.getTableTitle(clientId, status);
            const dataSource = new MatTableDataSource<any>(formattedData);
            const tableData: TableData = { title, dataSource, columns };

            if (status === PBMStatusEnum.InitialStatus) {
              initialStatusTables.push(tableData);
            }
            else if (status === PBMStatusEnum.OtherStatus) {
              otherStatusTables.push(tableData);
            }
            else if (status === PBMStatusEnum.ErrorStatus) {
              errorStatusTables.push(tableData);
            }
          }

          pendingRequests--;
          if (pendingRequests === 0) {
            this.finalizePBMTableList(receivedValidData, initialStatusTables, otherStatusTables, errorStatusTables);
          }

        }, (error) => {
          console.error(`Error fetching PBM data for ClientId ${clientId} and Status ${status}:`, error);
          pendingRequests--;
          if (pendingRequests === 0) {
            this.finalizePBMTableList(receivedValidData, initialStatusTables, otherStatusTables, errorStatusTables);
          }
        });
      });
    });
  }

  getTableTitle(clientId: number, status: PBMStatusEnum): string {
    const clientName = PBMProviderNames[clientId as PBMProviderEnum];
    const statusName = PBMStatusLabels[status];
    return `${UIText.LABELS.PBM_TITLE} ${statusName} (${clientName})`;
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
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) return dateString;
  
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  getCellValue(row: any, column: string): string {
    let value = column === 'STATUS' ? row['FLOWSTATUS'] : row[column];
    return value === null || value === undefined || value === '' ? 'Null' : value;
  }

  finalizePBMTableList(
    receivedValidData: boolean,
    initialStatusTables: TableData[],
    otherStatusTables: TableData[],
    errorStatusTables: TableData[]
  ) {
    if (receivedValidData) {
      this.tableList = [...initialStatusTables, ...otherStatusTables, ...errorStatusTables];
    } else {
      this.tableList = [{
        title: 'No PBM current data found',
        dataSource: new MatTableDataSource<any>([]),
        columns: []
      }];
    }
    this.loading.set(false);
  }

  goBack() {
    this.router.navigate([UIText.ROUTES.HOMEPAGE]);
  }
}
