// SES warning filter
// This file filters out deprecated SES warnings from @dfinity packages

// Store the original console.warn function
const originalWarn = console.warn;

// Override console.warn to filter out SES deprecation warnings
console.warn = function(...args) {
  const message = args.join(' ');
  
  // Filter out specific SES deprecation warnings
  if (message.includes("SES The 'dateTaming' option is deprecated") ||
      message.includes("SES The 'mathTaming' option is deprecated")) {
    return; // Don't log these warnings
  }
  
  // Log all other warnings normally
  originalWarn.apply(console, args);
};

console.log('SES deprecation warnings filtered out');
