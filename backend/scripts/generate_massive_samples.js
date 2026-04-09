const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../../sample_data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to generate realistic legal filler text to expand document length
const generateLegalFiller = (paragraphs, topic) => {
  const fillers = [
    `The court must consider the historical context of ${topic}. In examining the precedents established over the last century, it becomes evident that the statutory interpretation relies heavily on the legislative intent at the time of drafting. Counsel for the plaintiff argued extensively that the modern application of these principles must adapt to contemporary commercial realities. However, as noted in previous appellate decisions, the court is bound by the strict textual meaning unless an absurdity would result.`,
    `Furthermore, the evidentiary burden rests squarely on the party asserting the claim. The affidavits submitted during the discovery phase, comprising over 5,000 pages of internal communications, emails, and financial ledgers, paint a complex picture of the operational dynamics between the entities involved. Expert testimony provided by forensic accountants highlighted several discrepancies in the standard reporting practices, which the defense vehemently contested during cross-examination.`,
    `It is a well-established doctrine that equitable remedies are discretionary. The tribunal must weigh the balance of convenience and the potential prejudice to third parties. In this instance, the interlocutory injunction granted previously served to preserve the status quo, but the substantive hearing requires a definitive ruling on the merits. The voluminous submissions by both senior counsels have been meticulously reviewed by this bench.`,
    `Turning to the jurisdictional arguments, the respondent raised preliminary objections regarding the standing of the applicant. Citing the seminal case of Robertson v. The Crown, it was posited that the requisite nexus between the alleged harm and the statutory duty was absent. The court rejects this narrow interpretation. The evolving jurisprudence in this area, particularly following the legislative amendments of 2015, clearly broadens the scope of actionable claims under this specific division.`,
    `The cross-examination of the primary witness revealed significant inconsistencies in their recollection of the events of that evening. While human memory is inherently fallible, the documentary evidence—specifically the timestamped server logs and the CCTV footage—directly contradicts the sworn testimony. Consequently, the court must approach this evidence with extreme caution and give greater weight to the contemporaneous written records.`,
    `In assessing damages, the principle of restitutio in integrum applies. The plaintiff is entitled to be placed in the position they would have been in had the breach not occurred, subject to the rules of remoteness and mitigation. The actuarial models presented by the plaintiff's expert project future economic loss over a 15-year period, factoring in inflation, career progression, and standard mortality tables. The defense's counter-model suggests a significantly lower quantum, arguing that the plaintiff failed to take reasonable steps to mitigate their losses by seeking alternative employment.`,
    `The statutory framework governing this dispute is notoriously complex, characterized by overlapping jurisdictions and frequent amendments. Section 45(1)(b) must be read in conjunction with the definitions provided in Section 2. The purposive approach to statutory interpretation, as mandated by the Acts Interpretation Act, requires the court to prefer a construction that promotes the purpose or object underlying the Act. The explanatory memorandum introduced during the second reading speech provides crucial insight into the legislature's intent to curb exactly the type of conduct exhibited by the defendant.`,
    `Finally, regarding the matter of costs, the general rule is that costs follow the event. The successful party is entitled to their costs on a party-party basis. However, the plaintiff has applied for indemnity costs, arguing that the defendant's conduct during the litigation—specifically the late disclosure of critical documents and the pursuit of baseless interlocutory applications—warrants a departure from the standard rule. The court will hear further submissions on this specific issue next week.`
  ];

  let result = '';
  for (let i = 0; i < paragraphs; i++) {
    result += fillers[i % fillers.length] + '\n\n';
  }
  return result;
};

