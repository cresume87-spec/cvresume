import { PolicySection } from '@/types/policy';
import { Currency, SERVICE_COSTS, TOKENS_PER_GBP, formatCurrency, getPlanDisplayAmount, getTokenRateText } from '@/lib/currency';

export function buildTermsSections(currency: Currency): PolicySection[] {
  return [
    {
      id: 'intro',
      title: '1. General provisions',
      body: `These Terms and Conditions govern the use of the website careerzen.co.uk and the provision of CV/resume creation, improvement, and export services by EVERFINA LTD (Company No. 15645711), registered at 20 Wenlock Road, London, England, N1 7GU (the "Company," "we," "us," and "our").\nBy using our website, creating a draft CV, or purchasing token packages, you agree to these Terms. If you do not agree, please do not use the Service.`,
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      body: `"Services" - creation, editing, and export of CVs/resumes in PDF or DOCX, as well as improvements via AI or a personal manager.\n"Draft" - a resume draft created by the user.\n"Final File" - the finished document (PDF or DOCX) saved by the user.\n"Client," "you" - an individual or entity using the website or purchasing tokens.\n"Tokens" - internal credits used to pay for Services (${getTokenRateText(currency)}).`,
    },
    {
      id: 'accounts',
      title: '3. Right to use and account registration',
      body: `You must be at least 18 years old to place an order or register, or be an authorized representative of a legal entity.\nYou must provide accurate and up-to-date information during registration and keep it current.\nYou are responsible for maintaining the confidentiality of your login credentials and for all activities carried out under your account.`,
    },
    {
      id: 'tokens',
      title: '4. Ordering, tokens and payment',
      body: `Services are provided through a token-based system:\n- Starter - ${formatCurrency(getPlanDisplayAmount(5, currency), currency)} = 500 tokens\n- Pro - ${formatCurrency(getPlanDisplayAmount(15, currency), currency)} = 1,500 tokens\n- Business - ${formatCurrency(getPlanDisplayAmount(30, currency), currency)} = 3,000 tokens\n- Custom - price by agreement (custom token allocation).\n\nService costs (in tokens):\n- Create CV/Resume draft - ${SERVICE_COSTS.CREATE_DRAFT} tokens\n- Export to PDF - ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens total\n- Export to DOCX - ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX} tokens total\n- Improve with AI - ${SERVICE_COSTS.AI_IMPROVE} tokens\n- Send to personal manager - ${SERVICE_COSTS.PERSONAL_MANAGER} tokens\n\nAll displayed prices already include VAT. Payments are made via methods listed on the website. Services are activated only after payment is successfully received.`,
    },
    {
      id: 'service',
      title: '5. Service performance',
      body: `Drafts and files are generated automatically after tokens are deducted.\nYou must review the final file immediately upon download.\nIn case of technical errors, the Company may offer regeneration or token refunds.`,
    },
    {
      id: 'refunds',
      title: '6. Cancellation and refunds',
      body: `Token packages can be canceled before use; refunds are issued minus payment provider fees.\nTokens already used for Services are non-refundable.\nIn case of significant technical failures caused by us, compensation or refunds may be granted in line with our refund policy.`,
    },
    {
      id: 'ip',
      title: '7. Intellectual property',
      body: `You retain all rights to the data you upload or input for resume creation.\nThe Company does not claim ownership of your materials and uses them solely for providing Services.\nFinal files belong to you after generation.`,
    },
    {
      id: 'privacy',
      title: '8. Confidentiality and data processing',
      body: `We process personal data in accordance with our Privacy Policy and applicable law (UK GDPR and the Data Protection Act 2018).\nUploaded data is automatically deleted after processing, unless otherwise required for technical support.`,
    },
    {
      id: 'warranty',
      title: '9. Warranties and disclaimer',
      body: `We warrant that Services will be provided with reasonable care and in accordance with their descriptions.\nThe Service is provided "as is." We do not guarantee job placement, employer approval, or specific career outcomes from using the generated CV/resume.`,
    },
    {
      id: 'liability',
      title: '10. Limitation of liability',
      body: `The Company is not liable for indirect or consequential losses, including loss of profit, data, or reputation, except in cases of willful misconduct or gross negligence.\nThe Company's total liability is limited to the amount actually paid by you for the token package used for the specific Service giving rise to the claim.`,
    },
    {
      id: 'indemnity',
      title: '11. Indemnity',
      body: `You agree to indemnify and hold the Company harmless from any claims, liabilities, damages, or expenses (including reasonable legal fees) arising out of: (a) your breach of these Terms; (b) unlawful use of third-party data; or (c) misuse of generated files.`,
    },
    {
      id: 'third-party',
      title: '12. Third-party links',
      body: `The website may contain links to third-party resources. We are not responsible for their content or accuracy.`,
    },
    {
      id: 'termination',
      title: '13. Suspension and termination',
      body: `We may suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or pose a security threat.\nTermination does not release you from obligations incurred before termination.`,
    },
    {
      id: 'changes',
      title: '14. Changes to these Terms',
      body: `We may update these Terms from time to time. Significant changes will be posted on the website or sent to you via email. Continued use of the Service constitutes acceptance of the updated Terms.`,
    },
    {
      id: 'notices',
      title: '15. Notices',
      body: `All official communications must be sent to:\ninfo@careerzen.co.uk\n20 Wenlock Road, London, England, N1 7GU`,
    },
    {
      id: 'law',
      title: '16. Governing law and jurisdiction',
      body: `These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory consumer protection laws apply in your country of residence.`,
    },
    {
      id: 'misc',
      title: '17. Miscellaneous',
      body: `If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in force.\nFailure by the Company to enforce any right does not constitute a waiver of that right.\nThese Terms represent the entire agreement between you and the Company regarding the use of the Service.`,
    },
    {
      id: 'company-details',
      title: 'Company details',
      body: `EVERFINA LTD\nCompany number: 15645711\nRegistered office: 20 Wenlock Road, London, England, N1 7GU\nEmail: info@careerzen.co.uk`,
    },
  ];
}

