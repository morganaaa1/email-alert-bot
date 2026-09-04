const { formatTeamsMessage } = require('../src/utils/formatTeamsMessage');

test('format pesan Teams dengan konten HTML', () => {
  const result = formatTeamsMessage({
    senderName: 'Budi Santoso',
    teamName: 'L2 Support',
    channelName: 'General',
    content: '<p>Halo tim, ada isu di server.</p>',
    createdDateTime: '2026-09-01T14:30:00Z',
  });
  expect(result).toContain('Budi Santoso');
  expect(result).not.toContain('<p>');
});

test('format pesan Teams tanpa konten (misal cuma gambar)', () => {
  const result = formatTeamsMessage({
    senderName: 'Budi Santoso',
    teamName: 'L2 Support',
    channelName: 'General',
    content: '',
    createdDateTime: '2026-09-01T14:30:00Z',
  });
  expect(result).toContain('tidak memiliki konten teks');
});

test('format pesan Teams dengan konten bertipe JSON string', () => {
  const result = formatTeamsMessage({
    senderName: 'ali_n_ramadhan_x',
    teamName: 'L2 R1',
    channelName: 'R1 Alert Infra and Apps',
    content: '{"contentType":"html","messageBodyContentType":"html","content":"Test\\n"}',
    createdDateTime: '2026-09-03T10:46:00Z',
  });
  expect(result).toContain('Test');
  expect(result).not.toContain('contentType');
});

test('format pesan Teams tidak menyisipkan backslash escape', () => {
  const result = formatTeamsMessage({
    senderName: 'ES_RB20759',
    teamName: 'L2 R1',
    channelName: 'R1 Alert Infra and Apps',
    content: 'TBS throttling found on last 20m\nTIME : 2026-09-04T01:10:56.026Z\nMESSAGE : (APR1-013100) Entering queue throttling mode.',
    createdDateTime: '2026-09-04T01:33:00Z',
  });
  expect(result).not.toContain('\\.');
  expect(result).not.toContain('\\-');
  expect(result).not.toContain('\\_');
  expect(result).not.toContain('\\(');
  expect(result).toContain('2026-09-04T01:10:56.026Z');
});

