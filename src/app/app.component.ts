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
    let filteredArray: CasillaInterface[] = []
    for(let i = 0; i < 7; i ++){
      filteredArray.push(this.casillasArray[i])
    }

    let totalBoletas = this.casillasArray.reduce((total, casilla) => {
      return total + casilla.boletas
    }, 0);
    totalBoletas *= 1.0

    let columnas = (partidos_sin_coalicion.length + 2)

    console.log("casillas: ", this.casillasArray)
    // console.log("partidos: ", this.partidosArray)
    // console.log("coaliciones: ", coaliciones)
    // console.log("sin coaliciones: ", partidos_sin_coalicion)
    console.log("totalBoletas: ", totalBoletas)
    // console.log("array de ceros: ", this.generaNoContabilizaArray(this.casillasArray.length));
    this.resultArrayCasillas = this.initResultArray(this.casillasArray, partidos_sin_coalicion, this.generaNoContabilizaArray(this.casillasArray.length));
    console.log("result array: ", this.resultArrayCasillas);
    //this.generarMatrizCalculada(this.resultArrayCasillas, (totalBoletas/(partidos_sin_coalicion.length + 2)))
    let matriz = this.generarMatrizCalculada(this.resultArrayCasillas.length, columnas, (totalBoletas / columnas) )
    // let countOver = 0, filas = matriz.length
    // for(let i = 0; i < filas; i ++) {
    //   let sum = this.getSumColumns(matriz, i)
    //   if(sum > this.casillasArray[i].boletas) {
    //     countOver += 1
    //     console.log("******************antes-i: ", i, ", valores: ", matriz[i])
    //     console.log("*************antes-i: ", sum, ", boletas:", this.casillasArray[i].boletas)
    //   }
    // }
    // console.log("----------over: ", countOver)
    let matrizAjustada = this.ajustarDatosMatriz(matriz) //primera vuelta
    // let matrizAjustada2 = this.ajustarDatosMatriz(matrizAjustada1) //segunda vuelta
    // let matrizAjustada3 = this.ajustarDatosMatriz(matrizAjustada2) //segunda vuelta

    let countOver = -1, filas = matrizAjustada.length
    while(countOver !== 0) {
      for(let i = 0; i < filas; i ++) {
        if(i === -1)
          countOver = 0
        let sum = Math.floor(this.getSumColumns(matrizAjustada[i]))

        if(sum > this.casillasArray[i].boletas) {
          countOver += 1
          // console.log("******************ajustada-i: ", i, ", valores: ", matrizAjustada[i])
          // console.log("*************ajustada-i: ", sum, ", boletas:", this.casillasArray[i].boletas)
        } else {
          if(countOver == -1) countOver = 0
        }
      }
      // console.log("----------over: ", countOver)
      if(countOver !== 0) {
        countOver = -1
        matrizAjustada = this.ajustarDatosMatriz(matrizAjustada)
      }
    }
    // for(let i = 0; i < matrizAjustada.length; i ++) {
    //   console.log(`array: ${matrizAjustada[i]}, suma: ${this.getSumColumns(matrizAjustada[i])}, boletas: ${this.casillasArray[i].boletas}`)
    // }


    let matrizFinal: number[][] = []
    //************** CALCULAR MATRIZ FINAL ****************/
    for(let i = 0; i < this.casillasArray.length; i ++) {
      if(this.resultArrayCasillas[i].contabiliza) {
        let i_array: number[] = []
        let _votos = this.resultArrayCasillas[i].votos;
        // i_array.push(...matrizAjustada[i])
        for(let n = 0; n < matrizAjustada[i].length; n ++) {
          if(_votos[n].votos != -33) {
            i_array.push(Math.floor(matrizAjustada[i][n]));
          } else {
            console.log(`---------------index-NoContable: ${i}, ${this.resultArrayCasillas[i].contabiliza}`)
            i_array.push(-33);
          }
        }
        matrizFinal.push(...[i_array])
      } else {
        let i_array: number[] = []
        for(let m = 0; m < matrizAjustada[i].length; m ++) { i_array.push(-1) }
        matrizFinal.push(...[i_array]);
      }
    }

    console.log("matriz final: ", matrizFinal)

    //total columnas
    let acumColumna = 0, acum = 0;
    for(let i = 0; i < matrizAjustada[0].length; i ++) {
        for(let j = 0; j < matrizAjustada.length; j ++)
            if(matrizFinal[i][j] != -1 && matrizFinal[i][j] != -33) acum += Math.floor(matrizFinal[j][i])
        if(i > 0) acumColumna += acum;
        acum = 0;
    }
    acumColumna = Math.floor(acumColumna/(matrizAjustada[0].length - 1));
    let acumArray: number[] = [];

    for(let i = 0; i < matrizAjustada[0].length; i ++) {
      for(let j = 0; j < matrizAjustada.length; j ++)
          if(matrizFinal[j][i] != -1 && matrizFinal[j][i] != -33) acum += Math.floor(matrizFinal[j][i])
      if(i > 0) {
        acumArray.push(acum-acumColumna)
        console.log(`diferencia: ${(acum-acumColumna)}, acum: ${acum}, acumCol: ${acumColumna}`)
      }
      acum = 0;
    }
    console.log(acumArray)

    let _matrizFinal: number[][] = [...matrizFinal]
    let _acumArray: number[] = []
    _acumArray.push(...acumArray)
    for(let i = 0; i < _matrizFinal.length; i ++) {
      for(let j = 0; j < _matrizFinal[i].length; j ++) {
        let rand = this.getRandomInt(_acumArray[j])
        if(_acumArray[j] > 0 && ((_matrizFinal[i][j + 1] - rand) > 0)) {
          _matrizFinal[i][j] = _matrizFinal[i][j + 1] - (rand)
          _acumArray[j] = (_acumArray[j] - (rand))
          // console.log(`****** i: ${i}, j: ${j} - operacion: ${_matrizFinal[i][j]} - ${rand} = ${(_matrizFinal[i][j] - rand)}`)
          // j ++;
        }
      }
    }

    acum = 0;
    for(let i = 0; i < _matrizFinal[0].length; i ++) {
        for(let j = 0; j < _matrizFinal.length; j ++)
            if(_matrizFinal[i][j] != -1 && _matrizFinal[i][j] != -33) acum += (_matrizFinal[j][i])
        if(i > 0) { acumColumna += acum; }
        console.log(`columna: ${i}, suma: ${acum}`)
        acum = 0;
    }


    //*************** CALCULAR NUEVO PROMEDIO POR COLUMNA *******************/



  }

  //votos: arreglo de votos, sumaObjetivo:
  generarRandArray(partidos: NodoVotos[], sumaObjetivo: number): number[] {
    let array: number[] = []
    let returnVotos: number[] = []
    for(let i = 0; i < partidos.length; i ++) {
      if(partidos[i].votos !== -1 && partidos[i].votos !== -33) {
        let rand: number
        if(i === 0){
          rand = this.getRandomInt(14);
        } else {
          rand = this.getRandomInt(this.diferenciaSA(returnVotos, sumaObjetivo));
        }
        returnVotos.push(rand)
      } else {
        returnVotos.push(partidos[i].votos)
      }
    }
    return returnVotos
  }

  generarMatrizCalculada(filas: number, columnas: number, sumatoriaColumna: number): number[][] {
    let matriz: number[][] = [];

    for (let i = 0; i < filas; i++) {
        matriz[i] = [];
        for (let j = 0; j < columnas; j++) {
            let valorAleatorio;
            if (j === 0) {
                // Generar un número aleatorio entre 0 y 14 para la primera columna
                valorAleatorio = Math.floor(Math.random() * 15);
            } else {
                // Generar un número entero aleatorio no negativo para las otras columnas
                valorAleatorio = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            }
            matriz[i][j] = valorAleatorio;
        }
    }

    // Ajustar la sumatoria de cada columna
    for (let j = 0; j < columnas; j++) {
        let sumatoriaActual = matriz.reduce((acc, fila) => acc + fila[j], 0);
        // console.log("sumatoriaActual: ", sumatoriaActual)
        let factorEscala = sumatoriaColumna / sumatoriaActual;
        // console.log("sumatoriaColumna: ",sumatoriaColumna)
        matriz.forEach((fila) => {
          if(j !== 0)
            fila[j] *= factorEscala
        });
    }
    return matriz;
  }

  buscarIndiceRestar(j: number, valor: number, _matriz: number[][]): number {
    let i = -1;
    for(let n = 0; n < this.casillasArray.length;) {
      if((_matriz[n][j] - valor) > 0) {
        i = n;
        break;
      } else {
        n ++;
      }
    }
    return i;
  }

  ajustarDatosMatriz(retMatriz: number[][]): number[][] {
    let resp: CasillaResult[] = []
    let _matriz: number[][] = []

    let countOver = 0, filas = retMatriz.length, acumDiff = 0
    for(let i = 0; i < filas;) {
      let sum = this.getSumColumns(retMatriz[i])
      if(sum > this.casillasArray[i].boletas) {
        let valorDiferencia = sum - this.casillasArray[i].boletas
        while(valorDiferencia !== 0) {
          let i_noEsMayor = this.buscarEsMenor(retMatriz)
          let sumNoEsMayor = this.getSumColumns(retMatriz[i_noEsMayor])
          let diff = 0
          if((valorDiferencia + sumNoEsMayor) <= this.casillasArray[i_noEsMayor].boletas) { // en este caso entra si la sumatoria es menor al numero de boletas
            diff = valorDiferencia/(retMatriz[i_noEsMayor].length - 1)
            // console.log("*************** i: ", i, ", diff: ", diff)
          } else {
            let newValorDiferencia = valorDiferencia - (this.casillasArray[i_noEsMayor].boletas - sumNoEsMayor)
            diff = newValorDiferencia/(retMatriz[i_noEsMayor].length - 1)
            // console.log("--------------- i: ", i, ", diff: ", diff)
            // console.log("valorDiferencia: ", valorDiferencia, ", newValorDiferencia: ", newValorDiferencia)
            // console.log(`xxxxxxxxxxx-${(sumNoEsMayor + valorDiferencia)}, ${this.casillasArray[i_noEsMayor].boletas}`)
            // console.log(`zzzzzzzzzzz-${((sumNoEsMayor + valorDiferencia) - this.casillasArray[i_noEsMayor].boletas)}`)
            // console.log("i: ", i, ", diffotra: ", diff)
            valorDiferencia = newValorDiferencia
          }
          // console.log("antes i: ", i, ", ", retMatriz[i])
          // console.log(`sum-antes: ${this.getSumColumns(retMatriz, i)}, boletas: ${this.casillasArray[i].boletas}, diff: ${diff}`)
          // console.log(`i: ${i}, i_noEsMayor: ${i_noEsMayor}`)
          //_matriz[i] = _matriz[i].map(item => item - diff) // resta valores a columnas de la fila donde excedio el numero de boletas
          for(let n = 1; n < retMatriz[i].length; n ++) {
            if((retMatriz[i][n] - diff) >= 0) {
              retMatriz[i][n] -= diff
            } else {
              let _i = this.buscarIndiceRestar(n, (retMatriz[i][n]), retMatriz)
              retMatriz[_i][n] -= diff;
              // console.log(`i: ${_i}, diff: ${diff}, ${retMatriz[_i][n]} - ${diff} = ${((retMatriz[_i][n] - diff))}`)
            }

            // console.log(`${i}, ${n}: ${(_matriz[i][n] - diff)}`)
          }
          // console.log("despues i: ", i, ", ", retMatriz[i])
          // console.log(`sum-despues: ${this.getSumColumns(retMatriz, i)}, boletas: ${this.casillasArray[i].boletas}, diff: ${diff}`)
          for(let n = 1; n < retMatriz[i_noEsMayor].length; n ++) {
            retMatriz[i_noEsMayor][n] += diff
            // console.log(`${i}, ${n}: ${(_matriz[i_noEsMayor][n] + diff)}`)
          }

          // console.log("final-1 i: ", i, ", ", retMatriz[i])
          // console.log(`sum-final-1: ${this.getSumColumns(retMatriz[i])}, boletas: ${this.casillasArray[i].boletas}, diff: ${diff}`)
          // console.log("-------------------------")
          // console.log("final-2 i: ", i_noEsMayor, ", ", retMatriz[i_noEsMayor])
          // console.log(`sum-final-2: ${this.getSumColumns(retMatriz[i_noEsMayor])}, boletas: ${this.casillasArray[i_noEsMayor].boletas}, diff: ${diff}`)

          if((valorDiferencia + sumNoEsMayor) <= this.casillasArray[i_noEsMayor].boletas || i == i_noEsMayor) {
            i++
            valorDiferencia = 0
          }
          //_matriz[i_noEsMayor] = _matriz[i_noEsMayor].map(item => item + diff) // suma valores a columnas
        }
      } else {
        i++
      }
    }

    // countOver = 0, filas = retMatriz.length
    // for(let i = 0; i < filas; i ++) {
    //   let sum = this.getSumColumns(retMatriz, i)
    //   if(sum > this.casillasArray[i].boletas) {
    //     countOver += 1
        // console.log("******************ajustada-i: ", i, ", valores: ", retMatriz[i])
        // console.log("*************ajustada-i: ", sum, ", boletas:", this.casillasArray[i].boletas)
    //   }
    // }
    // console.log("----------over: ", countOver)

    for(let x = 0; x < retMatriz.length; x ++) {
      // console.log(`i: ${x}, sum: ${this.getSumColumns(retMatriz[x])}, boletas: ${this.casillasArray[x].boletas}`)
      _matriz.push([...retMatriz[x]])
    }

    return _matriz
  }

  getSumColumns(matriz: number[]): number {
    let sum = matriz.reduce((total, item) => {
      return total + item
    }, 0)

    return sum
  }

  buscarEsMenor(matriz: number[][]): number {
    let index = 0, filas = matriz.length

    for(let i = 0; i < filas; i ++) {
      let sum = this.getSumColumns(matriz[i])
      if((sum <= this.casillasArray[i].boletas)) {
        // console.log(`XXXXXXXXXXXXXXXXXXXXXX-compara: ${(sum <= this.casillasArray[i].boletas)} - ${sum}, ${this.casillasArray[i].boletas}`)
        index = i
        break
      }
    }
    return index
  }


  diferenciaSA(numbers: number[], objetivo: number): number {//diferencia entre un array y la suma objetivo
    let _total = 0;
    if(numbers.length > 0) {
      _total = numbers.reduce((total, item) => {
        let sum = (item !== -1 && item !== -33) ? item : 0;
        return total + sum
      });
    }
    console.log((objetivo - _total))
    return objetivo - _total
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
    let randIndex = this.getRandomInt((partidosArray.length + 1))

    if(esContable === -33 && randIndex === partidosArray.length) {
      arrayNodos.push({ nombre: "representantesQueVotaron", votos: esContable })
      // console.log("idCasillaPREP: ", idCasillaPREP)
    }else {
      arrayNodos.push({ nombre: "representantesQueVotaron", votos: 0 })
    }
    for(let j = 0; j < partidosArray.length; j ++) {
      if(esContable === -33 && randIndex === j){
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: esContable })
        // console.log("idCasillaPREP: ", idCasillaPREP)
      }else{
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: 0 })
      }
    }

  // representantesQueVotaron: number;
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

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
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
