const { formatEmailAlert } = require('../src/utils/formatMessage');

test('format alert atomIQ terstruktur', () => {
  const result = formatEmailAlert({
    subject: 'atomIQ Alert critical TC TBS_INDIRA-Extract-Files-CO-Status CNT',
    from: 'atomiqmonitoring@telkomsel.co.id',
    body: 'Lob: TKS, Application: TC, Monitor: TBS_INDIRA-Extract-Files-CO-Status, Metric: CNT, Severity: critical, Status: open, Value: 10',
    receivedTime: '2026-09-01T10:35:17+07:00',
  });
  expect(result).toContain('Severity');
  expect(result).toContain('critical');
});

test('format alert atomIQ terstruktur dengan baris baru (newline)', () => {
  const result = formatEmailAlert({
    subject: 'atomIQ Alert critical IMDG diskio iops_in_progress r1mksimdgcu23 25',
    from: 'atomiqmonitoring@telkomsel.co.id',
    body: 'Lob: TKS\nApplication: IMDG\nMonitor: diskio\nMetric: iops_in_progress\nSeverity: critical\nStatus: open\nValue: 25\nReceived time: 2026-09-01 12:00:24 WIB',
    receivedTime: '2026-09-01T12:00:24+07:00',
  });
  expect(result).toContain('Severity');
  expect(result).toContain('critical');
  expect(result).toContain('Metric');
  expect(result).toContain('iops_in_progress');
});

test('format alert atomIQ dengan format asli (Severity tanpa titik dua & Origin dengan spasi)', () => {
  const sampleBody = `Dear atomIQ User,
We have a new alert for kube-state-metrics PodRestart -
Operation is looking for immediate investigation on the below alert.

Received time: 2026-09-01 11:43:10 WIB
Lob: MS360,
Application: Infra,
Monitor: kube-state-metrics
Metric: PodRestart
Group: exporter
Origin : MS360
Alert Description: Pod monitoring-operator has been restarted for 1 minutes,
Raw_data: {"status": "firing"},
Severity critical,
Status open,
Value None
Insight: , count: 6`;

  const result = formatEmailAlert({
    subject: 'atomIQ Alert critical Infra kube-state-metrics PodRestart None None',
    from: 'atomiqmonitoring@telkomsel.co.id',
    body: sampleBody,
    receivedTime: '2026-09-01T11:43:10+07:00',
  });

  expect(result).toContain('<b>Severity:</b> critical');
  expect(result).toContain('<b>Status:</b> open');
  expect(result).toContain('<b>Value:</b> None');
  expect(result).toContain('<b>Lob:</b> MS360');
  expect(result).toContain('<b>Application:</b> Infra');
  expect(result).toContain('<b>Monitor:</b> kube-state-metrics');
  expect(result).toContain('<b>Metric:</b> PodRestart');
  expect(result).toContain('<b>Group:</b> exporter');
  expect(result).toContain('<b>Origin:</b> MS360');
  expect(result).toContain('Pod monitoring-operator has been restarted for 1 minutes');
});

test('format alert atomIQ dengan Alert Description panjang dan entity HTML', () => {
  const sampleBody = `Dear atomIQ User,
We have a new alert for TBS_ES_Process_Status RB_POS-BIG-CUST -
Operation is looking for immediate investigation on the below alert.

Received time: 2026-09-05 22:00:31 WIB
Lob: TKS,
Application: TC,
Monitor: TBS_ES_Process_Status
Metric: RB_POS-BIG-CUST
Group: App_Query
Origin : M2A_Static_Alerts
Alert Description: Group: &quot;App_Query&quot;, Monitor: &quot;TBS_ES_Process_Status&quot;, Instance: &quot;TBS_ES_Process_Status&quot;, last value: &quot;98.79&quot; , Additional Description: &quot;with DATA_SLICE as ( select GSPIGC.PROCESS_GROUP_CODE, GSPIGC.DESCRIPTION from ADJ1_AUDIT_COUNTERS AAC where (G SPIGC.PROCESS_GROUP_CODE like 'ES_CR%' or GSPIGC.PROCESS_GROUP_CODE l",
Raw_data: None,
Severity critical,
Status open,
Value 98.79
Insight: , count: 7, ticket: , self healing: graph:`;

  const result = formatEmailAlert({
    subject: 'atomIQ Alert critical TC TBS_ES_Process_Status RB_POS-BIG-CUST r1tbspatmiqapp4.r1.telkomsel.co.id 98.79',
    from: 'atomiqmonitoring@telkomsel.co.id',
    body: sampleBody,
    receivedTime: '2026-09-05T22:00:31+07:00',
  });

  expect(result).toContain('<b>Severity:</b> critical');
  expect(result).toContain('<b>Status:</b> open');
  expect(result).toContain('<b>Value:</b> 98.79');
  expect(result).toContain('Group: "App_Query"');
  expect(result).toContain('with DATA_SLICE as');
});

test('format email biasa (non-terstruktur) tetap tampil aman', () => {
  const result = formatEmailAlert({
    subject: 'Tes',
    from: 'monica@telkomsel.co.id',
    body: '',
    receivedTime: '2026-09-01T10:53:19+07:00',
  });
  expect(result).toContain('Tidak ada isi pesan');
});
