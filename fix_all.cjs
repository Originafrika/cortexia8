const fs = require('fs');

// Fix agent-run.ts: A16 - maxLength validation
let c1 = fs.readFileSync('src/lib/api/agent-run.ts', 'utf8');
c1 = c1.replace(
  'throw new HttpError(400, "message is required");\n    }\n    return data;',
  'throw new HttpError(400, "message is required");\n    }\n    if (data.message.length > 10000) {\n      throw new HttpError(400, "Message too long");\n    }\n    return data;'
);
fs.writeFileSync('src/lib/api/agent-run.ts', c1);
console.log('agent-run.ts done');

// Fix agent-apply.ts: A5 - validate model slugs
let c2 = fs.readFileSync('src/lib/api/agent-apply.ts', 'utf8');
c2 = c2.replace(
  'case "ADD_NODE": {\n      const pos = op.position',
  'case "ADD_NODE": {\n      if (typeof op.modelSlug !== "string" || !MODELS.find((m) => m.slug === op.modelSlug)) {\n        throw new HttpError(400, `Unknown model: ${op.modelSlug}`);\n      }\n      const pos = op.position'
);
fs.writeFileSync('src/lib/api/agent-apply.ts', c2);
console.log('agent-apply.ts A5 done');

// Fix generate.ts: P12 - prompt length validation
let c3 = fs.readFileSync('src/lib/api/generate.ts', 'utf8');
c3 = c3.replace(
  'if (!prompt || typeof prompt !== "string") {\n      setResponseStatus(event, 400);\n      return { error: "prompt is required" };\n    }',
  'if (!prompt || typeof prompt !== "string") {\n      setResponseStatus(event, 400);\n      return { error: "prompt is required" };\n    }\n    if (prompt.length > 10000) {\n      setResponseStatus(event, 400);\n      return { error: "prompt too long (max 10000 characters)" };\n    }'
);
fs.writeFileSync('src/lib/api/generate.ts', c3);
console.log('generate.ts P12 done');

// Fix i18n.ts: Add cancel key
let c4 = fs.readFileSync('src/lib/i18n.ts', 'utf8');
c4 = c4.replace(
  '"playground.ready_desc":',
  '"playground.cancel": "Annuler",\n  "playground.ready_desc":'
);
c4 = c4.replace(
  '"playground.ready_desc": "Configure and generate",',
  '"playground.cancel": "Cancel",\n  "playground.ready_desc": "Configure and generate",'
);
fs.writeFileSync('src/lib/i18n.ts', c4);
console.log('i18n.ts done');
