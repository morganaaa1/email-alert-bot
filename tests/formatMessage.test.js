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

test('format email biasa (non-terstruktur) tetap tampil aman', () => {
  const result = formatEmailAlert({
    subject: 'Tes',
    from: 'monica@telkomsel.co.id',
    body: '',
    receivedTime: '2026-09-01T10:53:19+07:00',
  });
  expect(result).toContain('Tidak ada isi pesan');
});
