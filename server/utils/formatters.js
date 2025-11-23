function parseTags(rawValue) {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return String(rawValue)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

function serializeTags(tags = []) {
  if (Array.isArray(tags)) {
    return JSON.stringify(tags);
  }
  if (typeof tags === 'string') {
    const cleaned = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    return JSON.stringify(cleaned);
  }
  return '[]';
}

function formatUADate(dateString) {
  if (!dateString) return dateString;
  const [day, month, year] = dateString.split(' ');
  const months = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
}

function formatISODateToUA(isoDate) {
  if (!isoDate) return isoDate;
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return formatUADate(`${day} ${month} ${year}`);
}

module.exports = {
  parseTags,
  serializeTags,
  formatUADate,
  formatISODateToUA,
};
