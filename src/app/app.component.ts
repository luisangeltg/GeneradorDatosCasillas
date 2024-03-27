import { Component, OnInit } from '@angular/core';
import { CasillaInterface, CatdInterface, CatdResponse, PartidoInterface } from './services/interfaces';
import { ServicesClass } from './services/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private services: ServicesClass){
  }
  title = 'DistribucionVotos';
  casillasArray!: CasillaInterface[];
  partidosArray!: PartidoInterface[];
  catdArray!: CatdInterface[];

  ngOnInit(): void {
    this.services.getCATD().subscribe((response) => {
      this.catdArray = response.CatdResponse;
      this.services.getCasillasByCatd(this.catdArray[0].CATD).subscribe((response) => {
        this.casillasArray = response.CasillasResponse
      });
    });
    this.services.getPartidos().subscribe((response) => {
      this.partidosArray = response.PartidosResponse
    });
  }

  clickBtn(): void {
    const partidos_sin_coalicion = this.partidosArray.filter((partido) => partido.coalicion === false)
    const coaliciones = this.partidosArray.filter((partido) => partido.coalicion === true)

    let totalBoletas = this.casillasArray.reduce((total, casilla) => {
      return total + casilla.listaNominal
    }, 0)

    console.log("casillas: ", this.casillasArray)
    console.log("partidos: ", this.partidosArray)
    console.log("coaliciones: ", coaliciones)
    console.log("sin coaliciones: ", partidos_sin_coalicion)
    console.log("totalBoletas: ", totalBoletas)

  }
}
