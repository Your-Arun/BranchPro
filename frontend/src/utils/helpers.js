export const statusLabel = (status) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export const timeAgo = (isoDate) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
