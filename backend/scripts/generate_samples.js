const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../../sample_data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const cases = [
  {
    filename: 'Smith_v_RetailCorp_2023.pdf',
    title: 'Smith v RetailCorp Pty Ltd [2023] HCA 14',
    court: 'HIGH COURT OF AUSTRALIA',
    date: '14 May 2023',
    catchwords: 'CONTRACTS - Breach of contract in retail - Supply chain agreements - Failure to deliver goods - Damages.',
    summary: 'This case involves a significant breach of contract in the retail sector. The plaintiff, Mr. Smith, entered into a commercial agreement with RetailCorp Pty Ltd for the exclusive supply of organic produce to 50 retail outlets across New South Wales and Victoria.',
    facts: 'On 12 January 2022, the parties executed a Supply Agreement. Clause 4.1 stipulated that RetailCorp must purchase a minimum of 10,000 units per month. In August 2022, RetailCorp unilaterally reduced its order to 2,000 units, citing "unforeseen market downturns" and "supply chain disruptions". Mr. Smith argued this constituted a repudiatory breach of the contract. RetailCorp relied on a Force Majeure clause (Clause 19), arguing that global shipping delays excused their non-performance.',
    judgment: 'The Court found in favour of the plaintiff. The Chief Justice noted that a "market downturn" does not satisfy the threshold for a Force Majeure event under the specific wording of Clause 19. The breach of contract in retail supply agreements requires strict adherence to minimum order quantities unless explicitly waived. RetailCorp was ordered to pay $1.2 million in expectation damages to cover the lost profits for the remainder of the contract term.'
  },
  {
    filename: 'TechNova_v_DataStream_2022.pdf',
    title: 'TechNova Solutions v DataStream Inc [2022] FCA 88',
    court: 'FEDERAL COURT OF AUSTRALIA',
    date: '22 February 2022',
    catchwords: 'INTELLECTUAL PROPERTY - Patents - Software patent infringement - Data processing algorithms.',
    summary: 'An intellectual property dispute concerning the alleged infringement of a software patent related to real-time data compression algorithms used in cloud computing.',
    facts: 'TechNova holds Australian Patent No. 2018999112 for a "Method of Dynamic Data Compression". DataStream released a new cloud storage product in 2021 that utilized a substantially similar algorithm. TechNova sought an injunction and damages, claiming DataStream reverse-engineered their proprietary code. DataStream argued the patent was invalid due to prior art and that their algorithm was independently developed using open-source libraries.',
    judgment: 'The Court dismissed TechNova\'s claim. The presiding judge determined that while the algorithms achieved similar results, DataStream\'s implementation relied on a fundamentally different mathematical approach (the "Fourier-Transform method" as opposed to TechNova\'s "Wavelet method"). Furthermore, the Court found that certain claims in TechNova\'s patent were overly broad and lacked the necessary novelty to be enforceable against independent development.'
  },
  {
    filename: 'Doe_v_BuildRight_2021.pdf',
    title: 'Doe v BuildRight Constructions [2021] NSWSC 112',
    court: 'SUPREME COURT OF NEW SOUTH WALES',
    date: '05 April 2021',
    catchwords: 'TORT - Negligence - Workplace injury - Duty of care - Construction site safety.',
    summary: 'A personal injury claim where a subcontractor sued a principal construction company for negligence following a severe fall on a commercial building site.',
    facts: 'John Doe, a scaffolding subcontractor, fell four meters from an unsecured platform at a BuildRight Constructions site in Sydney. The fall resulted in severe spinal injuries. Doe alleged that BuildRight failed to provide a safe system of work and breached its duty of care by not ensuring the scaffolding was inspected by a certified safety officer before use. BuildRight argued contributory negligence, stating Doe failed to wear his issued safety harness.',
    judgment: 'The Court apportioned liability. BuildRight was found to have breached its primary duty of care by failing to conduct the mandatory morning safety inspection (a breach of the Work Health and Safety Act 2011). However, the Court also found Doe 30% contributorily negligent for failing to utilize the provided fall-arrest system. Damages were assessed at $2.5 million, reduced by 30% to $1.75 million.'
  },
  {
    filename: 'ACCC_v_MegaMart_2022.pdf',
    title: 'ACCC v MegaMart Supermarkets [2022] FCA 305',
    court: 'FEDERAL COURT OF AUSTRALIA',
    date: '18 August 2022',
    catchwords: 'CONSUMER LAW - Misleading and deceptive conduct - False pricing - "Was/Now" pricing strategies.',
    summary: 'The Australian Competition and Consumer Commission (ACCC) initiated proceedings against MegaMart for misleading consumers regarding discount pricing on everyday grocery items.',
    facts: 'Between January and June 2021, MegaMart ran a "Super Savers" campaign. Items were advertised with "Was $10, Now $5" tags. The ACCC presented evidence that the items had never actually been sold at the $10 price point for a reasonable period before the promotion. MegaMart argued the "Was" price referred to the Manufacturer\'s Suggested Retail Price (MSRP), not their own historical price.',
    judgment: 'MegaMart was found to have engaged in misleading and deceptive conduct in contravention of Section 18 of the Australian Consumer Law. The Court ruled that the average consumer interprets a "Was" price as the retailer\'s own immediate prior price, not an abstract MSRP. MegaMart was fined $5 million and ordered to publish corrective notices in major national newspapers.'
  },
  {
    filename: 'FairWork_v_CafeExpress_2023.pdf',
    title: 'Fair Work Ombudsman v Cafe Express Pty Ltd [2023] FCA 101',
    court: 'FEDERAL COURT OF AUSTRALIA',
    date: '02 March 2023',
    catchwords: 'EMPLOYMENT LAW - Underpayment of wages - Penalty rates - Record-keeping failures.',
    summary: 'Prosecution by the Fair Work Ombudsman against a hospitality chain for systematic underpayment of young workers and failure to pay weekend penalty rates.',
    facts: 'Cafe Express operates 15 cafes across Melbourne. An audit revealed that 45 employees, mostly university students, were paid a flat rate of $18 per hour, regardless of whether they worked on weekends or public holidays. This was significantly below the Restaurant Industry Award 2020. The company also failed to keep accurate timesheets, relying on informal text messages to track shifts.',
    judgment: 'The Court imposed severe penalties on both the corporate entity and its sole director. The judge described the underpayment as "calculated and deliberate wage theft". Cafe Express was ordered to back-pay $350,000 to the affected employees. Additionally, the company was fined $400,000, and the director was personally fined $80,000 under the accessorial liability provisions of the Fair Work Act.'
  },
  {
    filename: 'Green_v_Blue_2023.pdf',
    title: 'Green v Blue [2023] VSC 45',
    court: 'SUPREME COURT OF VICTORIA',
    date: '11 January 2023',
    catchwords: 'PROPERTY LAW - Boundary dispute - Adverse possession - Fencing Act.',
    summary: 'A residential property dispute between neighbours regarding a misplaced boundary fence and a claim of adverse possession over a 2-meter strip of land.',
    facts: 'Mr. Green purchased his property in 2010. In 2022, a land survey revealed that the dividing fence between his property and Ms. Blue\'s property was situated 2 meters inside his title boundary. Ms. Blue claimed adverse possession, arguing the fence had been in that position since 1995 (over 15 years) and she had continuously used the strip of land for her garden.',
    judgment: 'The Court upheld Ms. Blue\'s claim of adverse possession. Under the Limitation of Actions Act 1958 (Vic), the 15-year period of continuous, exclusive, and open possession extinguishes the original owner\'s title. The Court ordered the title register to be amended to reflect the new boundary line along the existing fence.'
  },
  {
    filename: 'CommBank_v_Johnson_2020.pdf',
    title: 'Commonwealth Bank of Australia v Johnson [2020] QSC 12',
    court: 'SUPREME COURT OF QUEENSLAND',
    date: '15 February 2020',
    catchwords: 'BANKING AND FINANCE - Mortgages - Default - Possession of property - Unconscionable conduct.',
    summary: 'The bank sought possession of a residential property following a default on a mortgage. The defendant argued the loan was issued unconscionably.',
    facts: 'Mr. Johnson, a 75-year-old pensioner with limited English, acted as a guarantor for his son\'s business loan, securing it against his only home. The son\'s business failed, and the bank moved to repossess Mr. Johnson\'s house. Johnson argued the bank engaged in unconscionable conduct by failing to ensure he received independent legal and financial advice before signing the guarantee.',
    judgment: 'The Court ruled in favour of Mr. Johnson, applying the principles from Commercial Bank of Australia Ltd v Amadio. The bank was aware of Johnson\'s special disadvantage (age, language barrier, and lack of business acumen) and failed to take reasonable steps to ensure he understood the risks. The guarantee and the mortgage were set aside as void.'
  },
  {
    filename: 'Jones_v_MediaCorp_2021.pdf',
    title: 'Jones v MediaCorp [2021] NSWCA 55',
    court: 'NEW SOUTH WALES COURT OF APPEAL',
    date: '20 May 2021',
    catchwords: 'DEFAMATION - Publication - Imputations - Defence of truth - Qualified privilege.',
    summary: 'An appeal in a defamation case where a prominent politician sued a media organization over an investigative journalism piece alleging corruption.',
    facts: 'MediaCorp published an article alleging that Senator Jones had accepted bribes from property developers in exchange for favorable zoning decisions. Jones sued for defamation, claiming the article imputed he was corrupt and unfit for office. At trial, MediaCorp successfully relied on the defence of substantial truth. Jones appealed, arguing the trial judge erred in assessing the credibility of the anonymous whistleblowers.',
    judgment: 'The Court of Appeal dismissed the appeal. The appellate judges found no error in the trial judge\'s assessment of the evidence. The documentary evidence, combined with the protected whistleblower testimony, was sufficient to establish the substantial truth of the imputations on the balance of probabilities. The defence of truth under the Defamation Act 2005 was upheld.'
  },
  {
    filename: 'Estate_of_Williams_2023.pdf',
    title: 'Re Estate of Williams [2023] WASC 77',
    court: 'SUPREME COURT OF WESTERN AUSTRALIA',
    date: '10 March 2023',
    catchwords: 'SUCCESSION - Wills - Testamentary capacity - Undue influence - Family provision claim.',
    summary: 'A dispute over the validity of a deceased person\'s final will, with allegations of lack of testamentary capacity and undue influence by a caregiver.',
    facts: 'The deceased, Mrs. Williams, executed a new will three weeks before her death at age 89, leaving her entire $4 million estate to her live-in nurse, excluding her three adult children. The children challenged the will, presenting medical evidence that Mrs. Williams was suffering from advanced dementia and lacked testamentary capacity. They also alleged the nurse exerted undue influence.',
    judgment: 'The Court pronounced against the validity of the final will. The medical evidence overwhelmingly demonstrated that Mrs. Williams did not comprehend the nature and effect of the document she was signing, failing the test in Banks v Goodfellow. The Court ordered that probate be granted in solemn form for her previous will, which divided the estate equally among her children.'
  },
  {
    filename: 'Victoria_v_EnvWatch_2022.pdf',
    title: 'State of Victoria v Environmental Watch Inc [2022] VSCA 99',
    court: 'VICTORIAN COURT OF APPEAL',
    date: '30 June 2022',
    catchwords: 'ENVIRONMENTAL LAW - Logging - Endangered species habitat - Injunctions - Statutory interpretation.',
    summary: 'An appeal regarding an injunction granted to an environmental NGO halting state-sanctioned logging in a designated old-growth forest.',
    facts: 'Environmental Watch obtained an interim injunction stopping VicForests from logging in the Central Highlands, arguing the area was a critical habitat for the endangered Leadbeater\'s Possum. The State appealed, arguing the NGO lacked standing and that the logging operations were fully compliant with the Regional Forest Agreement (RFA) framework.',
    judgment: 'The Court of Appeal upheld the injunction. The Court found that Environmental Watch had standing as a recognized environmental advocacy group. Furthermore, the Court ruled that compliance with the RFA does not exempt the State from its obligations under the Flora and Fauna Guarantee Act 1988 to protect identified critical habitats. The logging ban was made permanent in the specified coupes.'
  }
];

