/**
 * Time utility functions for formatting dates, times, and durations
 */

/**
 * Format a timestamp or Date object to a readable time string
 * @param {string|Date|number} timestamp - The timestamp to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp, options = {}) => {
  if (!timestamp) return 'N/A';
  
  const {
    includeDate = true,
    includeTime = true,
    includeSeconds = false,
    locale = 'zh-CN',
    timeZone = 'Asia/Shanghai'
  } = options;
  
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const formatOptions = {
    timeZone,
    ...(includeDate && {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' })
    })
  };
  
  return date.toLocaleString(locale, formatOptions);
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} duration - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, options = {}) => {
  if (typeof duration !== 'number' || duration < 0) {
    return '0秒';
  }
  
  const {
    showMilliseconds = false,
    showSeconds = true,
    showMinutes = true,
    showHours = true,
    showDays = false,
    compact = false,
    locale = 'zh'
  } = options;
  
  const units = {
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
    millisecond: 1
  };
  
  const labels = {
    zh: {
      day: compact ? 'd' : '天',
      hour: compact ? 'h' : '小时',
      minute: compact ? 'm' : '分钟',
      second: compact ? 's' : '秒',
      millisecond: compact ? 'ms' : '毫秒'
    },
    en: {
      day: compact ? 'd' : ' day',
      hour: compact ? 'h' : ' hour',
      minute: compact ? 'm' : ' minute',
      second: compact ? 's' : ' second',
      millisecond: compact ? 'ms' : ' millisecond'
    }
  };
  
  const currentLabels = labels[locale] || labels.zh;
  const parts = [];
  let remaining = duration;
  
  // Calculate days
  if (showDays && remaining >= units.day) {
    const days = Math.floor(remaining / units.day);
    parts.push(`${days}${currentLabels.day}`);
    remaining %= units.day;
  }
  
  // Calculate hours
  if (showHours && remaining >= units.hour) {
    const hours = Math.floor(remaining / units.hour);
    parts.push(`${hours}${currentLabels.hour}`);
    remaining %= units.hour;
  }
  
  // Calculate minutes
  if (showMinutes && remaining >= units.minute) {
    const minutes = Math.floor(remaining / units.minute);
    parts.push(`${minutes}${currentLabels.minute}`);
    remaining %= units.minute;
  }
  
  // Calculate seconds
  if (showSeconds && remaining >= units.second) {
    const seconds = Math.floor(remaining / units.second);
    parts.push(`${seconds}${currentLabels.second}`);
    remaining %= units.second;
  }
  
  // Calculate milliseconds
  if (showMilliseconds && remaining > 0) {
    parts.push(`${remaining}${currentLabels.millisecond}`);
  }
  
  if (parts.length === 0) {
    return `0${currentLabels.second}`;
  }
  
  return parts.join(compact ? ' ' : '');
};

/**
 * Format a relative time (e.g., "2 hours ago", "in 5 minutes")
 * @param {string|Date|number} timestamp - The timestamp to compare
 * @param {string|Date|number} baseTime - The base time to compare against (default: now)
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp, baseTime = Date.now()) => {
  const date = new Date(timestamp);
  const base = new Date(baseTime);
  
  if (isNaN(date.getTime()) || isNaN(base.getTime())) {
    return 'Invalid Date';
  }
  
  const diff = base.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff > 0;
  
  const units = [
    { name: '年', value: 365 * 24 * 60 * 60 * 1000 },
    { name: '月', value: 30 * 24 * 60 * 60 * 1000 },
    { name: '天', value: 24 * 60 * 60 * 1000 },
    { name: '小时', value: 60 * 60 * 1000 },
    { name: '分钟', value: 60 * 1000 },
    { name: '秒', value: 1000 }
  ];
  
  for (const unit of units) {
    if (absDiff >= unit.value) {
      const count = Math.floor(absDiff / unit.value);
      return isPast ? `${count}${unit.name}前` : `${count}${unit.name}后`;
    }
  }
  
  return '刚刚';
};

/**
 * Get the start and end of a day for a given date
 * @param {string|Date|number} date - The date
 * @returns {Object} Object with start and end timestamps
 */
export const getDayBounds = (date = new Date()) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  
  return {
    start: start.getTime(),
    end: end.getTime() - 1
  };
};

/**
 * Check if a timestamp is within a date range
 * @param {string|Date|number} timestamp - The timestamp to check
 * @param {Object} range - The date range with start and end properties
 * @returns {boolean} True if timestamp is within range
 */
export const isWithinDateRange = (timestamp, range) => {
  if (!range || (!range.start && !range.end)) {
    return true;
  }
  
  const date = new Date(timestamp).getTime();
  
  if (range.start && date < new Date(range.start).getTime()) {
    return false;
  }
  
  if (range.end && date > new Date(range.end).getTime()) {
    return false;
  }
  
  return true;
};

/**
 * Parse a duration string (e.g., "1h 30m", "90s") to milliseconds
 * @param {string} durationStr - The duration string to parse
 * @returns {number} Duration in milliseconds
 */
export const parseDuration = (durationStr) => {
  if (typeof durationStr !== 'string') {
    return 0;
  }
  
  const units = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  
  const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (units[unit]) {
      totalMs += value * units[unit];
    }
  }
  
  return totalMs;
};

/**
 * Sleep for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise} Promise that resolves after the specified duration
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};