import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  HardHat,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'work-orders', label: 'Work orders', icon: ClipboardList, count: '04' },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'staff', label: 'Maintenance team', icon: Users },
  { id: 'inventory', label: 'Parts inventory', icon: Package },
];

const pageDetails = {
  overview: ['Campus overview', 'Here is what needs attention across campus today.'],
  'work-orders': ['Work orders', 'Track requests from intake through completion.'],
  facilities: ['Facilities', 'Building conditions and active maintenance by location.'],
  equipment: ['Equipment register', 'Assets, condition, and upcoming service dates.'],
  staff: ['Maintenance team', 'Workload and on-duty coverage for the facilities crew.'],
  inventory: ['Parts inventory', 'Stock levels and items approaching their reorder point.'],
};

const resourceForPage = {
  'work-orders': 'work-orders',
  facilities: 'facilities',
  equipment: 'equipment',
  staff: 'staff',
  inventory: 'inventory',
};

const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', {
  day: 'numeric',
  month: 'short',
});

function App() {
  const [page, setPage] = useState('overview');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const endpoint = page === 'overview' ? '/api/overview' : `/api/${resourceForPage[page]}`;
    let active = true;
    setLoading(true);
    setError('');
    fetch(endpoint)
      .then(async (response) => {
        if (!response.ok) throw new Error('The campus data could not be loaded.');
        return response.json();
      })
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (active) setError('Unable to reach the maintenance server. Start the app with npm run dev and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, refreshKey]);

  const goTo = (nextPage) => {
    setPage(nextPage);
    setQuery('');
    setSidebarOpen(false);
  };

  const submitWorkOrder = async (formData) => {
    const response = await fetch('/api/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'The work order could not be saved.');
    setModalOpen(false);
    setPage('work-orders');
    setRefreshKey((key) => key + 1);
  };

  const updateWorkOrder = async (id, changes) => {
    const response = await fetch(`/api/work-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (!response.ok) throw new Error('The work order could not be updated.');
    setRefreshKey((key) => key + 1);
  };

  const [title, subtitle] = pageDetails[page];
  const headerDate = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date());

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <img src="/ua-logo.png" alt="University of the Assumption" />
          <div className="brand-divider" />
          <div className="brand-copy"><strong>CampusCare</strong><span>FACILITIES OPERATIONS</span></div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={`nav-link ${page === id ? 'nav-link-active' : ''}`} onClick={() => goTo(id)}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="campus-status"><span className="status-dot" /><span>Campus operations active</span></div>
          <button className="profile-button" title="Account settings">
            <span className="avatar avatar-gold">AP</span>
            <span className="profile-copy"><strong>Angelo Pascual</strong><small>Facilities coordinator</small></span>
            <Settings2 size={17} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
          <div className="topbar-crumb"><span>Facilities</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
          <div className="topbar-tools">
            <label className="global-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this view" aria-label="Search current view" /></label>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <span className="today-label">{headerDate}</span>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> UA CAMPUS SERVICES</div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="heading-actions">
              {page === 'work-orders' && <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> New work order</button>}
              {page === 'overview' && <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Create request</button>}
              {page !== 'overview' && page !== 'work-orders' && <span className="record-count"><Activity size={15} /> {Array.isArray(payload) ? payload.length : 0} records</span>}
            </div>
          </div>

          {error ? <div className="error-state"><CircleAlert size={20} /><span>{error}</span><button className="button button-quiet" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button></div> : null}
          {loading && !payload ? <div className="loading-state"><span className="loading-mark" /> Loading campus data</div> : null}

          {!loading && !error && page === 'overview' && payload && <Overview data={payload} onNavigate={goTo} onUpdate={updateWorkOrder} />}
          {!loading && !error && page === 'work-orders' && Array.isArray(payload) && <WorkOrders orders={payload} query={query} onUpdate={updateWorkOrder} />}
          {!loading && !error && page === 'facilities' && Array.isArray(payload) && <Facilities facilities={filterRecords(payload, query)} />}
          {!loading && !error && page === 'equipment' && Array.isArray(payload) && <Equipment equipment={filterRecords(payload, query)} />}
          {!loading && !error && page === 'staff' && Array.isArray(payload) && <Team staff={filterRecords(payload, query)} />}
          {!loading && !error && page === 'inventory' && Array.isArray(payload) && <Inventory inventory={filterRecords(payload, query)} />}

          <footer className="page-footer"><span>University of the Assumption</span><span>CampusCare <b>·</b> Facilities management</span></footer>
        </section>
      </main>

      {modalOpen && <WorkOrderModal facilities={payload?.facilities ?? []} onClose={() => setModalOpen(false)} onSubmit={submitWorkOrder} />}
    </div>
  );
}

function filterRecords(records, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;
  return records.filter((record) => Object.values(record).some((value) => String(value).toLowerCase().includes(normalized)));
}

function Overview({ data, onNavigate, onUpdate }) {
  const stats = [
    { label: 'Open work orders', value: data.openOrders, detail: 'Across campus', icon: ClipboardList, tone: 'blue', page: 'work-orders' },
    { label: 'In progress', value: data.inProgress, detail: 'Being worked on', icon: Wrench, tone: 'teal', page: 'work-orders' },
    { label: 'Overdue', value: data.overdue, detail: 'Needs follow-up', icon: CircleAlert, tone: 'red', page: 'work-orders' },
    { label: 'Active equipment', value: data.activeEquipment, detail: 'In service', icon: HardHat, tone: 'gold', page: 'equipment' },
  ];
  const urgentCount = data.workOrders.filter((order) => order.priority === 'Urgent' && order.status !== 'Completed').length;

  return (
    <>
      <div className="overview-intro">
        <div className="welcome-note"><span className="welcome-icon"><CalendarDays size={17} /></span><span><strong>Good morning, Angelo</strong><small>Here is your campus maintenance snapshot.</small></span></div>
        <div className="snapshot-date"><span className="snapshot-dot" /> LIVE OPERATIONS</div>
      </div>

      <div className="metric-grid">
        {stats.map(({ label, value, detail, icon: Icon, tone, page }) => (
          <button className="metric-card" key={label} onClick={() => onNavigate(page)}>
            <div className="metric-top"><span>{label}</span><span className={`metric-icon metric-${tone}`}><Icon size={17} /></span></div>
            <div className="metric-value-row"><strong>{value}</strong><span>{detail}</span></div>
            <div className="metric-foot"><span>View details</span><ArrowUpRight size={14} /></div>
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel work-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">ACTION QUEUE</div><h2>Recent work orders</h2></div>
            <button className="text-button" onClick={() => onNavigate('work-orders')}>View all <ArrowUpRight size={15} /></button>
          </div>
          <WorkOrderTable orders={data.workOrders} compact onUpdate={onUpdate} />
        </section>

        <aside className="overview-rail">
          <section className="attention-panel">
            <div className="attention-top"><span className="attention-icon"><CircleAlert size={18} /></span><span className="attention-label">NEEDS ATTENTION</span></div>
            <strong className="attention-number">{urgentCount.toString().padStart(2, '0')}<small> urgent</small></strong>
            <p>{urgentCount ? 'A high-impact request is waiting for assignment.' : 'No urgent requests in the queue.'}</p>
            <button className="attention-link" onClick={() => onNavigate('work-orders')}>Review priority queue <ArrowUpRight size={14} /></button>
          </section>

          <section className="panel facility-panel">
            <div className="panel-heading panel-heading-tight"><div><div className="section-kicker">CAMPUS FOOTPRINT</div><h2>Facility pulse</h2></div><Building2 size={19} className="heading-icon" /></div>
            <div className="facility-summary"><strong>{data.facilities.length.toString().padStart(2, '0')}</strong><span>managed buildings</span></div>
            <div className="facility-list">
              {data.facilities.slice(0, 4).map((facility) => (
                <div className="facility-row" key={facility.id}>
                  <span className={`facility-indicator ${facility.condition === 'Attention' ? 'indicator-attention' : ''}`} />
                  <span className="facility-name">{facility.name}</span>
                  <span className="facility-open">{facility.openOrders} <small>open</small></span>
                </div>
              ))}
            </div>
            <button className="facility-link" onClick={() => onNavigate('facilities')}>Explore facilities <ArrowUpRight size={14} /></button>
          </section>

          <div className="service-note"><ShieldCheck size={17} /><span><strong>Service continuity</strong><small>Facilities team on duty</small></span><span className="service-pulse" /></div>
        </aside>
      </div>
    </>
  );
}

function WorkOrders({ orders, query, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const visibleOrders = orders.filter((order) => {
    const matchesQuery = filterRecords([order], query).length > 0;
    return matchesQuery && (statusFilter === 'All statuses' || order.status === statusFilter) && (priorityFilter === 'All priorities' || order.priority === priorityFilter);
  });

  return (
    <section className="panel table-panel full-panel">
      <div className="table-toolbar">
        <div><div className="section-kicker">MAINTENANCE LOG</div><h2>All requests <span className="count-badge">{visibleOrders.length}</span></h2></div>
        <div className="filter-controls">
          <label><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Requested</option><option>In progress</option><option>Scheduled</option><option>Completed</option></select><ChevronDown size={14} /></label>
          <label><span className="sr-only">Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={14} /></label>
        </div>
      </div>
      <WorkOrderTable orders={visibleOrders} onUpdate={onUpdate} />
      <div className="table-footnote"><span><span className="status-dot status-dot-small" /> Data saved to the local maintenance store</span><span>Updated just now</span></div>
    </section>
  );
}

function WorkOrderTable({ orders, compact = false, onUpdate }) {
  const handleStatusChange = async (id, status) => {
    try {
      await onUpdate(id, { status });
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className={`table-scroll ${compact ? 'table-scroll-compact' : ''}`}>
      <table className="data-table work-order-table">
        <thead><tr><th>Request</th><th>Facility</th><th>Priority</th><th>Assigned to</th><th>Due date</th><th>Status</th></tr></thead>
        <tbody>
          {orders.length ? orders.map((order) => (
            <tr key={order.id}>
              <td><div className="request-cell"><span className="request-id">{order.id}</span><strong>{order.title}</strong><small>{order.category}</small></div></td>
              <td className="facility-cell"><span className="facility-primary">{order.facility}</span><small className="facility-room">{order.floor ? `Floor ${order.floor} · Room ${order.roomNumber}` : 'Room not specified'}</small></td>
              <td><PriorityBadge priority={order.priority} /></td>
              <td><Assignee value={order.assignedTo} /></td>
              <td><span className={`due-date ${order.status !== 'Completed' && order.dueAt < new Date().toISOString().slice(0, 10) ? 'due-overdue' : ''}`}><Clock3 size={13} />{formatDate(order.dueAt)}</span></td>
              <td><select className={`status-select status-${slug(order.status)}`} aria-label={`Update status for ${order.id}`} value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}><option>Requested</option><option>In progress</option><option>Scheduled</option><option>Completed</option></select></td>
            </tr>
          )) : <tr><td colSpan="6" className="empty-cell">No work orders match these filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Facilities({ facilities }) {
  return (
    <section className="panel table-panel full-panel">
      <div className="table-toolbar"><div><div className="section-kicker">BUILDING DIRECTORY</div><h2>Campus facilities <span className="count-badge">{facilities.length}</span></h2></div><span className="table-meta"><MapPin size={15} /> University of the Assumption</span></div>
      <div className="table-scroll"><table className="data-table resource-table"><thead><tr><th>Facility</th><th>Type</th><th>Campus zone</th><th>Floor area</th><th>Condition</th><th>Open orders</th></tr></thead><tbody>
        {facilities.map((facility) => <tr key={facility.id}><td><div className="resource-name"><span className="resource-icon resource-building"><Building2 size={17} /></span><span><strong>{facility.name}</strong><small>{facility.id}</small></span></div></td><td>{facility.type}</td><td>{facility.location}</td><td>{facility.area}</td><td><ConditionBadge value={facility.condition} /></td><td><span className="order-count">{facility.openOrders}</span></td></tr>)}
        {!facilities.length && <tr><td colSpan="6" className="empty-cell">No facilities match your search.</td></tr>}
      </tbody></table></div>
    </section>
  );
}

function Equipment({ equipment }) {
  return (
    <section className="panel table-panel full-panel">
      <div className="table-toolbar"><div><div className="section-kicker">ASSET REGISTER</div><h2>Campus equipment <span className="count-badge">{equipment.length}</span></h2></div><span className="table-meta"><Wrench size={15} /> Preventive service schedule</span></div>
      <div className="table-scroll"><table className="data-table resource-table"><thead><tr><th>Asset</th><th>Tag</th><th>Facility / location</th><th>Condition</th><th>Next service</th></tr></thead><tbody>
        {equipment.map((item) => <tr key={item.id}><td><div className="resource-name"><span className="resource-icon resource-equipment"><Wrench size={17} /></span><span><strong>{item.name}</strong><small>{item.id}</small></span></div></td><td><span className="asset-tag">{item.assetTag}</span></td><td><strong className="location-primary">{item.facility}</strong><small className="location-secondary">{item.location}</small></td><td><ConditionBadge value={item.condition} /></td><td><span className="due-date"><CalendarDays size={13} />{formatDate(item.nextService)}</span></td></tr>)}
        {!equipment.length && <tr><td colSpan="5" className="empty-cell">No equipment matches your search.</td></tr>}
      </tbody></table></div>
    </section>
  );
}

function Team({ staff }) {
  return (
    <section className="team-section">
      <div className="team-summary"><div><div className="section-kicker">FIELD OPERATIONS</div><h2>On-duty crew</h2></div><span className="crew-count"><span className="status-dot" /> {staff.length} team members</span></div>
      <div className="team-grid">
        {staff.map((person, index) => {
          const activeOrders = Number(person.activeOrders) || 0;
          return <article className="team-member" key={person.id}>
          <div className="team-card-top"><span className={`avatar avatar-large avatar-tone-${index % 4}`}>{initials(person.name)}</span><span className="duty-status"><i />{person.status}</span></div>
          <div className="team-person"><h3>{person.name}</h3><p>{person.role}</p></div>
          <div className="team-assignment"><span>Active assignments</span><strong>{activeOrders.toString().padStart(2, '0')}</strong></div>
          <div className="team-card-bottom"><span>{person.id}</span><span>Facilities crew</span></div>
        </article>;
        })}
        {!staff.length && <div className="empty-state">No team members match your search.</div>}
      </div>
    </section>
  );
}

function Inventory({ inventory }) {
  const lowStock = inventory.filter((item) => item.quantity <= item.reorderAt).length;
  return (
    <section className="panel table-panel full-panel">
      <div className="table-toolbar"><div><div className="section-kicker">STORES &amp; SUPPLIES</div><h2>Parts inventory <span className="count-badge">{inventory.length}</span></h2></div><span className={`stock-alert ${lowStock ? '' : 'stock-ok'}`}><CircleAlert size={15} /> {lowStock} low-stock items</span></div>
      <div className="table-scroll"><table className="data-table resource-table"><thead><tr><th>Part</th><th>SKU</th><th>Stock on hand</th><th>Reorder point</th><th>Storage location</th></tr></thead><tbody>
        {inventory.map((item) => { const isLow = item.quantity <= item.reorderAt; return <tr key={item.id}><td><div className="resource-name"><span className="resource-icon resource-parts"><Package size={17} /></span><span><strong>{item.name}</strong><small>{item.id}</small></span></div></td><td><span className="asset-tag">{item.sku}</span></td><td><span className={`stock-quantity ${isLow ? 'quantity-low' : ''}`}>{item.quantity} <small>{item.unit}</small></span></td><td>{item.reorderAt} {item.unit}</td><td>{item.location}</td></tr>; })}
        {!inventory.length && <tr><td colSpan="5" className="empty-cell">No parts match your search.</td></tr>}
      </tbody></table></div>
    </section>
  );
}

function WorkOrderModal({ facilities, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', facility: facilities[0]?.name ?? '', floor: '1', roomNumber: '01', category: 'Electrical', priority: 'Medium', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><div className="section-kicker">REQUEST INTAKE</div><h2 id="modal-title">New work order</h2></div><button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div>
        <form onSubmit={submit}>
          <label className="form-field"><span>Request title <b>*</b></span><input autoFocus required maxLength="100" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. Repair classroom door" /></label>
          <label className="form-field"><span>Facility <b>*</b></span><select required value={form.facility} onChange={(event) => setField('facility', event.target.value)}>{facilities.map((facility) => <option key={facility.id}>{facility.name}</option>)}</select></label>
          <div className="form-row">
            <label className="form-field"><span>Floor <b>*</b></span><select required value={form.floor} onChange={(event) => setField('floor', event.target.value)}>{[1, 2, 3].map((floor) => <option key={floor} value={floor}>Floor {floor}</option>)}</select></label>
            <label className="form-field"><span>Room number <b>*</b></span><select required value={form.roomNumber} onChange={(event) => setField('roomNumber', event.target.value)}>{Array.from({ length: 8 }, (_value, index) => String(index + 1).padStart(2, '0')).map((room) => <option key={room} value={room}>Room {room}</option>)}</select></label>
          </div>
          <div className="form-row">
            <label className="form-field"><span>Category <b>*</b></span><select value={form.category} onChange={(event) => setField('category', event.target.value)}>{['Electrical', 'HVAC', 'Plumbing', 'Carpentry', 'Equipment', 'Grounds', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="form-field"><span>Priority</span><select value={form.priority} onChange={(event) => setField('priority', event.target.value)}>{['Low', 'Medium', 'High', 'Urgent'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <label className="form-field"><span>Description</span><textarea rows="3" maxLength="500" value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Add details about the issue or location" /></label>
          {error && <div className="form-error"><CircleAlert size={15} />{error}</div>}
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : <><Plus size={16} /> Create request</>}</button></div>
        </form>
      </section>
    </div>
  );
}

function PriorityBadge({ priority }) {
  return <span className={`priority-badge priority-${slug(priority)}`}><i />{priority}</span>;
}

function Assignee({ value }) {
  const name = value?.trim() || 'Unassigned';
  return <span className="assignee"><span className={`avatar ${name === 'Unassigned' ? 'avatar-empty' : ''}`}>{name === 'Unassigned' ? '?' : initials(name)}</span>{name}</span>;
}

function ConditionBadge({ value }) {
  const tone = value === 'Good' || value === 'Operational' ? 'condition-good' : 'condition-attention';
  return <span className={`condition-badge ${tone}`}><i />{value}</span>;
}

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function slug(value) {
  return value.toLowerCase().replaceAll(' ', '-');
}

export default App;