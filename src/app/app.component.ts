import { Component, OnInit } from '@angular/core';
import { CasillaInterface, CasillaResult, CatdInterface, CatdResponse, NodoVotos, PartidoInterface } from './services/interfaces';
import { ServicesClass } from './services/services';
import { ExcelService } from './services/excel.service';
import { GeneradorService } from './services/generador.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private services: ServicesClass, private excelService: ExcelService, private generadorService: GeneradorService){


  }
  title = 'DistribucionVotos';
  casillasArray!: CasillaInterface[];
  partidosArray!: PartidoInterface[];
  catdArray!: CatdInterface[];
  resultArrayCasillas!: CasillaResult[];
  selected_CATD: string = 'Todos';
  selected_TipoCATD: number = 1;
  selected_CatdVersion: number = 0;


  ngOnInit(): void {
    this.changeTipoCATD()

  }

  generarData(): void {
    let partidos_sin_coalicion = null
    let coaliciones

    if(this.selected_CATD == '14 Victoria') {
      partidos_sin_coalicion = this.partidosArray.filter((partido) => partido.coalicion === false)
      coaliciones = this.partidosArray.filter((partido) => partido.coalicion === true)
    } else {
      partidos_sin_coalicion = this.partidosArray.filter((partido) => partido.coalicion === false && partido.independiente == false)
      coaliciones = this.partidosArray.filter((partido) => partido.coalicion === true)
    }


    let totalBoletas = this.casillasArray.reduce((total, casilla) => {
      return total + casilla.boletas
    }, 0);

    totalBoletas *= 0.15

    let columnas = (partidos_sin_coalicion.length + 3)

    console.log("casillas: ", this.casillasArray)
    // console.log("partidos: ", this.partidosArray)
    console.log("coaliciones: ", coaliciones)
    console.log("sin coaliciones: ", partidos_sin_coalicion)
    console.log("totalBoletas: ", totalBoletas)
    console.log("array de ceros: ", this.generadorService.generaNoContabilizaArray(this.casillasArray.length));
    this.resultArrayCasillas = this.generadorService.initResultArray(this.casillasArray, partidos_sin_coalicion, this.generadorService.generaNoContabilizaArray(this.casillasArray.length));
    this.generadorService.initResults(this.resultArrayCasillas);

    console.log("result array: ", this.resultArrayCasillas);
    //this.generarMatrizCalculada(this.resultArrayCasillas, (totalBoletas/(partidos_sin_coalicion.length + 2)))
    let matriz = this.generadorService.generarMatrizCalculada(this.resultArrayCasillas.length, columnas, (totalBoletas / columnas) )
    let matrizFinal = this.generadorService.ajustarSumatoriaFinalMatriz(matriz)
    console.log("matriz final: ", matrizFinal)
    this.generadorService.inicializarValoresArrayCasillas(matrizFinal, coaliciones);
    console.log("Print result array: ", this.resultArrayCasillas);

    for(let i = 0; i < columnas; i ++) {
      let acum = 0
      for(let j = 0; j < this.resultArrayCasillas.length; j ++) {
        if(
          this.resultArrayCasillas[j].contabiliza == 1 &&
          this.resultArrayCasillas[j].votos[i].votos > 0
        ) acum += this.resultArrayCasillas[j].votos[i].votos
        // else console.log(`****error-val: ${this.resultArrayCasillas[j].votos[i].votos}, j: ${j}, i: ${i}`)
        // if(this.resultArrayCasillas[j].votos[i].votos < -3) console.log(`partido: ${this.resultArrayCasillas[0].votos[i].nombre}, sum: ${acum}`)
      }
    }
    let jsonResponse = []
    for(let i = 0; i < this.resultArrayCasillas.length; i ++) {
      // console.log(`i: ${i}, sobrantes: ${this.resultArrayCasillas[i].boletasSobrantes}, boletas`)
      jsonResponse.push(this.generadorService.convertirVotosACasillaResult(this.resultArrayCasillas[i]))
    }
    console.log("jsonResponse: ", jsonResponse)


    this.excelService.exportToExcel(
      jsonResponse,
      this.selected_CATD + " - CASILLAS"
    )
  }

  changeSelect() {
    //1: Distrito, 2: Municipio
    console.log("selected_catd: ", this.selected_CATD, "tipoCATD: ", this.selected_TipoCATD)

    if(this.selected_CATD == 'Todos') {
      //obtiene partidos y coaliciones
      this.services.getPartidos(this.selected_CatdVersion).subscribe((response) => {
        this.partidosArray = response.PartidosResponse
      });

      //obtiene casillas
      this.services.getCasillas(this.selected_TipoCATD).subscribe((response) => {
        this.casillasArray = response.CasillasResponse

        this.generadorService.initCasillas(this.casillasArray)
        console.log("changeCasillas: ", this.casillasArray)
        this.generadorService.initResults(this.resultArrayCasillas)
      });
    } else {
      let index = this.catdArray.findIndex((catd) => catd.CATD === this.selected_CATD);

      //obtiene partidos
      this.selected_CatdVersion = this.catdArray[index].version
      this.services.getPartidos(this.selected_CatdVersion).subscribe((response) => {
        this.partidosArray = response.PartidosResponse
      });
      //obtiene casillas
      this.services.getCasillasByCatd(this.selected_TipoCATD, this.catdArray[index].CATD).subscribe((response) => {
        this.casillasArray = response.CasillasResponse

        this.generadorService.initCasillas(this.casillasArray)
        console.log("changeCasillas: ", this.casillasArray)
        this.generadorService.initResults(this.resultArrayCasillas)
      });
    }
  }

  changeTipoCATD() {
    this.services.getCATD(this.selected_TipoCATD).subscribe((response) => {
      this.catdArray = response.CatdResponse;
      this.selected_CATD = 'Todos'
      this.changeSelect()
    });
  }
}
