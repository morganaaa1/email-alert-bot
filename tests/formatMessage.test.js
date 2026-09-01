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
  expect(result).toContain('iops\\_in\\_progress');
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