export function buildRefundSections(currency: Currency): PolicySection[] {
  return [
    {
      id: 'summary',
      title: '1. Customer summary',
      body: `Refunds are processed according to this Policy and applicable law.\nStandard refund processing time is 5-10 business days after approval; actual posting may take longer depending on banks/payment providers.\nRefunds will not exceed the amount actually paid for your order (minus any non-refundable processor fees).\nTokens already used for Services (draft generation, exports, AI improvement, or manager review) are generally non-refundable.\nToken packages can be refunded only if unused; once tokens are spent, refunds are not possible except in cases of technical fault.\nPromotional credits, discounts, and bonus tokens are normally non-refundable unless required by law or explicitly stated otherwise.\nRefund requests must be sent to info@careerzen.co.uk with your order details.\nThis Policy may be updated; significant changes will be communicated as described below.\nBy expressly requesting immediate access to Services (for example, downloading or generating a CV), you may lose the statutory cancellation right - see section 4.6.`,
    },
    {
      id: 'scope',
      title: '2. Scope and legal note',
      body: `This Policy applies to refunds and cancellations for CV/resume creation, export, AI improvement, and related services provided by EVERFINA LTD. Nothing in this Policy affects statutory consumer rights (for example under the Consumer Contracts Regulations 2013 and the Consumer Rights Act 2015, where applicable).`,
    },
    {
      id: 'definitions',
      title: '3. Definitions',
      body: `Order / Service Fee - the amount you paid for token packages.\nToken Package - prepaid balance of tokens purchased to access Services.\nUsed Tokens - tokens deducted for generating drafts, exporting files, or using AI/manager services.\nUnused Tokens - tokens remaining in your balance that have not yet been spent.\nPromotional Credits - bonus tokens or discounts awarded under promotions.`,
    },
    {
      id: 'rules',
      title: '4. Core refund rules',
      body: `4.1 Refund cap. Refunds will not exceed the amount you paid for the relevant purchase (less any non-refundable payment fees). Refunds are made in the original purchase currency where possible.\n4.2 Used tokens. Once tokens have been used for Services, refunds are generally not available, except where the Service was materially defective and could not be remedied.\n4.3 Cancellation before use. If you cancel before using purchased tokens, we will refund the remaining amount minus any reasonable costs already incurred.\n4.4 Defective or non-conforming output. If a generated CV/resume is materially defective or does not match the specification, we will first attempt to correct it (revisions/regeneration). If the issue cannot be fixed within a reasonable time, a partial or full refund may be issued.\n4.5 Promotions. Promotional credits, discounts, or bonus tokens are normally non-refundable unless required by law.\n4.6 Immediate use / loss of cancellation right. If you request an immediate start and confirm you waive the cancellation right (or if you download or use generated files), your statutory cancellation right may no longer apply.\n4.7 Custom services. Where a personal manager is engaged, once the review process has begun, refunds are not available unless otherwise agreed in writing.`,
    },
    {
      id: 'request',
      title: '5. How to request a refund',
      body: `Send an email to info@careerzen.co.uk with the following:\n- Order reference number.\n- Account email used for purchase.\n- Whether the request concerns unused tokens, cancellation, or an issue with generated files.\n- For defective outputs: description of the issue and evidence (screenshots, file names, timestamps).\n- Preferred refund method (normally refunded to the original payment method).\n\nUpon receipt we will:\n- Acknowledge your request within 5 business days.\n- Investigate and, if needed, request further details.\n- Provide a decision and, if approved, initiate the refund within 5-10 business days of approval (posting time depends on your provider).`,
    },
    {
      id: 'investigation',
      title: '6. Investigation, evidence and decisions',
      body: `6.1 We review order/payment records, token logs, file generation history, and any evidence you submit.\n6.2 Approved refunds are normally returned to the original payment method; if not possible, an alternative may be offered (for example, bank transfer).\n6.3 If a claim is refused, we will explain the reasons and outline possible next steps.`,
    },
    {
      id: 'fraud',
      title: '7. Chargebacks, fraud and abuse',
      body: `If you initiate a chargeback while a refund request is pending, it will be treated as a dispute. We will provide full evidence (order logs, confirmations, timestamps, downloads) to the payment provider. We may refuse refunds and suspend accounts in cases of fraud, abuse, or repeated unwarranted chargebacks.`,
    },
    {
      id: 'changes',
      title: '8. Changes to this Policy',
      body: `We may update this Policy from time to time. Material changes will be notified by email or via a prominent notice on the website. Updates apply prospectively and do not affect transactions completed before the change date.`,
    },
    {
      id: 'records',
      title: '9. Record retention',
      body: `We keep records necessary to review refund requests - including order IDs, payment history, token usage logs, and delivery records - for at least 24 months, and up to 6 years in corporate or disputed matters, consistent with our Privacy Policy and applicable law.`,
    },
    {
      id: 'escalation',
      title: '10. Escalation and disputes',
      body: `If you disagree with our decision, you may send a detailed appeal to info@careerzen.co.uk with your order details. Appeals are reviewed within 10 business days. This does not affect your statutory rights to pursue dispute resolution or legal action.`,
    },
    {
      id: 'examples',
      title: '11. Examples',
      body: `Unused tokens: You purchased ${formatCurrency(getPlanDisplayAmount(20, currency), currency)} = ${20 * TOKENS_PER_GBP} tokens, used 300 tokens -> ${20 * TOKENS_PER_GBP - 300} unused tokens. If you request a refund, the value of unused tokens may be refunded (less fees).\nUsed tokens: If you spent tokens to generate/download a CV, refunds are only possible where the output is materially defective.\nPromotional tokens: 100 bonus tokens received in a promotion -> non-refundable.\nDisplayed prices already include VAT. Currency conversions follow the current token rate of ${getTokenRateText(currency)}.`,
    },
    {
      id: 'contact',
      title: '12. Contact details',
      body: `Email: info@careerzen.co.uk\nRegistered office: EVERFINA LTD, 20 Wenlock Road, London, England, N1 7GU`,
    },
  ];
}
