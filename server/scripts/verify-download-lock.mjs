import http from "node:http";
import https from "node:https";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const FILE_NAME = process.env.FILE_NAME || "test.jpg";
const DOC_FILE_NAME = process.env.DOC_FILE_NAME || "";
const OWNER_TOKEN = process.env.OWNER_TOKEN || "";
const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN || "";

const parsed = new URL(BASE_URL);
const isHttps = parsed.protocol === "https:";
const httpModule = isHttps ? https : http;

function makeRawRequest({ method = "GET", rawPath, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      method,
      path: rawPath, // sent as-is over the socket
      headers: {
        Host: parsed.host,
        ...headers,
      },
    };

    const req = httpModule.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

async function runTests() {
  console.log(`\n=== Running Download Lock Verification against ${BASE_URL} ===\n`);
  console.log(`Target File: ${FILE_NAME}`);

  let passed = 0;
  let failed = 0;

  async function testCase(name, fn) {
    try {
      const res = await fn();
      if (res.pass) {
        console.log(` [PASS] ${name} -> Got ${res.status}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${name} -> Expected ${res.expected}, got ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`💥 [ERROR] ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Lock bypass test paths without token (must NOT be 200: expect 403 or 404)
  const lockedPaths = [
    `/uploads/campaigns/${FILE_NAME}`,
    `/uploads//campaigns/${FILE_NAME}`,
    `/uploads/campaigns%2F${FILE_NAME}`,
    `/uploads/%63ampaigns/${FILE_NAME}`,
    `/uploads/./campaigns/${FILE_NAME}`,
    `/UPLOADS/CAMPAIGNS/${FILE_NAME}`,
    `/uploads/campaigns%5C${FILE_NAME}`,
    `/uploads/campaigns%252FFILE`,
    `/uploads/campaigns/${FILE_NAME}/`,
    `/uploads/campaigns/..%2Fcampaigns/${FILE_NAME}`,
  ];

  console.log("--- 1. Lock Bypass Variations (releaseFiles=false, no token) ---");
  for (const p of lockedPaths) {
    await testCase(`Path: ${p}`, async () => {
      const res = await makeRawRequest({ rawPath: p });
      const isNot200 = res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 400;
      return {
        pass: isNot200,
        status: res.statusCode,
        expected: "403 or 404",
      };
    });
  }

  // 2. HEAD and Range on locked path without token
  console.log("\n--- 2. HEAD & Range Header (releaseFiles=false, no token) ---");
  await testCase(`HEAD /uploads/campaigns/${FILE_NAME}`, async () => {
    const res = await makeRawRequest({ method: "HEAD", rawPath: `/uploads/campaigns/${FILE_NAME}` });
    return {
      pass: res.statusCode === 403 || res.statusCode === 404,
      status: res.statusCode,
      expected: "403 or 404",
    };
  });

  await testCase(`GET with Range: bytes=0-10 on locked path`, async () => {
    const res = await makeRawRequest({
      rawPath: `/uploads/campaigns/${FILE_NAME}`,
      headers: { Range: "bytes=0-10" },
    });
    return {
      pass: res.statusCode === 403 || res.statusCode === 404,
      status: res.statusCode,
      expected: "403 or 404",
    };
  });

  // 3. OWNER_TOKEN tests
  if (OWNER_TOKEN) {
    console.log("\n--- 3. Authorized Owner Token Tests ---");
    await testCase(`GET /uploads/campaigns/${FILE_NAME} with OWNER_TOKEN`, async () => {
      const res = await makeRawRequest({
        rawPath: `/uploads/campaigns/${FILE_NAME}`,
        headers: { Authorization: `Bearer ${OWNER_TOKEN}` },
      });
      return {
        pass: res.statusCode === 200,
        status: res.statusCode,
        expected: "200",
      };
    });

    await testCase(`GET with Range: bytes=0-10 and OWNER_TOKEN (video seeking test)`, async () => {
      const res = await makeRawRequest({
        rawPath: `/uploads/campaigns/${FILE_NAME}`,
        headers: {
          Authorization: `Bearer ${OWNER_TOKEN}`,
          Range: "bytes=0-10",
        },
      });
      return {
        pass: res.statusCode === 206 || res.statusCode === 200,
        status: res.statusCode,
        expected: "206 (or 200)",
      };
    });
  }

  // 4. PREVIEW_TOKEN tests
  if (PREVIEW_TOKEN) {
    console.log("\n--- 4. Preview Token Tests ---");
    await testCase(`GET media with ?token=PREVIEW_TOKEN`, async () => {
      const res = await makeRawRequest({
        rawPath: `/uploads/campaigns/${FILE_NAME}?token=${PREVIEW_TOKEN}`,
      });
      return {
        pass: res.statusCode === 200,
        status: res.statusCode,
        expected: "200",
      };
    });

    if (DOC_FILE_NAME) {
      await testCase(`GET document with ?token=PREVIEW_TOKEN (expect 403)`, async () => {
        const res = await makeRawRequest({
          rawPath: `/uploads/campaigns/${DOC_FILE_NAME}?token=${PREVIEW_TOKEN}`,
        });
        return {
          pass: res.statusCode === 403,
          status: res.statusCode,
          expected: "403",
        };
      });
    }
  }

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===\n`);
  return failed === 0;
}

runTests().then((success) => {
  if (!success) {
    process.exit(1);
  }
});
