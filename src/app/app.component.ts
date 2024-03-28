import { Component, OnInit } from '@angular/core';
import { CasillaInterface, CasillaResult, CatdInterface, CatdResponse, NodoVotos, PartidoInterface } from './services/interfaces';
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
  resultArrayCasillas!: CasillaResult[];

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
    }, 0);

    console.log("casillas: ", this.casillasArray)
    // console.log("partidos: ", this.partidosArray)
    // console.log("coaliciones: ", coaliciones)
    // console.log("sin coaliciones: ", partidos_sin_coalicion)
    // console.log("totalBoletas: ", totalBoletas)
    console.log("array de ceros: ", this.generaNoContabilizaArray(this.casillasArray.length));
    this.resultArrayCasillas = this.initResultArray(this.casillasArray, partidos_sin_coalicion, this.generaNoContabilizaArray(this.casillasArray.length));
    console.log("result array: ", this.resultArrayCasillas);

  }

  getArrayRandN(size: number, max: number) {

  }

  initResultArray(casillasArray: CasillaInterface[], partidosArray: PartidoInterface[], cerosArray: number[]): CasillaResult[] {
    let casillaResultArray: CasillaResult[] = []
    for(let i = 0; i < cerosArray.length; i ++) {
      let arrayNodos = this.generarNodosArray(cerosArray[i], partidosArray, casillasArray[i].idCasillaPREP);
      let item: CasillaResult = {
        idCasillaPREP: casillasArray[i].idCasillaPREP,
        distrito: casillasArray[i].Distrito,
        municipio: casillasArray[i].Municipio,
        seccion: Number(casillasArray[i].seccion),
        casilla: casillasArray[i].claveCasilla,
        listaNominal: casillasArray[i].listaNominal,
        boletas: casillasArray[i].boletas,
        boletasSobrantes: (cerosArray[i] !== -1) ? 0 : cerosArray[i],
        personasQueVotaron: (cerosArray[i] !== -1) ? 0 : cerosArray[i],
        representantesQueVotaron: (cerosArray[i] !== -1) ? 0 : cerosArray[i],
        votosSacadosDeLaUrna: (cerosArray[i] !== -1) ? 0 : cerosArray[i],
        votos: arrayNodos,
        total: (cerosArray[i] !== -1) ? 0 : cerosArray[i],
        contabiliza: (cerosArray[i] !== -1) ? true : false,
        urna_electronica: false
      }
      casillaResultArray.push(item)
    }
    return casillaResultArray
  }

  generarNodosArray(esContable: number, partidosArray: PartidoInterface[], idCasillaPREP: number): NodoVotos[] {
    let arrayNodos: NodoVotos[] = []
    let randIndex = this.getRandomInt(0, (partidosArray.length + 1))
    for(let j = 0; j < partidosArray.length; j ++) {
      if(esContable === -33 && randIndex === j){
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: esContable })
        // console.log("idCasillaPREP: ", idCasillaPREP)
      }else{
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: 0 })
      }
    }

    if(esContable === -33 && randIndex === partidosArray.length) {
      arrayNodos.push({ nombre: "candidatosNoRegistrados", votos: esContable })
      // console.log("idCasillaPREP: ", idCasillaPREP)
    }else {
      arrayNodos.push({ nombre: "candidatosNoRegistrados", votos: 0 })
    }
    if(esContable === -33 && randIndex === partidosArray.length + 1) {
      arrayNodos.push({ nombre: "votosNulos", votos: esContable })
      // console.log("idCasillaPREP: ", idCasillaPREP)
    }else {
      arrayNodos.push({ nombre: "votosNulos", votos: 0 })
    }
    return arrayNodos
  }

  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  generaNoContabilizaArray(size: number): number[] {
    let porcentaje_sin_contabilizar = size * (10 / 100);
    let cantidad_sin_contabilizar = Math.ceil(porcentaje_sin_contabilizar);
    let array_sin_contabilizar = this.generarArrayDeUnosYCeros(size, cantidad_sin_contabilizar);
    return array_sin_contabilizar
  }

  generarArrayDeUnosYCeros(size: number, cerosQuantity: number): number[] {
    if (cerosQuantity > size) { throw new Error("El número de unos no puede ser mayor que el tamaño del array."); }
    const array: number[] = [];
    // Agregar ceros al array
    for (let i = 0; i < cerosQuantity/2; i++) { array.push(-1); }
    for (let i = Math.ceil(cerosQuantity/2); i < cerosQuantity; i++) { array.push(-33); }
    // Agregar unos al array para completar el tamaño
    for (let i = cerosQuantity; i < size; i++) { array.push(0); }
    // Mezclar el array aleatoriamente
    array.sort(() => Math.random() - 0.5);
    console.log("leng: ", array.length)
    return array;
  }
}
