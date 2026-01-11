
import { jsPDF } from "jspdf";
import { UserRole } from "../types";

export const downloadPatternPDF = (
  projectName: string,
  patternType: string,
  canvasDataUrl: string,
  role: UserRole,
  instructions?: string[]
) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.text("Mashal Patterns", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Project: ${projectName}`, 20, 35);
  doc.text(`Type: ${patternType}`, 20, 42);
  doc.text(`Date: ${date}`, 20, 49);

  // Main Pattern Image
  const imgWidth = 170;
  const imgHeight = (imgWidth * 9) / 16; // Adjust ratio if needed
  doc.addImage(canvasDataUrl, 'PNG', 20, 60, imgWidth, imgHeight);

  // Instructions Page if exists
  if (instructions && instructions.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Pattern Instructions", 20, 20);
    doc.setFontSize(10);
    instructions.forEach((inst, idx) => {
      const splitText = doc.splitTextToSize(`${idx + 1}. ${inst}`, 170);
      doc.text(splitText, 20, 35 + (idx * 10));
    });
  }

  // Watermark for free users
  if (role === UserRole.FREE) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(40);
    doc.text("FREE VERSION - MASHAL PATTERNS", 105, 150, { align: "center", angle: 45 });
  }

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Created with Mashal Patterns – Smart Sewing Pattern Generator", 105, 285, { align: "center" });
  doc.text("Disclaimer: Mashal Patterns is an independent educational tool.", 105, 290, { align: "center" });

  doc.save(`${projectName}_MashalPattern.pdf`);
};
