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
