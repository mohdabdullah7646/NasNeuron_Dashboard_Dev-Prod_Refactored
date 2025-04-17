import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient : HttpClient) { }

  fetchDataForPbm(endpoint: string): Observable<any[]> {
    const fullUrl = `${environment.pbmApiUrl}${endpoint}`;
    return this.httpClient.get<any[]>(fullUrl);
  }

  fetchDataForNonPbm(endpoint: string): Observable<any> {
    const fullUrl = `${environment.nonPbmApiUrl}${endpoint}`;
    return this.httpClient.get<any>(fullUrl, { responseType: 'text' as 'json' }).pipe(
      catchError(error => throwError(() => error))
    );
  }

}
