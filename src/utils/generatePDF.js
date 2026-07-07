import { jsPDF } from 'jspdf';

const PRIMARY   = [29,  78, 216];   // #1D4ED8
const DANGER    = [220, 38,  38];   // #DC2626
const SUCCESS   = [22, 163,  74];   // #16A34A
const WARNING   = [217,119,   6];   // #D97706
const TEXT      = [30,  41,  59];   // #1E293B
const TEXT_MID  = [71,  85, 105];   // #475569
const TEXT_MUTE = [148,163,184];    // #94A3B8
const BORDER    = [226,232,240];    // #E2E8F0
const BG_LIGHT  = [248,250,252];    // #F8FAFC

function setFont(pdf, size, weight = 'normal', color = TEXT) {
  pdf.setFontSize(size);
  pdf.setFont('helvetica', weight);
  pdf.setTextColor(...color);
}

function drawHLine(pdf, y, lm, rm, color = BORDER) {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.3);
  pdf.line(lm, y, rm, y);
}

function riskColor(risk) {
  return risk === 'High' ? DANGER : risk === 'Moderate' ? WARNING : risk === 'Low' ? PRIMARY : SUCCESS;
}

function predColor(pred) {
  return pred === 'Cancerous' ? DANGER : pred === 'Uncertain' ? WARNING : SUCCESS;
}

