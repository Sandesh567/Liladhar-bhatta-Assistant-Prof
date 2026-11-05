/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CvDocument } from './components/CvDocument.tsx';
import './cv.css';

const rootElement = document.getElementById('cv-root');
if (rootElement) {
  createRoot(rootElement).render(
    <div className="cv-document-screen-wrapper">
      <CvDocument />
    </div>
  );
}
