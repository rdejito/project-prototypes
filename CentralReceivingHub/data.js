/* Central Receiving Hub prototype seed data — items, scans, notices, claims. */
const SEED = {
  role: 'requestor',
  user: { name: 'Alex Morgan', department: 'Operations', team: 'Operations' },
  scanCodes: [
    { code: 'CRH-QR-88214', name: 'Thermal label printer', category: 'Equipment', supplier: 'PrintWorks', department: 'Operations', serial: 'SN-88214', location: 'Cage A-04' },
    { code: 'CRH-BC-30977', name: 'Network switch 24-port', category: 'IT Equipment', supplier: 'NetCore Supply', department: 'IT Services', serial: 'SN-30977', location: 'Cage B-11' },
    { code: 'CRH-QR-64120', name: 'Safety helmet (box of 12)', category: 'Safety Supplies', supplier: 'SafeLine', department: 'Operations', serial: 'SN-64120', location: 'Cage C-02' },
    { code: 'CRH-BC-51208', name: 'Office desk lamp', category: 'Furniture', supplier: 'ErgoWorks', department: 'Finance', serial: 'SN-51208', location: 'Cage A-09' }
  ],
  items: [
    { id: 'it-1', code: 'CRH-QR-88214', name: 'Thermal label printer', category: 'Equipment', supplier: 'PrintWorks', department: 'Operations', serial: 'SN-88214', requestor: 'Alex Morgan', arrival: '2026-11-21', status: 'pending', condition: 'Good', location: 'Cage A-04', claimHistory: [{ by: 'System', date: '2026-11-21', note: 'Arrival email generated from QR scan.' }] },
    { id: 'it-2', code: 'CRH-BC-30977', name: 'Network switch 24-port', category: 'IT Equipment', supplier: 'NetCore Supply', department: 'IT Services', serial: 'SN-30977', requestor: 'Priya Shah', arrival: '2026-11-19', status: 'pending', condition: 'Sealed', location: 'Cage B-11', claimHistory: [{ by: 'System', date: '2026-11-19', note: 'Arrival email generated from barcode scan.' }] },
    { id: 'it-3', code: 'CRH-QR-64120', name: 'Safety helmet (box of 12)', category: 'Safety Supplies', supplier: 'SafeLine', department: 'Operations', serial: 'SN-64120', requestor: 'Diego Reyes', arrival: '2026-11-16', status: 'pending', condition: 'Good', location: 'Cage C-02', claimHistory: [{ by: 'System', date: '2026-11-16', note: 'Arrival email generated from QR scan.' }] },
    { id: 'it-4', code: 'CRH-BC-51208', name: 'Office desk lamp', category: 'Furniture', supplier: 'ErgoWorks', department: 'Finance', serial: 'SN-51208', requestor: 'Alex Morgan', arrival: '2026-11-12', status: 'claimed', condition: 'Good', location: 'Cage A-09', claimHistory: [{ by: 'System', date: '2026-11-12', note: 'Arrival email generated from barcode scan.' }, { by: 'Alex Morgan', date: '2026-11-13', note: 'Claimed at the End User Cage; MH notified.' }] },
    { id: 'it-5', code: 'CRH-QR-11890', name: 'Cable organizer set', category: 'Supplies', supplier: 'PrintWorks', department: 'Operations', serial: 'SN-11890', requestor: 'Diego Reyes', arrival: '2026-11-10', status: 'claimed', condition: 'Good', location: 'Cage C-05', claimHistory: [{ by: 'System', date: '2026-11-10', note: 'Arrival email generated from QR scan.' }, { by: 'Diego Reyes', date: '2026-11-11', note: 'Claimed at the End User Cage; MH notified.' }] }
  ],
  notifications: [
    { id: 'ar-it-1', to: 'Alex Morgan', kind: 'arrival', text: 'Arrival: Thermal label printer (CRH-QR-88214) is pending in Cage A-04.', date: '2026-11-21 08:20', read: false },
    { id: 'ar-it-2', to: 'Priya Shah', kind: 'arrival', text: 'Arrival: Network switch 24-port (CRH-BC-30977) is pending in Cage B-11.', date: '2026-11-19 10:05', read: false },
    { id: 'cl-it-4', to: 'mh', kind: 'claim', text: 'Alex Morgan claimed Office desk lamp (CRH-BC-51208).', date: '2026-11-13 15:42', read: false },
    { id: 'es-it-5', to: 'supervisor', kind: 'escalation', text: '48-hour escalation: CRH-QR-11890 was unclaimed when escalated.', date: '2026-11-12 08:00', read: true }
  ],
  activity: [
    { id: 'ac-1', text: 'QR scan captured CRH-QR-88214 and prefilled the item form', module: 'scan', time: 'Today, 08:20' },
    { id: 'ac-2', text: 'Alex Morgan claimed Office desk lamp', module: 'items', time: 'Nov 13, 2026' },
    { id: 'ac-3', text: '48-hour escalation sent for CRH-QR-11890', module: 'notifications', time: 'Nov 12, 2026' }
  ]
};
