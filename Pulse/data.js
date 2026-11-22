/* PULSE prototype seed data */
const SEED = {
  role: 'handler',
  teams: ['Receiving', 'Shipping', 'CSR', 'Kitting', 'FPA'],
  routes: {
    'Inbound Deliveries': 'Receiving',
    'Outbound Shipments': 'Shipping',
    'Customer Concerns': 'CSR',
    'Kit Assembly': 'Kitting',
    'FPA Documentation': 'FPA'
  },
  requests: [
    { id: 'rq-1', type: 'Urgent', category: 'Inbound Deliveries', requestFor: 'Warehouse A / Dock 2', requestor: 'Ana Reyes', remarks: 'Truck arriving in 30 minutes, need extra hands to unload.', team: 'Receiving', originalTeam: 'Receiving', status: 'new', created: '2026-11-21', createdAt: '2026-11-21 08:15', updatedAt: '2026-11-21 08:15', forwardCount: 0, resolution: '' },
    { id: 'rq-2', type: 'Urgent', category: 'Outbound Shipments', requestFor: 'Order #5581', requestor: 'Ben Cruz', remarks: 'Packing list mismatch, shipping label must be reprinted.', team: 'Shipping', originalTeam: 'Shipping', status: 'in_progress', created: '2026-11-20', createdAt: '2026-11-20 10:42', updatedAt: '2026-11-21 09:05', forwardCount: 0, resolution: '' },
    { id: 'rq-3', type: 'Normal', category: 'Customer Concerns', requestFor: 'Client XYZ return', requestor: 'Lita Gomez', remarks: 'Customer requested replacement item; CSR confirmed return needs shipping check.', team: 'Shipping', originalTeam: 'CSR', status: 'forwarded', created: '2026-11-19', createdAt: '2026-11-19 13:20', updatedAt: '2026-11-20 11:10', forwardCount: 1, resolution: '' },
    { id: 'rq-4', type: 'Urgent', category: 'Kit Assembly', requestFor: 'Promo kit batch 12', requestor: 'Pedro Reyes', remarks: 'Need 150 kits staged before the afternoon pickup.', team: 'Kitting', originalTeam: 'Kitting', status: 'resolved', created: '2026-11-17', createdAt: '2026-11-17 07:50', updatedAt: '2026-11-17 15:30', forwardCount: 0, resolution: 'All 150 kits assembled and staged at the pickup area.' },
    { id: 'rq-5', type: 'Normal', category: 'FPA Documentation', requestFor: 'Audit file November', requestor: 'Ana Reyes', remarks: 'Signed FPA forms needed for the monthly audit folder.', team: 'FPA', originalTeam: 'FPA', status: 'new', created: '2026-11-18', createdAt: '2026-11-18 09:00', updatedAt: '2026-11-18 09:00', forwardCount: 0, resolution: '' },
    { id: 'rq-6', type: 'Urgent', category: 'Inbound Deliveries', requestFor: 'Dock 3 mis-sorted pallet', requestor: 'Nora Reyes', remarks: 'Pallet contains kitting components, not inbound stock. Needs re-routing.', team: 'Kitting', originalTeam: 'Receiving', status: 'forwarded', created: '2026-11-22', createdAt: '2026-11-22 07:35', updatedAt: '2026-11-22 08:10', forwardCount: 1, resolution: '' }
  ],
  audit: [
    { id: 'au-1', requestId: 'rq-6', actor: 'Juan Dela Cruz', timestamp: '2026-11-22 08:10', action: 'Request forwarded', detail: 'Receiving → Kitting' },
    { id: 'au-2', requestId: 'rq-6', actor: 'Nora Reyes', timestamp: '2026-11-22 07:35', action: 'Request created', detail: 'Routed to Receiving' },
    { id: 'au-3', requestId: 'rq-3', actor: 'Juan Dela Cruz', timestamp: '2026-11-20 11:10', action: 'Request forwarded', detail: 'CSR → Shipping' },
    { id: 'au-4', requestId: 'rq-3', actor: 'Lita Gomez', timestamp: '2026-11-19 13:20', action: 'Request created', detail: 'Routed to CSR' },
    { id: 'au-5', requestId: 'rq-4', actor: 'Maria Santos', timestamp: '2026-11-17 15:30', action: 'Request resolved', detail: 'All 150 kits assembled and staged at the pickup area.' },
    { id: 'au-6', requestId: 'rq-4', actor: 'Pedro Reyes', timestamp: '2026-11-17 07:50', action: 'Request created', detail: 'Routed to Kitting' },
    { id: 'au-7', requestId: 'rq-2', actor: 'Juan Dela Cruz', timestamp: '2026-11-21 09:05', action: 'Status updated', detail: 'New → In Progress' },
    { id: 'au-8', requestId: 'rq-2', actor: 'Ben Cruz', timestamp: '2026-11-20 10:42', action: 'Request created', detail: 'Routed to Shipping' },
    { id: 'au-9', requestId: 'rq-1', actor: 'Ana Reyes', timestamp: '2026-11-21 08:15', action: 'Request created', detail: 'Routed to Receiving' },
    { id: 'au-10', requestId: 'rq-5', actor: 'Ana Reyes', timestamp: '2026-11-18 09:00', action: 'Request created', detail: 'Routed to FPA' }
  ],
  notices: [
    { id: 'nt-1', type: 'forwarded', text: 'Request rq-6 was forwarded from Receiving to Kitting', requestId: 'rq-6', time: '2026-11-22 08:10', read: false },
    { id: 'nt-2', type: 'new', text: 'New Urgent request rq-1 routed to Receiving', requestId: 'rq-1', time: '2026-11-21 08:15', read: false },
    { id: 'nt-3', type: 'resolved', text: 'Request rq-4 was resolved by Kitting', requestId: 'rq-4', time: '2026-11-17 15:30', read: true }
  ],
  activity: [
    { id: 'ac-1', text: 'Request rq-6 forwarded to Kitting', module: 'wall', time: 'Today, 08:10' },
    { id: 'ac-2', text: 'New request rq-1 routed to Receiving', module: 'submit', time: 'Nov 21, 2026' },
    { id: 'ac-3', text: 'Request rq-4 resolved by Kitting', module: 'wall', time: 'Nov 17, 2026' }
  ]
};