async function generatePDFs() {
  for (const caseData of cases) {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(outputDir, caseData.filename);
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);

    // Header
    doc.font('Helvetica-Bold').fontSize(16).text(caseData.court, { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text(caseData.title, { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text(`Date of Judgment: ${caseData.date}`, { align: 'center' });
    doc.moveDown(2);

    // Catchwords
    doc.font('Helvetica-Bold').fontSize(12).text('CATCHWORDS:');
    doc.font('Helvetica-Oblique').fontSize(11).text(caseData.catchwords);
    doc.moveDown();

    // Summary
    doc.font('Helvetica-Bold').fontSize(12).text('SUMMARY:');
    doc.font('Helvetica').fontSize(11).text(caseData.summary, { align: 'justify' });
    doc.moveDown();

    // Facts
    doc.font('Helvetica-Bold').fontSize(12).text('BACKGROUND AND FACTS:');
    doc.font('Helvetica').fontSize(11).text(caseData.facts, { align: 'justify' });
    doc.moveDown();

    // Judgment
    doc.font('Helvetica-Bold').fontSize(12).text('JUDGMENT AND REASONS:');
    doc.font('Helvetica').fontSize(11).text(caseData.judgment, { align: 'justify' });
    
    // Add some boilerplate legal text to ensure the document is long enough for good chunking
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(10).text('ORDERS:');
    doc.font('Helvetica').fontSize(10).text('1. The appeal/claim is determined as stated in the reasons above.');
    doc.text('2. Costs are awarded to the successful party, to be agreed or taxed.');
    doc.text('3. Liberty to apply within 14 days.');

    doc.end();
    
    console.log(`Generated: ${caseData.filename}`);
  }
}

generatePDFs().then(() => console.log('All sample PDFs generated successfully.'));
