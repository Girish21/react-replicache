import esbuild from "esbuild";
import { performance } from "perf_hooks";
import { esbuildPluginNodeExternals } from "esbuild-plugin-node-externals";

async function go() {
  let start = performance.now();

  await esbuild.build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    plugins: [esbuildPluginNodeExternals()],
    treeShaking: process.env.NODE_ENV === "production",
    platform: "node",
    define: {
      "process.env.NODE_ENV":
        process.env.NODE_ENV === "production"
          ? '"production"'
          : '"development"',
    },
  });

  console.error(`📦 build done in ${(performance.now() - start).toFixed(2)}ms`);
}

go().catch((e) => {
  console.error(e);
  process.exit(1);
});
