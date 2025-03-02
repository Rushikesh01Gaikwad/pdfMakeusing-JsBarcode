import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import JsBarcode from 'jsbarcode';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private router: Router) { }

  generatePDF() {
  const cellWidth = 106;  // Fixed width of each cell
  const cellHeight = 131; // Fixed height of each cell
  const barcodesPerPage = 5 * 6; // 30 barcodes per A4 page

  // Example barcode data (You can replace this with actual data)
  const barcodeData = Array.from({ length: 100 }, (_, i) => ({
    code: `BARCODE${i + 1}`,
    name: `Item ${i + 1} - Some Long dghdfh dfhfdghgfdsgsdgdgdsgsgsd hdgffddf hgfdhfd  dergdrsfgerger dfghgher detgfhdegtfhfdghgfdhgfdtshgtftrfet dfgtgfghh Name`, // Simulating long text
    rate: (Math.random() * 100).toFixed(2),
    mrp: (Math.random() * 150).toFixed(2),
  }));

  // Generate barcode images
  const barcodeImages: string[] = [];
  barcodeData.forEach((data) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, data.code, { format: "CODE128", width: 2, height: 50 });
    barcodeImages.push(canvas.toDataURL("image/png")); // Convert to base64
  });

  // Generate pages dynamically
  const pages = [];
  for (let i = 0; i < barcodeData.length; i += barcodesPerPage) {
    const pageBarcodes = barcodeData.slice(i, i + barcodesPerPage);
    const body = [];

    for (let row = 0; row < 6; row++) {
      const rowCells = [];
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        if (index < pageBarcodes.length) {
          rowCells.push({
            stack: [
              { text: this.truncateText('Comp Name', 18), fontSize: 10, alignment: 'center', margin: [0, 2] },
              { image: barcodeImages[i + index], fit: [cellWidth - 10, 50], alignment: 'center' },
              { text: this.truncateText(pageBarcodes[index].name,35), fontSize: 10, alignment: 'start', margin: [0, 2] },
              { text: `Exp Date: ${"20/7/2023"}`, fontSize: 10, alignment: 'start', margin: [0, 2] },
              { text: `Rate: ₹${pageBarcodes[index].rate}`, fontSize: 10, alignment: 'start', margin: [0, 2] },
              { text: `MRP: ₹${pageBarcodes[index].mrp}`, fontSize: 10, alignment: 'start', margin: [0, 2] }
            ],
            border: [true, true, true, true],
            height: cellHeight, // Fix cell height
          });
        } else {
          rowCells.push({ text: '', border: [true, true, true, true], height: cellHeight });
        }
      }
      body.push(rowCells);
    }

    pages.push({
      table: {
        widths: Array(5).fill(cellWidth),
        heights: Array(6).fill(cellHeight), // Fix row heights
        body: body
      },
      layout: {
        defaultBorder: true,
      },
      pageBreak: i + barcodesPerPage < barcodeData.length ? 'after' : ''
    });
  }

  // PDF Document Definition
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [10, 10, 10, 10], // Small margins
    content: pages
  };

  pdfMake.createPdf(docDefinition).open(); // Open in a new tab
}

// Function to truncate long text
truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}



}
