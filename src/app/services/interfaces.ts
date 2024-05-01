export interface CasillaResult {
  idCasillaPREP: number;
  distrito: string;
  municipio: string;
  seccion: number;
  casilla: string;
  listaNominal: number;
  boletas: number;
  boletasSobrantes: number;
  personasQueVotaron: number;
  votosSacadosDeLaUrna: number;
  votos: NodoVotos[];
  total: number;
  contabiliza: number;
  urna_electronica: number;
}

export interface NodoVotos {
  nombre: string;
  votos: number;
  tipo: number;//tipo 1 = ni partido ni coalicion, tipo 2 = partidos, tipo 3 = coaliciones
}

export interface CasillasResponse {
  CasillasResponse: CasillaInterface[]
}

export interface PartidosResponse {
  PartidosResponse: PartidoInterface[]
}

export interface CatdResponse {
  CatdResponse: CatdInterface[]
}


export interface PartidoInterface {
  idPartido:         number;
  partido:           string;
  siglasPartido:     string;
  coalicion:         boolean;
  independiente:     boolean;
  activo:            boolean;
  idPartidoDepende?: number;
}

export interface CasillaInterface {
  idCasillaPREP:                number;
  idCasilla:                    number;
  idPREP:                       number;
  idCATD_Distrital:             number;
  idCATD_Municipal:             number;
  Distrito:                     string;
  Municipio:                    string;
  idSeccion:                    number;
  seccion:                      string;
  idUbicacionSeccion:           number;
  claveCasilla:                 string;
  nombreCasilla:                string;
  numeroCasilla:                number;
  numeroExtraordinariaContigua: number;
  idTipoCasilla:                number;
  listaNominal:                 number;
  representantesPPyCI:          number;
  boletas:                      number;
  idMecanismoTraslado:          number;
  id_zore_Are:                  number;
  Are:                          number;
  id_distrito_Zore:             number;
  Zore:                         number;
  id_distrito_Federal:          number;
  Distrito_Federal:             string;
  activa:                       boolean;
  urnaElectronica:              boolean;
  idCATD:                       number;
  CATD:                         string;
  numeroCATD:                   number;
  idTipoCATD:                   number;
  id_Identifica_Acta:           number;
}

export interface CatdInterface {
  ID: number,
  CATD: string,
  idTipoCATD: number,
  version: number
}
