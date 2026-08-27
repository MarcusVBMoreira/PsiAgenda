import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = rgb(0.09, 0.09, 0.11);
const MUTED = rgb(0.45, 0.45, 0.48);
const ACCENT = rgb(0.2, 0.24, 0.31);

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapParagraphs(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  return text.split("\n").flatMap((line) => wrapLine(line, font, size, maxWidth));
}

export class PdfWriter {
  private doc: PDFDocument;
  private page!: PDFPage;
  private regular!: PDFFont;
  private bold!: PDFFont;
  private y = 0;

  private constructor(doc: PDFDocument) {
    this.doc = doc;
  }

  static async create(): Promise<PdfWriter> {
    const doc = await PDFDocument.create();
    const writer = new PdfWriter(doc);
    writer.regular = await doc.embedFont(StandardFonts.Helvetica);
    writer.bold = await doc.embedFont(StandardFonts.HelveticaBold);
    writer.addPage();
    return writer;
  }

  private addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.addPage();
    }
  }

  private drawLines(lines: string[], font: PDFFont, size: number, color = INK, lineHeight = 1.4) {
    const gap = size * lineHeight;
    for (const line of lines) {
      this.ensureSpace(gap);
      this.page.drawText(line, { x: MARGIN, y: this.y - size, size, font, color });
      this.y -= gap;
    }
  }

  title(text: string) {
    this.ensureSpace(28);
    this.drawLines(wrapLine(text, this.bold, 20, CONTENT_WIDTH), this.bold, 20, ACCENT, 1.3);
  }

  meta(text: string) {
    this.drawLines(wrapLine(text, this.regular, 10, CONTENT_WIDTH), this.regular, 10, MUTED, 1.3);
    this.y -= 10;
  }

  sectionHeading(text: string) {
    this.y -= 8;
    this.ensureSpace(20);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y },
      thickness: 0.75,
      color: rgb(0.85, 0.85, 0.87),
    });
    this.y -= 16;
    this.drawLines(wrapLine(text.toUpperCase(), this.bold, 11, CONTENT_WIDTH), this.bold, 11, ACCENT, 1.3);
    this.y -= 2;
  }

  labelValue(label: string, value: string) {
    this.drawLines(wrapLine(label.toUpperCase(), this.bold, 8.5, CONTENT_WIDTH), this.bold, 8.5, MUTED, 1.3);
    this.drawLines(wrapParagraphs(value || "-", this.regular, 11, CONTENT_WIDTH), this.regular, 11, INK, 1.45);
    this.y -= 8;
  }

  paragraph(text: string) {
    this.drawLines(wrapParagraphs(text, this.regular, 11, CONTENT_WIDTH), this.regular, 11, INK, 1.5);
    this.y -= 6;
  }

  spacer(height = 10) {
    this.y -= height;
  }

  async finish(): Promise<Buffer> {
    const bytes = await this.doc.save();
    return Buffer.from(bytes);
  }
}
