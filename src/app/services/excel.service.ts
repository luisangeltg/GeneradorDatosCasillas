import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';



@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  EXCEL_EXTENSION = '.xlsx';
  constructor() { }

  public exportToExcel (element: any, fileName: string): void {
    // generate workbook and add the worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(element);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // save to file
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}${this.EXCEL_EXTENSION}`);
  }
}
