export const log = (message, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[BTC.com] (${new Date().toDateString()}) ${message}`, ...args);
  }
};
