const fs = require("fs");
const path = require("path");

// Load package.json
const json = JSON.parse(fs.readFileSync('./package.json').toString());

if (process.argv.length < 3) {
  console.error("Usage: node program.js <entry-file>");
  process.exit(1);
}

const entryFile = path.resolve(process.argv[2]);
const visited = new Set();
let modules = [];
let moduleId = 0;
const moduleMap = {};

/**
 * Recursively collect modules
 */
function collectModule(filePath) {
  const absolutePath = path.resolve(filePath);

  if (visited.has(absolutePath)) {
    return moduleMap[absolutePath];
  }

  visited.add(absolutePath);

  const id = moduleId++;
  moduleMap[absolutePath] = id;

  let content = fs.readFileSync(absolutePath, "utf-8");

  // Find require("./something")
  const requireRegex = /require\(["'](.+?)["']\)/g;
  let match;

  const dependencies = [];

  while ((match = requireRegex.exec(content)) !== null) {
    const requiredPath = match[1];

    if (requiredPath.startsWith(".")) {
      const resolvedPath = path.resolve(
        path.dirname(absolutePath),
        requiredPath.endsWith(".js")
          ? requiredPath
          : requiredPath + ".js"
      );

      const depId = collectModule(resolvedPath);
      dependencies.push({ original: match[0], id: depId });
    }
  }

  // Replace require calls with __require(moduleId)
  dependencies.forEach(dep => {
    content = content.replace(
      dep.original,
      `__require(${dep.id})`
    );
  });

  modules.push(`
${id}: function(module, exports, __require) {
${content}
}
`);

  return id;
}

// Start collecting from entry
const entryId = collectModule(entryFile);

// Create bundle
const bundle = `
(function(modules) {
  const cache = {};

  function __require(id) {
    if (cache[id]) return cache[id].exports;

    const module = { exports: {} };
    cache[id] = module;

    modules[id](module, module.exports, __require);

    return module.exports;
  }

  __require(${entryId});
})({
${modules.join(",")}
});
`;

// Write output
fs.writeFileSync(`builds/zexl-${json.version}.js`, bundle);
