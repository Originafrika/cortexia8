const fs = require('fs');
let c = fs.readFileSync('server/api/v1/generate.ts', 'utf8');
const old = 'if (!prompt || typeof prompt !== "string") {\n      setResponseStatus(event, 400);\n      return { error: "prompt is required" };\n    }';
const rep = 'if (!prompt || typeof prompt !== "string") {\n      setResponseStatus(event, 400);\n      return { error: "prompt is required" };\n    }\n    if (prompt.length > 10000) {\n      setResponseStatus(event, 400);\n      return { error: "prompt too long (max 10000 characters)" };\n    }';
c = c.replace(old, rep);
fs.writeFileSync('server/api/v1/generate.ts', c);
console.log('Done:', c.includes('10000'));