const cases = [
  {
    filename: 'LONG_12_PAGE_Smith_v_RetailCorp_2023.pdf',
    title: 'Smith v RetailCorp Pty Ltd [2023] HCA 14',
    court: 'HIGH COURT OF AUSTRALIA',
    date: '14 May 2023',
    catchwords: 'CONTRACTS - Breach of contract in retail - Supply chain agreements - Failure to deliver goods - Damages - Force Majeure - Frustration of Contract.',
    summary: 'This case involves a significant breach of contract in the retail sector. The plaintiff, Mr. Smith, entered into a commercial agreement with RetailCorp Pty Ltd for the exclusive supply of organic produce to 50 retail outlets across New South Wales and Victoria. The central issue is whether global shipping delays constitute a Force Majeure event under the specific terms of their retail supply agreement.',
    facts: 'On 12 January 2022, the parties executed a Supply Agreement. Clause 4.1 stipulated that RetailCorp must purchase a minimum of 10,000 units per month. In August 2022, RetailCorp unilaterally reduced its order to 2,000 units, citing "unforeseen market downturns" and "supply chain disruptions". Mr. Smith argued this constituted a repudiatory breach of the contract. RetailCorp relied on a Force Majeure clause (Clause 19), arguing that global shipping delays excused their non-performance.',
    judgment: 'The Court found in favour of the plaintiff. The Chief Justice noted that a "market downturn" does not satisfy the threshold for a Force Majeure event under the specific wording of Clause 19. The breach of contract in retail supply agreements requires strict adherence to minimum order quantities unless explicitly waived. RetailCorp was ordered to pay $1.2 million in expectation damages to cover the lost profits for the remainder of the contract term.',
    topic: 'commercial contracts and retail supply chains',
    pages: 12
  },
  {
    filename: 'LONG_15_PAGE_TechNova_v_DataStream_2022.pdf',
    title: 'TechNova Solutions v DataStream Inc [2022] FCA 88',
    court: 'FEDERAL COURT OF AUSTRALIA',
    date: '22 February 2022',
    catchwords: 'INTELLECTUAL PROPERTY - Patents - Software patent infringement - Data processing algorithms - Prior Art - Reverse Engineering.',
    summary: 'An intellectual property dispute concerning the alleged infringement of a software patent related to real-time data compression algorithms used in cloud computing.',
    facts: 'TechNova holds Australian Patent No. 2018999112 for a "Method of Dynamic Data Compression". DataStream released a new cloud storage product in 2021 that utilized a substantially similar algorithm. TechNova sought an injunction and damages, claiming DataStream reverse-engineered their proprietary code. DataStream argued the patent was invalid due to prior art and that their algorithm was independently developed using open-source libraries.',
    judgment: 'The Court dismissed TechNova\'s claim. The presiding judge determined that while the algorithms achieved similar results, DataStream\'s implementation relied on a fundamentally different mathematical approach (the "Fourier-Transform method" as opposed to TechNova\'s "Wavelet method"). Furthermore, the Court found that certain claims in TechNova\'s patent were overly broad and lacked the necessary novelty to be enforceable against independent development.',
    topic: 'software patents and algorithmic intellectual property',
    pages: 15
  }
];

async function generatePDFs() {
  for (const caseData of cases) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filePath = path.join(outputDir, caseData.filename);
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);

    // PAGE 1: Title and Summary
    doc.font('Helvetica-Bold').fontSize(18).text(caseData.court, { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(16).text(caseData.title, { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text(`Date of Judgment: ${caseData.date}`, { align: 'center' });
    doc.moveDown(3);

    doc.font('Helvetica-Bold').fontSize(12).text('CATCHWORDS:');
    doc.font('Helvetica-Oblique').fontSize(11).text(caseData.catchwords);
    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(12).text('SUMMARY:');
    doc.font('Helvetica').fontSize(11).text(caseData.summary, { align: 'justify' });
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').fontSize(12).text('INTRODUCTION:');
    doc.font('Helvetica').fontSize(11).text(generateLegalFiller(3, caseData.topic), { align: 'justify' });
    
    // Generate the requested number of pages
    for (let p = 2; p < caseData.pages; p++) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).text(`SECTION ${p}: DETAILED ANALYSIS`, { underline: true });
      doc.moveDown();
      // Add 8 paragraphs of dense legal filler per page
      doc.font('Helvetica').fontSize(11).text(generateLegalFiller(8, caseData.topic), { align: 'justify' });
    }

    // FINAL PAGE: Judgment and Orders
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('FINAL JUDGMENT AND REASONING', { underline: true });
    doc.moveDown();
    doc.font('Helvetica').fontSize(11).text(caseData.judgment, { align: 'justify' });
    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(14).text('ORDERS', { underline: true });
    doc.moveDown();
    doc.font('Helvetica').fontSize(11).text('For the reasons stated above, the Court orders that:', { align: 'justify' });
    doc.moveDown();
    doc.text('1. The appeal/claim is determined as stated in the reasons above.');
    doc.moveDown(0.5);
    doc.text('2. The Defendant shall pay the Plaintiff damages as assessed in paragraph 142 of this judgment within 28 days.');
    doc.moveDown(0.5);
    doc.text('3. Costs are awarded to the successful party, to be agreed or taxed on a standard basis.');
    doc.moveDown(0.5);
    doc.text('4. Liberty to apply within 14 days regarding the exact calculation of pre-judgment interest.');
    doc.moveDown(3);
    
    doc.font('Helvetica-Bold').text('___________________________________', { align: 'right' });
    doc.text('JUSTICE OF THE COURT', { align: 'right' });

    doc.end();
    
    console.log(`Generated ${caseData.pages}-page document: ${caseData.filename}`);
  }
}

generatePDFs().then(() => console.log('All massive sample PDFs generated successfully.'));
