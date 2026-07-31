#!/usr/bin/env python3
FILE = "src/routes/app.models.$slug.tsx"
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# P15: initState missing longtext/prompt
content = content.replace('    if (p.kind === "upload") init[p.key] = [];\n  });\n  return init;\n}', '    if (p.kind === "upload") init[p.key] = [];\n    if (p.kind === "longtext") init[p.key] = "";\n    if (p.kind === "prompt") init[p.key] = "";\n  });\n  return init;\n}')

# P9: Use crypto.randomUUID()
content = content.replace("const genId = `gen_${Date.now()}`;", "const genId = `gen_${crypto.randomUUID()}`;")
content = content.replace("const errGenId = `err_${Date.now()}`;", "const errGenId = `err_${crypto.randomUUID()}`;")

# P7/P8: Per-gen timers
content = content.replace("const timers = useRef<number[]>([]);", "const timersRef = useRef<Map<string, number[]>>(new Map());")
content = content.replace("function clearTimers() {\n    timers.current.forEach((t) => window.clearTimeout(t));\n    timers.current = [];\n  }", "function clearGenTimers(genId: string) {\n    const genTimers = timersRef.current.get(genId) ?? [];\n    genTimers.forEach((t) => window.clearTimeout(t));\n    timersRef.current.delete(genId);\n  }\n  function clearAllTimers() {\n    for (const [, genTimers] of timersRef.current) {\n      genTimers.forEach((t) => window.clearTimeout(t));\n    }\n    timersRef.current.clear();\n  }")
content = content.replace("timers.current.push(window.setTimeout(poll, 2000));", "const genTimers = timersRef.current.get(genId) ?? []; genTimers.push(window.setTimeout(poll, 2000)); timersRef.current.set(genId, genTimers);")
content = content.replace("clearTimers();", "clearAllTimers();")
content = content.replace("useEffect(() => () => clearTimers(), []);", "useEffect(() => () => clearAllTimers(), []);")

# P16: Cancel button
content = content.replace("function LoadingCard({ model, progress }: { model: Model; progress: number }) {", "function LoadingCard({ model, progress, onCancel }: { model: Model; progress: number; onCancel?: () => void }) {")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
