const dns = require("dns").promises;
const net = require("net");

const isPrivateIPv4 = (ip) => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
};

const isPrivateIPv6 = (ip) => {
  const norm = ip.toLowerCase();
  if (norm === "::1" || norm === "::") return true;
  if (norm.startsWith("fe80:") || norm.startsWith("fe80::")) return true;
  if (/^f[cd][0-9a-f]{2}:/.test(norm)) return true;
  const mapped = norm.match(/^::ffff:([0-9.]+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
};

const isPrivateIP = (ip) => {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
};

const assertSafeUrl = async (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "");
  if (!hostname) throw new Error("URL is missing a hostname");

  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error(
        "URLs pointing to private, loopback, or link-local addresses are not allowed"
      );
    }
    return;
  }

  if (!hostname.includes(".")) {
    throw new Error("Internal hostnames are not allowed");
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("Unable to resolve hostname");
  }

  if (!addresses.length) throw new Error("Unable to resolve hostname");

  for (const { address } of addresses) {
    if (isPrivateIP(address)) {
      throw new Error(
        "Hostname resolves to a private, loopback, or link-local address"
      );
    }
  }
};

const ssrfGuard =
  (getUrl = (req) => req.body && req.body.url) =>
  async (req, res, next) => {
    const url = getUrl(req);
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing or invalid URL" });
    }
    try {
      await assertSafeUrl(url);
      next();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  };

module.exports = { assertSafeUrl, ssrfGuard, isPrivateIP };
