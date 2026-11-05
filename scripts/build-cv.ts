
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CvDocument } from '../src/components/CvDocument.js';

function getFontDataUri(fontPath: string): string {
  const fontBuffer = fs.readFileSync(fontPath);
  return `data:font/woff2;base64,${fontBuffer.toString('base64')}`;
}

async function buildCv() {
  console.log('Generating print-quality CV...');

  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Load fonts as data URIs
  const fontFiles = {
    pjSans400: path.join(rootDir, 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2'),
    pjSans500: path.join(rootDir, 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2'),
    pjSans600: path.join(rootDir, 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2'),
    pjSans700: path.join(rootDir, 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2'),
    nr400: path.join(rootDir, 'node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2'),
    nr400Italic: path.join(rootDir, 'node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff2'),
    nr600: path.join(rootDir, 'node_modules/@fontsource/newsreader/files/newsreader-latin-600-normal.woff2'),
    nr700: path.join(rootDir, 'node_modules/@fontsource/newsreader/files/newsreader-latin-700-normal.woff2'),
  };

  const fontFaces = `
    @font-face {
      font-family: 'Plus Jakarta Sans';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.pjSans400)}') format('woff2');
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.pjSans500)}') format('woff2');
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.pjSans600)}') format('woff2');
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.pjSans700)}') format('woff2');
    }
    @font-face {
      font-family: 'Newsreader';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.nr400)}') format('woff2');
    }
    @font-face {
      font-family: 'Newsreader';
      font-style: italic;
      font-weight: 400;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.nr400Italic)}') format('woff2');
    }
    @font-face {
      font-family: 'Newsreader';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.nr600)}') format('woff2');
    }
    @font-face {
      font-family: 'Newsreader';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('${getFontDataUri(fontFiles.nr700)}') format('woff2');
    }
  `;

  // Read cv.css
  const cvCssPath = path.join(rootDir, 'src/cv.css');
  const cvCss = fs.readFileSync(cvCssPath, 'utf-8');

  // Render React markup
  const appHtml = renderToStaticMarkup(React.createElement(CvDocument));

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lila Dhar Bhatta - Curriculum Vitae</title>
  <style>
    ${fontFaces}
    ${cvCss}
    
    /* Strict Print Overrides */
    @page {
      size: A4 portrait;
      margin: 16mm 18mm 16mm 18mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  ${appHtml}
</body>
</html>`;

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'load' });

    // Output PDF path
    const pdfPath = path.join(publicDir, 'Lila-Dhar-Bhatta-CV.pdf');

    const pdfBuffer = await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });

    const fileSizeBytes = fs.statSync(pdfPath).size;
    const fileSizeKb = Math.round(fileSizeBytes / 1024);

    // Count pages in PDF buffer
    const pageMatches = Buffer.from(pdfBuffer).toString('latin1').match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? pageMatches.length : 2;

    const hash = crypto.createHash('sha256').update(Buffer.from(pdfBuffer)).digest('hex');

    const meta = {
      fileName: 'Lila-Dhar-Bhatta-CV.pdf',
      pageCount: pageCount,
      sizeKb: fileSizeKb,
      sizeBytes: fileSizeBytes,
      buildDate: 'October 2026',
      generatedAt: new Date().toISOString(),
      sha256: hash
    };

    const metaPath = path.join(publicDir, 'cv-meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

    console.log(`CV PDF generated successfully:`);
    console.log(`- File: ${pdfPath}`);
    console.log(`- Size: ${fileSizeKb} KB (${fileSizeBytes} bytes)`);
    console.log(`- Pages: ${pageCount}`);
    console.log(`- Meta written to: ${metaPath}`);

    if (fileSizeKb > 300) {
      console.warn(`WARNING: CV PDF exceeds target budget of 300KB (${fileSizeKb}KB).`);
    }
    if (pageCount > 2) {
      console.warn(`WARNING: CV PDF exceeds maximum 2 pages (${pageCount} pages).`);
    }

  } finally {
    await browser.close();
  }
}

buildCv().catch((err) => {
  console.error('Failed to generate CV PDF:', err);
  process.exit(1);
});
