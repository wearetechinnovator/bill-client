export const Constants = {
    CASH: "cash",
    BANK: "bank",
    CHEQUE: "cheque",
    UPI: "upi",
    CARD: "card",
    NETBENKING: "netbenking",
    PAID: 'paid',
    UNPAID: 'unpaid',
    CANCEL: 'cancel',
    PARTIAL_PAID: 'partial paid',
    TOTAL_SALE: 'total_sale',
    CUSTOMER: 'customer',
    PARTY: 'party',
    ITEM: 'item',
    PAY: 'pay',
    COLLECT: 'collect',
    CUSTOMER: 'customer',
    SUPPLIER: 'supplier',
    BOTHPARTY: 'both',
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST7DAY: 'last7day',
    LAST30DAY: 'last30day',
    LAST365DAY: 'last365day',
    THISWEEK: 'thisweek',
    LASTWEEK: 'lastweek',
    THISMONTH: 'thismonth',
    PREVMONTH: 'prevmonth',
    THISQUARTER: 'thisquarter',
    LASTQUARTER: 'lastquarter',
    CURRENTFISCAL: 'currentfiscal',
    LASTFISCAL: 'lastfiscal',
    CUSTOM: 'custom',
    GOODS: 'goods',
    SERVICE: 'service',
    EDIT: 'edit',
    PAID_LEAVE: 'paid-leave',
    WEEK_OFF: 'week-off',
    HALF_DAY: 'half-day',
    OVER_TIME: 'over-time',
    LOAN: 'loan',
    LOAN_RECEIVED: 'loan_received',
    ADVANCE_PAYMENT: 'advance_payment',
    BONUS: 'bonus',
    SALARY: 'salary',
    PROFILE: 'profile',
    LADGER: 'ladger',
    CONTACT: 'contact'
}

