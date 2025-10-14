export const timeCalc = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return interval === 1 
        ? {text: `1 ${unit} ago`, seconds:seconds} 
        : {text: `${interval} ${unit}s ago`, seconds: seconds};
    }
  }

  return 'just now';
};