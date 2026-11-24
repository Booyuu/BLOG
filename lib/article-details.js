export const detailTextFields = ['location', 'date', 'gear', 'lens', 'mood'];
export const detailTextLimit = 100;
const flags = ['enabled', 'showDate', 'showCategory'];

export const articleDetailsDefaults = {
  enabled: true, showDate: true, showCategory: true,
  location: '', date: '', gear: '', lens: '', mood: '',
};

export const icelandDetailsDefaults = {
  ...articleDetailsDefaults,
  showCategory: false,
  location: 'Vík, Iceland',
  date: 'Sep 2025',
  gear: 'Sony A7R IV',
  lens: '16-35mm GM',
  mood: 'Isolation',
};

export function parseArticleDetails(input, previous = articleDetailsDefaults) {
  if (input === undefined) return previous;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const details = { ...previous };
  for (const flag of flags) {
    if (typeof input[flag] !== 'boolean') return null;
    details[flag] = input[flag];
  }
  for (const name of detailTextFields) {
    if (typeof input[name] !== 'string' || input[name].length > detailTextLimit) return null;
    details[name] = input[name].trim();
  }
  return details;
}
