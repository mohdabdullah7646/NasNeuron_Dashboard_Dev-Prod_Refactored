import { AfterViewInit, Component, inject, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LogoutButtonComponent } from "../../../logout-button/logout-button.component";
import { Router } from '@angular/router';

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
      'NAS UAE': 'assets/images/nas-uae.svg',
      'Neuron': 'assets/images/neuron.svg'
    };
    return images[card] || 'assets/images/default.svg';
  }

  getCardImageFn = (card: string) => this.getCardImage(card);

  fetchPBMData() {
    this.loading.set(true);
    const clientIds: number[] = [];
    if (this.selectedCards().includes('NAS UAE')) clientIds.push(1);
    if (this.selectedCards().includes('Neuron')) clientIds.push(8);

    const statusValues = [1, 2, 3];
    let pendingRequests = clientIds.length * statusValues.length;

    const initialStatusTables: TableData[] = [];
    const otherStatusTables: TableData[] = [];
    const errorStatusTables: TableData[] = [];

    this.tableList = [];

    clientIds.forEach(clientId => {
      statusValues.forEach(status => {
        const apiUrl = `https://pbm.qaservices.nnhs.ae/PBMConnectAPI/j/PBMTxnDashBoard.svc/GET_PBM_TXN_NOTIFICATION_DASHBOARD?CLIENTID=${clientId}&STATUS=${status}`;

        this.apiService.fetchData(apiUrl).subscribe((data) => {
          if (data.length > 0) {

            // Convert date fields in each row
            const formattedData = data.map((item: any) => this.formatDateFields(item));

            let columns = Object.keys(data[0]);

            if (status === 1 || status === 2) {
              columns = columns.filter(col => !['REGULATOR', 'REMARKS', 'CREATION_DATE'].includes(col));
            }
            else if (status === 3) {
              columns = columns.filter(col => !['FLOWSTATUS', 'CREATION_DATE'].includes(col));
            }

            columns = columns.map(col => col === 'FLOWSTATUS' ? 'STATUS' : col);

            const title = this.getTableTitle(clientId, status);
            const dataSource = new MatTableDataSource<any>(data);

            const tableData: TableData = { title, dataSource, columns };

            if (status === 1) {
              initialStatusTables.push(tableData);
            }
            else if (status === 2) {
              otherStatusTables.push(tableData);
            }
            else if (status === 3) {
              errorStatusTables.push(tableData);
            }
          }

          pendingRequests--;
          if (pendingRequests === 0) {
            this.tableList = [...initialStatusTables, ...otherStatusTables, ...errorStatusTables];
            this.loading.set(false);
          }

        }, (error) => {
          console.error(`Error fetching PBM data for ClientId ${clientId} and Status ${status}:`, error);
          pendingRequests--;
          if (pendingRequests === 0) {
            this.tableList = [...initialStatusTables, ...otherStatusTables, ...errorStatusTables];
            this.loading.set(false);
          }
        });
      });
    });
  }

  getTableTitle(clientId: number, status: number): string {
    const clientName = clientId === 1 ? 'NAS UAE' : 'Neuron';
    const statusName = status === 1 ? 'INITIAL STATUS' : status === 2 ? 'OTHER STATUS' : 'ERROR STATUS';
    return `PBM - ${statusName} : (${clientName})`;
  }

  /**
 * Converts date fields in the API response to `MM/DD/YYYY HH:MM` format.
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

  getCellValue(row: any, column: string): string {
    let value = column === 'STATUS' ? row['FLOWSTATUS'] : row[column];
    return value === null || value === undefined || value === '' ? 'Null' : value;
}

  goBack() {
    this.router.navigate(['/homepage']);
  }
}