function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generatePDFReport({ results, patientName, patientEmail }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W   = 210;
  const lm  = 18;
  const rm  = 192;
  const cw  = rm - lm;
  let   y   = 0;

  const {
    prediction,
    confidence       = 0,
    cancer_probability = 0,
    non_cancer_probability = 0,
    lung_confidence,
    risk_level       = 'Unknown',
    original_image,
    heatmap_image,
    medical_advice,
    status,
  } = results;

  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const confPct     = ((confidence ?? 0) * 100).toFixed(1);
  const isCancerous = prediction === 'Cancerous';
  const pColor      = predColor(prediction);
  const rColor      = riskColor(risk_level);

  // ── Header bar ────────────────────────────────────────────────────────────
  pdf.setFillColor(...PRIMARY);
  pdf.rect(0, 0, W, 28, 'F');

  // Logo icon
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(lm, 7, 14, 14, 2, 2, 'F');
  pdf.setTextColor(...PRIMARY);
  setFont(pdf, 9, 'bold');
  pdf.text('AI', lm + 7, 16, { align: 'center' });

  // Title
  pdf.setTextColor(255, 255, 255);
  setFont(pdf, 14, 'bold');
  pdf.text('LungDetect AI', lm + 18, 14);
  setFont(pdf, 9, 'normal');
  pdf.setTextColor(191, 219, 254);
  pdf.text('Lung Cancer Screening Report', lm + 18, 20);

  // Report date (right side)
  setFont(pdf, 8, 'normal');
  pdf.setTextColor(191, 219, 254);
  pdf.text(reportDate, rm, 20, { align: 'right' });

  y = 36;

  // ── Patient Info row ───────────────────────────────────────────────────────
  pdf.setFillColor(...BG_LIGHT);
  pdf.rect(lm, y, cw, 14, 'F');
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.rect(lm, y, cw, 14, 'S');

  setFont(pdf, 8.5, 'normal', TEXT_MUTE);
  pdf.text('PATIENT', lm + 5, y + 5.5);
  setFont(pdf, 10, 'bold', TEXT);
  pdf.text(patientName || 'Anonymous', lm + 5, y + 11);

  setFont(pdf, 8.5, 'normal', TEXT_MUTE);
  pdf.text('EMAIL', lm + 65, y + 5.5);
  setFont(pdf, 9, 'normal', TEXT_MID);
  pdf.text(patientEmail || '—', lm + 65, y + 11);

  setFont(pdf, 8.5, 'normal', TEXT_MUTE);
  pdf.text('STATUS', rm - 50, y + 5.5);
  setFont(pdf, 9, 'bold', SUCCESS);
  pdf.text(status ?? 'Complete', rm - 50, y + 11);

  y += 22;

  // ── Section: Scan Images ──────────────────────────────────────────────────
  setFont(pdf, 10, 'bold', PRIMARY);
  pdf.text('SCAN IMAGES', lm, y);
  drawHLine(pdf, y + 2, lm, rm, PRIMARY);
  y += 8;

  const imgW = (cw - 8) / 2;
  const imgH = imgW;   // square

  if (original_image) {
    try {
      pdf.addImage(
        `data:image/png;base64,${original_image}`,
        'PNG', lm, y, imgW, imgH
      );
    } catch {}
  } else {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(lm, y, imgW, imgH, 'F');
  }
  // Label
  pdf.setFillColor(0, 0, 0);
  pdf.setGlobalAlpha(0.55);
  pdf.rect(lm, y, 28, 6, 'F');
  pdf.setGlobalAlpha(1);
  setFont(pdf, 7, 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('ORIGINAL SCAN', lm + 2, y + 4.2);

  const hx = lm + imgW + 8;
  if (heatmap_image) {
    try {
      pdf.addImage(
        `data:image/png;base64,${heatmap_image}`,
        'PNG', hx, y, imgW, imgH
      );
    } catch {}
  } else {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(hx, y, imgW, imgH, 'F');
    setFont(pdf, 8, 'normal', TEXT_MUTE);
    pdf.text('Heatmap unavailable', hx + imgW / 2, y + imgH / 2, { align: 'center' });
  }
  pdf.setFillColor(0, 0, 0);
  pdf.setGlobalAlpha(0.55);
  pdf.rect(hx, y, 34, 6, 'F');
  pdf.setGlobalAlpha(1);
  setFont(pdf, 7, 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('GRAD-CAM HEATMAP', hx + 2, y + 4.2);

  y += imgH + 4;

  // image caption
  setFont(pdf, 7.5, 'normal', TEXT_MUTE);
  pdf.text(
    'Grad-CAM: red/yellow regions indicate areas the AI weighted most heavily for this prediction.',
    lm + cw / 2, y, { align: 'center' }
  );
  y += 10;

  // ── Section: Analysis Result ──────────────────────────────────────────────
  setFont(pdf, 10, 'bold', PRIMARY);
  pdf.text('ANALYSIS RESULT', lm, y);
  drawHLine(pdf, y + 2, lm, rm, PRIMARY);
  y += 8;

  // Prediction banner
  const bannerBg = isCancerous ? [254, 242, 242] : prediction === 'Uncertain' ? [255, 251, 235] : [240, 253, 244];
  const bannerBd = isCancerous ? [254, 202, 202] : prediction === 'Uncertain' ? [253, 230, 138] : [187, 247, 208];
  pdf.setFillColor(...bannerBg);
  pdf.roundedRect(lm, y, cw, 18, 2, 2, 'F');
  pdf.setDrawColor(...bannerBd);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(lm, y, cw, 18, 2, 2, 'S');

  setFont(pdf, 14, 'bold', pColor);
  pdf.text(prediction, lm + 8, y + 8);
  setFont(pdf, 8.5, 'normal', TEXT_MID);
  pdf.text(`Confidence: ${confPct}%`, lm + 8, y + 14);
  setFont(pdf, 9, 'bold', rColor);
  pdf.text(`${risk_level} Risk`, lm + 8 + 35, y + 14);
  if (lung_confidence != null) {
    setFont(pdf, 8.5, 'normal', TEXT_MUTE);
    pdf.text(`Lung gate: ${Number(lung_confidence).toFixed(1)}%`, rm - 10, y + 14, { align: 'right' });
  }

  y += 24;

  // Metrics 4-up
  const cols4 = [lm, lm + cw / 4, lm + cw / 2, lm + (3 * cw) / 4];
  const bw4   = cw / 4 - 3;
  const labels4  = ['CANCER PROB.', 'NON-CANCER PROB.', 'CONFIDENCE', 'LUNG GATE'];
  const values4  = [
    `${Number(cancer_probability).toFixed(2)}%`,
    `${Number(non_cancer_probability).toFixed(2)}%`,
    `${confPct}%`,
    lung_confidence != null ? `${Number(lung_confidence).toFixed(1)}%` : '—',
  ];

  cols4.forEach((x, i) => {
    pdf.setFillColor(...BG_LIGHT);
    pdf.roundedRect(x, y, bw4, 16, 1.5, 1.5, 'F');
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, y, bw4, 16, 1.5, 1.5, 'S');
    setFont(pdf, 7, 'bold', TEXT_MUTE);
    pdf.text(labels4[i], x + bw4 / 2, y + 5.5, { align: 'center' });
    setFont(pdf, 11, 'bold', TEXT);
    pdf.text(values4[i], x + bw4 / 2, y + 12.5, { align: 'center' });
  });

  y += 22;

  // Confidence bar
  setFont(pdf, 8, 'normal', TEXT_MUTE);
  pdf.text('Confidence Score', lm, y + 3.5);
  setFont(pdf, 9, 'bold', pColor);
  pdf.text(`${confPct}%`, rm, y + 3.5, { align: 'right' });

  y += 7;
  pdf.setFillColor(...BORDER);
  pdf.roundedRect(lm, y, cw, 4, 2, 2, 'F');
  pdf.setFillColor(...pColor);
  const fillW = (parseFloat(confPct) / 100) * cw;
  pdf.roundedRect(lm, y, fillW, 4, 2, 2, 'F');

  y += 12;

  // ── Section: Medical Recommendations ─────────────────────────────────────
  setFont(pdf, 10, 'bold', PRIMARY);
  pdf.text('MEDICAL RECOMMENDATIONS', lm, y);
  drawHLine(pdf, y + 2, lm, rm, PRIMARY);
  y += 8;

  const advBg = isCancerous ? [255, 251, 235] : [240, 253, 244];
  const advBd = isCancerous ? [253, 230, 138] : [187, 247, 208];
  const advTx = isCancerous ? [146, 64, 14]   : [22, 101, 52];

  const advLines = medical_advice
    ? [
        `Recommendation: ${medical_advice.recommendation}`,
        `Urgency: ${medical_advice.urgency}`,
      ]
    : isCancerous
    ? [
        'Seek immediate consultation with an oncologist or pulmonologist.',
        'Schedule additional imaging studies (CT scan, PET scan).',
        'Consider biopsy for definitive diagnosis.',
        'Discuss treatment options with your healthcare team.',
      ]
    : [
        'Continue regular health screenings as recommended by your physician.',
        'Maintain a healthy lifestyle — avoid smoking, exercise regularly.',
        'Monitor for new symptoms (persistent cough, weight loss, fatigue).',
        'Schedule follow-up screening per standard medical guidelines.',
      ];

  const advH = 8 + advLines.length * 6.5;
  pdf.setFillColor(...advBg);
  pdf.roundedRect(lm, y, cw, advH, 2, 2, 'F');
  pdf.setDrawColor(...advBd);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(lm, y, cw, advH, 2, 2, 'S');

  setFont(pdf, 8.5, 'bold', advTx);
  pdf.text('Medical Recommendations', lm + 6, y + 6);
  advLines.forEach((line, i) => {
    setFont(pdf, 8, 'normal', advTx);
    pdf.text(`• ${line}`, lm + 6, y + 12 + i * 6.5);
  });

  y += advH + 10;

  // ── Section: Technical Details ────────────────────────────────────────────
  setFont(pdf, 10, 'bold', PRIMARY);
  pdf.text('TECHNICAL DETAILS', lm, y);
  drawHLine(pdf, y + 2, lm, rm, PRIMARY);
  y += 8;

  const techRows = [
    ['Model',       'ResNet50 Transfer Learning (Keras 3 / TF 2.15)'],
    ['Input Size',  '224 × 224 px  |  Grayscale → 3-channel'],
    ['Grad-CAM',    'conv5_block3_out + EigenCAM fallback'],
    ['Generated',   reportDate],
  ];

  techRows.forEach(([label, val], i) => {
    const ty = y + i * 6.5;
    setFont(pdf, 7.5, 'bold', TEXT_MUTE);
    pdf.text(label, lm, ty);
    setFont(pdf, 7.5, 'normal', TEXT_MID);
    pdf.text(val, lm + 38, ty);
  });

  y += techRows.length * 6.5 + 10;

  // ── Disclaimer ────────────────────────────────────────────────────────────
  pdf.setFillColor(255, 247, 237);
  pdf.roundedRect(lm, y, cw, 18, 2, 2, 'F');
  pdf.setDrawColor(254, 215, 170);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(lm, y, cw, 18, 2, 2, 'S');

  setFont(pdf, 7.5, 'bold', [146, 64, 14]);
  pdf.text('IMPORTANT DISCLAIMER', lm + 5, y + 5.5);
  setFont(pdf, 7, 'normal', [120, 53, 15]);
  const disclaimer =
    'This report is generated by an AI screening tool and is intended as a screening aid only. ' +
    'It does NOT constitute a medical diagnosis and must be reviewed by a qualified healthcare ' +
    'professional before any clinical decision is made. Results may vary. Always consult a ' +
    'licensed radiologist or oncologist for definitive evaluation.';
  const dLines = pdf.splitTextToSize(disclaimer, cw - 10);
  pdf.text(dLines, lm + 5, y + 11);

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 285, W, 12, 'F');
    setFont(pdf, 7.5, 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('LungDetect AI — Confidential Medical Screening Report', lm, 292);
    pdf.text(`Page ${p} of ${pageCount}`, rm, 292, { align: 'right' });
  }

  pdf.save(`LungDetect_Report_${Date.now()}.pdf`);
}