export const TERMS = {
    QUOTATION: `
        1. Quotation Validity: This quotation is valid for 30 days from the date of issue
        2. Prices & Taxes: Prices are exclusive of GST and other applicable taxes unless otherwise stated.
        3. Payment Terms: 100% advance.
        4. Delivery: Delivery in 2-3 weeks. Delivery time starts from receipt of the Purchase Order, advance payment (if applicable), and final technical approval.
        5. Warranty: 12 months against manufacturing defects from the date of dispatch. Warranty excludes misuse, improper installation, unauthorized modifications, and normal wear & tear.
        6. Customized Products: Actuators can be customized to meet your application requirements, including stroke length, load, speed, voltage, IP rating, mounting options, and feedback systems.
        7. Returns: Customized products are non-returnable unless a manufacturing defect is confirmed.
        8. Force Majeure: Delivery schedules are subject to circumstances beyond our reasonable control.
        9. Jurisdiction: All disputes shall be subject to the jurisdiction of Mumbai, Maharashtra, India.
    `,
    PROFORMA: `
        1. Invoice Validity: Proforma invoice is valid for 30 days; prices and terms may change afterwards.
        2. Pricing: Prices are in INR, exclusive of GST and other taxes, to be borne by the buyer.
        3. P&T: Full payment before dispatch; payment via specified modes as mentioned in the invoice.
        4. Delivery: Goods will be delivered within 2–4 days/weeks after payment, subject to changes.
        5. Shipping: Buyer bears shipping costs and risks; insurance recommended.
        6. Taxes and Duties: Taxes are added to the final invoice, based on current rates.
        7. Customs Clearance: Buyer handles international customs duties and compliance.
        8. Warranty: Warranty covers manufacturing defects for 6/12 months; misuse and wear not covered.
        9. Returns/Cancellations: Returns accepted for defective goods within 7/14 days; cancellation incurs co.
        10. Force Majeure: We’re not liable for delays caused by uncontrollable circumstances.
        11. Liability: Liability is limited to the value of goods; indirect damages not covered.
        12. Law & Jurisdiction: Governed by Indian laws; disputes resolved in Navi Mumbai courts.
        13. Acceptance: Payment and order confirmation signify buyer’s agreement to terms
    `,
    SALESINVOICE: `
        1.	Payment Terms: Payment is due within [7/15] days of the invoice date; late payments incur 2% weekly interest.
        2.	Taxes & Duties: Prices exclude GST and other taxes unless stated; buyers bear additional taxes imposed by authorities
        3.	Delivery: Goods are delivered as per order terms; delays beyond our control are not our responsibility
        4.	Shipping & Handling: Buyers pay shipping unless specified; goods are dispatched at their risk, and insurance is recommended
        5.	Goods Condition: Buyers must inspect goods upon receipt and report issues within 3 days, or they are considered accepted
        6.	Warranty: Warranty covers manufacturing defects for 6/12 months; misuse and wear not covered
        7.	Returns & Replacements: Defective goods can be returned within [3/5] days in original condition; buyers cover return shipping unless agreed otherwise
        8.	Cancellation: Confirmed orders require written consent for cancellation and may incur a fee
        9.	Liability: Our liability is limited to the value of supplied goods; we are not responsible for indirect or consequential damages
        10.	Force Majeure: We are not liable for delays due to uncontrollable events like natural disasters or strikes
        12. Dispute Resolution: Disputes will first be resolved amicably; if unresolved, arbitration under
        11. Law & Jurisdiction: Governed by Indian laws; disputes resolved in Navi Mumbai courts
        12. Acceptance: Payment and order confirmation signify buyer’s agreement to terms
    `,
    SALES_RETURN: `
        1. Price: Rates are firm and final as per PO. No extra charges will be accepted unless approved in writing.
        2. Delivery: Material must be delivered within the agreed schedule. Delays must be informed in advance. Yantra reserves the right to cancel delayed orders.
        3. Quality: Goods must be as per specifications. Defective or non-conforming material will be rejected or replaced at supplier’s cost.
        4. Packing: Supplier is responsible for proper packaging to avoid transit damage.
        5. Warranty: Minimum 12 months warranty from supply date unless otherwise agreed.
        6. Payment: As per PO terms and after acceptance of material. Invoice discrepancies may delay payment.
        7. Risk: Supply remains at supplier’s risk until received and accepted by Yantra.
        8. Confidentiality: All documents, drawings, and information are confidential and cannot be shared without written approval.
        9. Force Majeure: Delays due to uncontrollable events must be communicated immediately.
        10. Jurisdiction: Any dispute will fall under Mumbai jurisdiction.
    `,
    CHALLAN: `
        1. Price: Rates are firm and final as per PO. No extra charges will be accepted unless approved in writing.
        2. Delivery: Material must be delivered within the agreed schedule. Delays must be informed in advance. Yantra reserves the right to cancel delayed orders.
        3. Quality: Goods must be as per specifications. Defective or non-conforming material will be rejected or replaced at supplier’s cost.
        4. Packing: Supplier is responsible for proper packaging to avoid transit damage.
        5. Warranty: Minimum 12 months warranty from supply date unless otherwise agreed.
        6. Payment: As per PO terms and after acceptance of material. Invoice discrepancies may delay payment.
        7. Risk: Supply remains at supplier’s risk until received and accepted by Yantra.
        8. Confidentiality: All documents, drawings, and information are confidential and cannot be shared without written approval.
        9. Force Majeure: Delays due to uncontrollable events must be communicated immediately.
        10. Jurisdiction: Any dispute will fall under Mumbai jurisdiction.
    `,
    CREDIT_NOTE: `
        1. Price: Rates are firm and final as per PO. No extra charges will be accepted unless approved in writing.
        2. Delivery: Material must be delivered within the agreed schedule. Delays must be informed in advance. Yantra reserves the right to cancel delayed orders.
        3. Quality: Goods must be as per specifications. Defective or non-conforming material will be rejected or replaced at supplier’s cost.
        4. Packing: Supplier is responsible for proper packaging to avoid transit damage.
        5. Warranty: Minimum 12 months warranty from supply date unless otherwise agreed.
        6. Payment: As per PO terms and after acceptance of material. Invoice discrepancies may delay payment.
        7. Risk: Supply remains at supplier’s risk until received and accepted by Yantra.
        8. Confidentiality: All documents, drawings, and information are confidential and cannot be shared without written approval.
        9. Force Majeure: Delays due to uncontrollable events must be communicated immediately.
        10. Jurisdiction: Any dispute will fall under Mumbai jurisdiction.
    `
}