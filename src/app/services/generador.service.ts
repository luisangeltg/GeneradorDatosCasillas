import { Injectable } from '@angular/core';
import { CasillaInterface, CasillaResult, CatdInterface, NodoVotos, PartidoInterface } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class GeneradorService {


  casillasArray!: CasillaInterface[];
  partidosArray!: PartidoInterface[];
  catdArray!: CatdInterface[];
  resultArrayCasillas!: CasillaResult[];

  constructor() { }

  initCasillas(_casillasArray: CasillaInterface[]){
    this.casillasArray = _casillasArray
  }

  initPartidos(_partidosArray: PartidoInterface[]) {
    this.partidosArray = _partidosArray
  }

  initCatd(_catdArray: CatdInterface[]) {
    this.catdArray = _catdArray
  }

  initResults(_resultArrayCasillas: CasillaResult[]) {
    this.resultArrayCasillas = _resultArrayCasillas
  }

  // Función para convertir los votos en atributos dinámicos de CasillaResult
  convertirVotosACasillaResult(casilla: CasillaResult): {[key: string]: any} { //-1: sin dato, -2: sin acta, -3: ilegible
    let votos = casilla.votos

    const mapeoBoletas: { [key: number]: string } = {
      '-1': 'SIN DATO',
      '-2': 'SIN ACTA',
      '-3': 'ILEGIBLE'
    };

    const casillaJSON: { [key: string]: any } = { ...casilla };
    if(!(casilla.contabiliza == 1)) {
      casillaJSON['boletas'] = mapeoBoletas[casilla.boletas]
      casillaJSON['listaNominal'] = mapeoBoletas[casilla.listaNominal]
      casillaJSON['boletasSobrantes'] = mapeoBoletas[casilla.boletasSobrantes]
      casillaJSON['personasQueVotaron'] = mapeoBoletas[casilla.personasQueVotaron]
      casillaJSON['votosSacadosDeLaUrna'] = mapeoBoletas[casilla.votosSacadosDeLaUrna]
      casillaJSON['total'] = mapeoBoletas[casilla.total]
    }
    // Iterar sobre los votos y asignarlos como atributos de la casilla
    votos.forEach((voto) => {
      if(voto.votos < 0) casillaJSON[voto.nombre] = mapeoBoletas[voto.votos]
      else casillaJSON[voto.nombre] = voto.votos;
    });

    return casillaJSON;
  }


  inicializarValoresArrayCasillas(matriz: number[][], coaliciones: PartidoInterface[]) {
    let porcentaje_sin_contabilizar = Math.ceil(matriz.length * (10 / 100));
    let array_variaciones = this.ordenarVariacionesCeros(porcentaje_sin_contabilizar);

    for(let i = 0, countNoContabiliza = 0; i < this.resultArrayCasillas.length; i ++) {
      if(this.resultArrayCasillas[i].contabiliza == 1) {
        for(let j = 0; j < this.resultArrayCasillas[i].votos.length; j ++) {
          let nodo_voto = this.resultArrayCasillas[i].votos[j]
          if(nodo_voto.votos == -33) {
            let randNoContabiliza: number = ((this.getRandomInt(2) + 1) * -1)
            // console.log(`noContabiliza1: ${countNoContabiliza}, i: ${i}, j: ${j}, rand: ${randNoContabiliza}, condicion: ${(countNoContabiliza > porcentaje_sin_contabilizar)}`)
            this.resultArrayCasillas[i].votos[j].votos = (countNoContabiliza > porcentaje_sin_contabilizar) ? randNoContabiliza : array_variaciones[countNoContabiliza]
            countNoContabiliza ++;
            // console.log(`index-mal: ${i}, j: ${j}`)
          } else {
            this.resultArrayCasillas[i].votos[j].votos = matriz[i][j]
          }
        }
        // let votosCoaliciones: PartidoInterface[] = []
        let votosCoaliciones: NodoVotos[] = []
        for(let n = 0; n < coaliciones.length; n ++) {
          let partidos_de_coalicion = coaliciones[n].siglasPartido.split('_')
          votosCoaliciones.push({nombre: coaliciones[n].siglasPartido, votos: 0, tipo: 3})
          for(let s = 0; s < partidos_de_coalicion.length; s ++) {
            for(let m = 0; m < this.resultArrayCasillas[i].votos.length; m ++) {
              if(
                partidos_de_coalicion[s] == this.resultArrayCasillas[i].votos[m].nombre &&
                this.resultArrayCasillas[i].votos[m].votos > 0
              ) {
                votosCoaliciones[n].votos += this.resultArrayCasillas[i].votos[m].votos
              }
            }
            // let index = this.resultArrayCasillas[i].votos.findIndex(voto => voto.nombre === partidos_de_coalicion[k])
            // this.resultArrayCasillas[i].votos[index].votos
          }
        }
        this.resultArrayCasillas[i].votos.push(...votosCoaliciones)
        if(this.resultArrayCasillas[i].contabiliza == 1) {
          this.resultArrayCasillas[i].boletasSobrantes = (this.resultArrayCasillas[i].boletas - this.obtenerSumatoriaTotalPartidosCoaliciones(i))
          this.resultArrayCasillas[i].total = this.obtenerSumatoriaTotalPartidosCoaliciones(i)
          this.resultArrayCasillas[i].personasQueVotaron = this.obtenerSumatoriaTotalPartidosCoaliciones(i)
        }
        // console.log("coaliciones: ", votosCoaliciones, ", normales: ", this.resultArrayCasillas[i].votos)
      } else {
        this.resultArrayCasillas[i].boletasSobrantes = array_variaciones[countNoContabiliza]
        this.resultArrayCasillas[i].total = array_variaciones[countNoContabiliza]
        this.resultArrayCasillas[i].personasQueVotaron = array_variaciones[countNoContabiliza]

        for(let j = 0; j < this.resultArrayCasillas[i].votos.length; j ++) {
          this.resultArrayCasillas[i].votos[j].votos = array_variaciones[countNoContabiliza]
        }
        let votosCoaliciones: NodoVotos[] = []
        for(let m = 0; m < coaliciones.length; m ++) {
          let randNoContabiliza: number = ((this.getRandomInt(2) + 1) * -1)
          votosCoaliciones.push({ nombre: coaliciones[m].siglasPartido, votos: (countNoContabiliza > porcentaje_sin_contabilizar) ? array_variaciones[countNoContabiliza] : randNoContabiliza, tipo: 3 })
          // console.log(`noContabiliza3: ${countNoContabiliza}, i: ${i}`)
        }
        this.resultArrayCasillas[i].votos.push(...votosCoaliciones)
        countNoContabiliza ++
      }
    }
  }

  obtenerSumatoriaTotalPartidosCoaliciones(i: number): number {
    let sum = this.resultArrayCasillas[i].votos.reduce((total, partido) => {
      let votos = (
          partido.nombre !== 'representantesQueVotaron' &&
          partido.nombre !== 'candidatosNoRegistrados' &&
          partido.nombre !== 'votosNulos' &&
          partido.votos > 0
        ) ? partido.votos : 0
      return total + (votos)
    }, 0)
    return sum
  }

  ordenarVariacionesCeros(size: number): number[] {
    let array_variaciones: number[] = []
    let val = -1;
    while(size > 0) {
      if(val == -4)
        val = -1
      array_variaciones.push(val)
      val--
      size--
    }
    return array_variaciones
  }

  verificarBoletas(matriz: number[][]) {
    for(let i = 0; i < this.resultArrayCasillas.length; i ++) {
      if(this.getSumColumns(matriz[i])>this.resultArrayCasillas[i].boletas)
        console.log(`supera-i: ${i}`)
    }
  }

  ajustarSumatoriaFinalMatriz(matriz: number[][]): number[][] {
    let matrizAjustada = this.ajustarDatosMatriz(matriz) //primera vuelta

    let countOver = -1, filas = matrizAjustada.length
    while(countOver !== 0) {
      for(let i = 0; i < filas; i ++) {
        if(i === -1)
          countOver = 0
        let sum = Math.floor(this.getSumColumns(matrizAjustada[i]))

        if(sum > this.casillasArray[i].boletas) {
          countOver += 1
        } else {
          if(countOver == -1) countOver = 0
        }
      }
      if(countOver !== 0) {
        countOver = -1
        matrizAjustada = this.ajustarDatosMatriz(matrizAjustada)
      }
    }


    let matrizFinal: number[][] = []
    //************** CALCULAR MATRIZ FINAL ****************/
    for(let i = 0; i < this.casillasArray.length; i ++) {
      if(this.resultArrayCasillas[i].contabiliza == 1) {
        let i_array: number[] = []
        let _votos = this.resultArrayCasillas[i].votos;
        // i_array.push(...matrizAjustada[i])
        for(let n = 0; n < matrizAjustada[i].length; n ++) {
          if(_votos[n].votos != -33) {
            i_array.push(Math.floor(matrizAjustada[i][n]));
          } else {
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

    for(let i = 1; i < matrizAjustada[0].length; i ++) {//se hace conteo de las columnas antes de ajustar cantidades
      for(let j = 0; j < matrizAjustada.length; j ++)
          if(matrizFinal[j][i] != -1 && matrizFinal[j][i] != -33) { acum += (matrizFinal[j][i]); }
      if(i > 0) {
        acumArray.push(acum-acumColumna)
        console.log(`col: ${i}, diferencia: ${(acum-acumColumna)}, acum: ${acum}, acumCol: ${acumColumna}`)
      }
      acum = 0;
    }
    console.log(acumArray)

    let _matrizFinal: number[][] = [...matrizFinal]
    let _acumArray: number[] = []
    _acumArray.push(...acumArray)
    while(this.getSumColumns(_acumArray) > 0) {
      for(let j = 0, k = 1; j < _acumArray.length; j ++, k ++) {
        for(let i = 0; i < _matrizFinal.length; i ++) {
          let rand = 0
          let mat_value = _matrizFinal[i][k]
          if(mat_value !== -1 && mat_value !== -33) {
            rand = this.getRandomInt(_acumArray[j])
            if(rand == 0 && _acumArray[j] == 1)
              rand = 1
          }
          if(
              _acumArray[j] !=0 &&
              ((mat_value - (rand)) >= 0 && rand !== 0) &&
              (this.getSumColumns(_matrizFinal[i]) - (rand)) <= this.resultArrayCasillas[i].boletas
            ) {
              _matrizFinal[i][k] = _matrizFinal[i][k] - (rand)
              _acumArray[j] = (_acumArray[j] - (rand))
          }
        }
      }
    }

    acum = 0;
    for(let i = 1; i < _matrizFinal[0].length; i ++) { // se hace conteo columnas despues de hacer ajuste en sumatorias
        for(let j = 0; j < _matrizFinal.length; j ++)
            if(_matrizFinal[j][i] != -1 && _matrizFinal[j][i] != -33) acum += (_matrizFinal[j][i])
        if(i > 0) {
          acumColumna += acum;
          console.log(`columna: ${i}, suma: ${acum}`);
        }
        acum = 0;
    }
    console.log("acumArray: ",_acumArray)
    return _matrizFinal
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
                valorAleatorio = Math.floor(Math.random() * 10);
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

    for(let x = 0; x < retMatriz.length; x ++) {
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
        contabiliza: (cerosArray[i] !== -1) ? 1 : 0,
        urna_electronica: 0
      }
      casillaResultArray.push(item)
    }
    return casillaResultArray
  }

  generarNodosArray(esContable: number, partidosArray: PartidoInterface[], idCasillaPREP: number): NodoVotos[] {
    let arrayNodos: NodoVotos[] = []
    let randIndex = this.getRandomInt((partidosArray.length + 1))

    if(esContable === -33 && randIndex === partidosArray.length) {
      arrayNodos.push({ nombre: "representantesQueVotaron", votos: esContable, tipo: 1 })
      // console.log("idCasillaPREP: ", idCasillaPREP)
    }else {
      arrayNodos.push({ nombre: "representantesQueVotaron", votos: 0, tipo: 1 })
    }
    for(let j = 0; j < partidosArray.length; j ++) {
      if(esContable === -33 && randIndex === j) {
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: esContable, tipo: 2 })
      } else {
        arrayNodos.push({ nombre: partidosArray[j].siglasPartido, votos: 0, tipo: 2 })
      }
    }
    // representantesQueVotaron: number;
    if(esContable === -33 && randIndex === partidosArray.length) {
      arrayNodos.push({ nombre: "candidatosNoRegistrados", votos: esContable, tipo: 1 })
    } else {
      arrayNodos.push({ nombre: "candidatosNoRegistrados", votos: 0, tipo: 1 })
    }
    if(esContable === -33 && randIndex === partidosArray.length + 1) {
      arrayNodos.push({ nombre: "votosNulos", votos: esContable, tipo: 1 })
    } else {
      arrayNodos.push({ nombre: "votosNulos", votos: 0, tipo: 1 })
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
