export const GROUP_META = {
  anxiety:         { emoji: '😰', color: '#7FA9D4', bg: 'rgba(127,169,212,0.15)', label: 'Anxiety' },
  depression:      { emoji: '🌧️', color: '#8A9BB5', bg: 'rgba(138,155,181,0.15)', label: 'Depression' },
  ocd:             { emoji: '🔄', color: '#5BBCAD', bg: 'rgba(91,188,173,0.15)', label: 'OCD' },
  adhd:            { emoji: '⚡', color: '#E8A838', bg: 'rgba(232,168,56,0.15)', label: 'ADHD' },
  grief:           { emoji: '🕊️', color: '#B0A090', bg: 'rgba(176,160,144,0.15)', label: 'Grief & Loss' },
  loneliness:      { emoji: '🌿', color: '#7BBD82', bg: 'rgba(123,189,130,0.15)', label: 'Loneliness' },
  stress:          { emoji: '🌊', color: '#5B9BD5', bg: 'rgba(91,155,213,0.15)', label: 'Stress' },
  general_support: { emoji: '💙', color: '#4A90D9', bg: 'rgba(74,144,217,0.15)', label: 'General Support' },
};

export function groupMeta(category) {
  return GROUP_META[category] ?? { emoji: '👥', color: 'var(--color-accent)', bg: 'rgba(194,164,138,0.12)', label: category ?? 'Group' };
}
