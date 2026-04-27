const axios = require("axios");

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const attemptProbe = async (url) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    const responseTime = Date.now() - startTime;
    const httpStatusCode = response.status;

    let errorType = null;
    if (httpStatusCode >= 500) errorType = "http_5xx";
    else if (httpStatusCode >= 400) errorType = "http_4xx";
    else if (httpStatusCode >= 300) errorType = "http_3xx";

    const status = httpStatusCode >= 200 && httpStatusCode < 400 ? "Up" : "Down";

    return {
      status,
      httpStatusCode,
      responseTime,
      errorType,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorType = "network_error";

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      errorType = "timeout";
    } else if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
      errorType = "dns_failure";
    } else if (error.code === "ECONNREFUSED") {
      errorType = "connection_refused";
    } else if (error.code === "ECONNRESET") {
      errorType = "connection_reset";
    } else if (
      error.code === "ERR_FR_TOO_MANY_REDIRECTS" ||
      /redirect/i.test(error.message || "")
    ) {
      errorType = "too_many_redirects";
    }

    return {
      status: "Down",
      httpStatusCode: 0,
      responseTime,
      errorType,
    };
  }
};

const probe = async (url) => {
  let result;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result = await attemptProbe(url);
    if (result.status === "Up") {
      return { ...result, attempts: attempt };
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }
  return { ...result, attempts: MAX_ATTEMPTS };
};

module.exports = { probe, attemptProbe };
