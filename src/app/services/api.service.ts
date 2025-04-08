import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient : HttpClient) { }

  fetchDataForPbm(apiUrl : string) : Observable<any[]>{
    return this.httpClient.get<any[]>(apiUrl);
  }

  fetchDataForNonPbm(endpoint: string): Observable<any> {
    const apiUrl = `/RegulatorsAPI${endpoint}`;
    console.log("Fetching API:", apiUrl);
  
    return this.httpClient.get<any>(apiUrl, { responseType: 'text' as 'json' }).pipe(
      tap(response => console.log("Serice Response:", response)),
      catchError(error => {
        console.error("API Error Response:", error);
        return throwError(error);
      })
    );
  }
    
}
