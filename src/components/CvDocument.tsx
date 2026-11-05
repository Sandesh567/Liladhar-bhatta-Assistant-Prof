/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CVDOCUMENT COMPONENT
 * Pure semantic HTML/CSS component for A4 print PDF generation and site preview.
 * Reads 100% from src/data.ts. Zero invented facts.
 */

import React from 'react';
import { DATA, CONFIG } from '../data.ts';

interface CvDocumentProps {
  customConfig?: Partial<typeof CONFIG>;
}

export const CvDocument: React.FC<CvDocumentProps> = ({ customConfig }) => {
  const cfg = { ...CONFIG, ...customConfig };
  const { personal, teachingPositions, education, skills, languages, references } = DATA;

  // Contact address string based on privacy setting
  let addressText = '';
  if (cfg.CV_SHOW_ADDRESS === 'full') {
    addressText = personal.addressFull;
  } else if (cfg.CV_SHOW_ADDRESS === 'city') {
    addressText = personal.addressCity;
  }

  return (
    <article className="cv-document" lang="en">
      {/* Document Header */}
      <header className="cv-header">
        <div className="cv-topline">
          <h1 className="cv-name">{personal.name}</h1>
          <span className="cv-doc-label">Curriculum Vitae</span>
        </div>

        <div className="cv-title-line">
          <span className="cv-title">{personal.currentTitle}</span>
          <span className="cv-institution">· {personal.institution}</span>
        </div>

        {/* Minimal red marker accent rule */}
        <div className="cv-red-accent-bar" aria-hidden="true" />

        {/* Contact Strip */}
        <div className="cv-contact-strip">
          {addressText && (
            <span className="cv-contact-item">
              <span>{addressText}</span>
            </span>
          )}

          {cfg.CV_SHOW_PHONE && (
            <>
              {addressText && <span className="cv-contact-sep">|</span>}
              <span className="cv-contact-item">
                <span>Phone: {personal.phone}</span>
              </span>
            </>
          )}

          {cfg.CV_SHOW_EMAIL && (
            <>
              {(addressText || cfg.CV_SHOW_PHONE) && <span className="cv-contact-sep">|</span>}
              <span className="cv-contact-item">
                <span>Email: {personal.email}</span>
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Two-Zone Grid */}
      <div className="cv-grid">
        {/* Main Column: Objective & Teaching Experience */}
        <div className="cv-main-col">
          {/* Career Objective Section */}
          <section className="cv-section" aria-labelledby="cv-heading-objective">
            <h2 id="cv-heading-objective" className="cv-section-title">Career Objective</h2>
            <p className="cv-objective-text">
              {personal.careerObjective}
            </p>
          </section>

          {/* Teaching Experience & Training Section */}
          <section className="cv-section" aria-labelledby="cv-heading-experience">
            <h2 id="cv-heading-experience" className="cv-section-title">Teaching Experience &amp; Training</h2>
            
            <div className="cv-positions-list">
              {teachingPositions.map((pos) => (
                <article key={pos.id} className="cv-position-entry">
                  <div className="cv-position-header">
                    <h3 className="cv-role">{pos.role}</h3>
                    {pos.subRole && (
                      <div className="cv-subrole">{pos.subRole}</div>
                    )}
                  </div>

                  <div className="cv-position-meta">
                    <span className="cv-place">{pos.institution}, {pos.location}</span>
                    <span className="cv-period">{pos.period}</span>
                  </div>

                  {pos.trainingsAndAwards && pos.trainingsAndAwards.length > 0 && (
                    <ul className="cv-trainings-list">
                      {pos.trainingsAndAwards.map((item, idx) => (
                        <li key={idx} className="cv-training-item">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Side Column: Education, Skills, Languages, Personal Details, References */}
        <aside className="cv-side-col">
          {/* Educational Qualification Section */}
          <section className="cv-section" aria-labelledby="cv-heading-education">
            <h2 id="cv-heading-education" className="cv-section-title">Educational Qualification</h2>
            
            <div className="cv-education-list">
              {education.map((edu) => (
                <div key={edu.id} className="cv-edu-entry">
                  <h3 className="cv-degree">{edu.degree}</h3>
                  <div className="cv-edu-meta">
                    <span>{edu.institution}, {edu.location}</span>
                    <div>Year: {edu.year}</div>
                  </div>
                  <div className="cv-edu-result">Result: {edu.result}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Skills Section */}
          <section className="cv-section" aria-labelledby="cv-heading-skills">
            <h2 id="cv-heading-skills" className="cv-section-title">Key Skills</h2>
            <ul className="cv-skills-list">
              {skills.map((skill, idx) => (
                <li key={idx} className="cv-skill-item">
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          {/* Languages Section */}
          <section className="cv-section" aria-labelledby="cv-heading-languages">
            <h2 id="cv-heading-languages" className="cv-section-title">Languages</h2>
            <ul className="cv-lang-list">
              {languages.map((lang, idx) => (
                <li key={idx} className="cv-lang-item">
                  <span className="cv-lang-name">{lang.name}</span>
                  <span className="cv-lang-prof">{lang.proficiency}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Personal Details Section (Shown only if enabled in CONFIG) */}
          {cfg.CV_SHOW_PERSONAL_DETAILS && (
            <section className="cv-section" aria-labelledby="cv-heading-personal">
              <h2 id="cv-heading-personal" className="cv-section-title">Personal Details</h2>
              <ul className="cv-personal-list">
                <li className="cv-personal-item">
                  <span className="cv-personal-label">Date of Birth</span>
                  <span className="cv-personal-val">{personal.dobBs} ({personal.dobAd})</span>
                </li>
                <li className="cv-personal-item">
                  <span className="cv-personal-label">Gender</span>
                  <span className="cv-personal-val">{personal.gender}</span>
                </li>
                <li className="cv-personal-item">
                  <span className="cv-personal-label">Marital Status</span>
                  <span className="cv-personal-val">{personal.maritalStatus}</span>
                </li>
                <li className="cv-personal-item">
                  <span className="cv-personal-label">Nationality</span>
                  <span className="cv-personal-val">{personal.nationality}</span>
                </li>
                <li className="cv-personal-item">
                  <span className="cv-personal-label">Religion</span>
                  <span className="cv-personal-val">{personal.religion}</span>
                </li>
              </ul>
            </section>
          )}

          {/* References Section */}
          <section className="cv-section" aria-labelledby="cv-heading-references">
            <h2 id="cv-heading-references" className="cv-section-title">References</h2>
            <p className="cv-references-note">{references}</p>
          </section>
        </aside>
      </div>
    </article>
  );
};
