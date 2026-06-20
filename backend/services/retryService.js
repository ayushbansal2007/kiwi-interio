/**
 * Dynamic Retry with Exponential Backoff Engine (Crash Proof)
 * @param {Function} fn - Asynchronous function jo execute karni hai (e.g., Axios API call)
 * @param {number} retries - Maximum kitni baar try karna hai
 */
async function retryWithBackoff(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // 🚀 Run the original function
      return await fn();
    } catch (error) {
      // 🔥 FIX 1: Axios error structures safely extract karo
      const status = error.response?.status;
      const headers = error.response?.headers;

      // 🚨 Case A: Agar strictly 429 (Rate Limit Hit) hua hai
      if (status === 429) {
        // 🔥 FIX 2: Axios headers object se direct value uthao (case-insensitive check)
        const retryAfterHeader = headers?.['retry-after'] || headers?.['Retry-After'];
        
        // 🔥 FIX 3: Exponential Backoff Formula applied if header is missing
        // i = 0 -> Wait 2s | i = 1 -> Wait 4s | i = 2 -> Wait 8s
        const defaultBackoff = Math.pow(2, i) * 2; 
        
        const retryAfterSeconds = Number(retryAfterHeader) || defaultBackoff;

        console.warn(
          `⚠️ [RATE LIMIT 429]: Attempt ${i + 1} failed. Engine backing off for ${retryAfterSeconds}s...`
        );

        // Wait code execution block cleanly
        await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000));

        // Agle loop cycle par jao (Retry)
        continue;
      }

      // 🚨 Case B: Agar error 429 nahi hai (e.g., 500 Server Error ya 401 Unauthorized), 
      // toh faltu me wait mat karo, turant error phenk do!
      console.error(`❌ [CRITICAL ERROR]: Status ${status || 'Unknown'} - Skipping retry pipeline.`);
      throw error;
    }
  }

  // 🚨 Agar saare attempts exhausted ho gaye
  throw new Error(`[RETRY EXHAUSTED]: AI Endpoint failed to respond after ${retries} attempts.`);
}

module.exports = retryWithBackoff;