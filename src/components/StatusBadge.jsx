import React from 'react';

/**
 * StatusBadge Component
 * Renders color-coded badges for ticket status and priority with specific gradients/glows.
 * 
 * @param {string} type - 'status' or 'priority'
 * @param {string} value - The actual status or priority value (e.g., 'Open', 'Critical')
 */
const StatusBadge = ({ type, value }) => {
  if (!value) return null;

  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-');
  let badgeClass = 'badge ';

  if (type === 'status') {
    badgeClass += `badge-status-${normalizedValue}`;
  } else if (type === 'priority') {
    badgeClass += `badge-priority-${normalizedValue}`;
  }

  return (
    <span className={badgeClass}>
      {value}
    </span>
  );
};

export default StatusBadge;
