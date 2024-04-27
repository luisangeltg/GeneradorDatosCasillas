import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CasillaInterface, CasillasResponse, CatdResponse, PartidoInterface, PartidosResponse } from './interfaces';
import { AppSettings } from '../app.settings';

@Injectable({ providedIn: 'root' })
export class ServicesClass {

  constructor(private http: HttpClient) { }

  getCasillas(tipoCATD: number): Observable<CasillasResponse> {
    return this.http.get<CasillasResponse>(`${AppSettings.URL_BASE}/casillas.json`).pipe(
      map((response) => {
        const casillas = response.CasillasResponse.filter((casilla) => {
          return (
            (casilla.idTipoCATD == tipoCATD)
          )
        });
        return { CasillasResponse: casillas }
      }),
      catchError((error) => {
        return of({CasillasResponse: []})
      })
    );
  }

  getCasillasByCatd(tipoCATD: number, CATD: string): Observable<CasillasResponse> {
    return this.http.get<CasillasResponse>(`${AppSettings.URL_BASE}/casillas.json`).pipe(
      map((response) => {
        const casillas = response.CasillasResponse.filter((casilla) => {
          return (
            (casilla.CATD == CATD && casilla.idTipoCATD == tipoCATD)
          )
        });
        return { CasillasResponse: casillas }
      }),
      catchError((error) => {
        return of({CasillasResponse: []})
      })
    );
  }

  getCATD(tipoCATD: number): Observable<CatdResponse> {
    return this.http.get<CatdResponse>(`${AppSettings.URL_BASE}/catd.json`).pipe(
      map((response) => {
        const catds = response.CatdResponse.filter((catd) => {
          return (
            (catd.idTipoCATD == tipoCATD)
          )
        });
        return { CatdResponse: catds}
      }),
      catchError((error) => {
        return of({CatdResponse: []})
      })
    );
  }

  getPartidos(): Observable<PartidosResponse> {
    return this.http.get<PartidosResponse>(`${AppSettings.URL_BASE}/partidos.json`);
  }
}
