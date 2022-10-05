"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/db.ts
var import_pg_promise = __toESM(require("pg-promise"));
var pgp = (0, import_pg_promise.default)();
var db = pgp(process.env.DATABASE_URL);

// src/controller/replicache-pull.ts
var import_perf_hooks = require("perf_hooks");
async function replicachePull(req, res) {
  const pull = req.body;
  console.log(`processing pull: ${JSON.stringify(pull)}`);
  const t0 = import_perf_hooks.performance.now();
  try {
    await db.tx(async (t) => {
      const lastMutationID = parseInt(
        (await t.oneOrNone(
          "select last_mutation_id from replicache_client where id = $1",
          pull.clientID
        ))?.last_mutation_id ?? "0"
      );
      const changed = await t.manyOrNone(
        "select id, count, ord from counts where version >= $1",
        pull.cookie
      );
      const cookie = (await t.one("select max(version) as version from counts"))?.version ?? 0;
      console.log({ lastMutationID, changed, cookie });
      const patch = [];
      if (pull.cookie === null) {
        patch.push({ op: "clear" });
      }
      patch.push(
        ...changed.map((row) => ({
          op: "put",
          key: `count/${row.id}`,
          value: { count: row.count, order: parseInt(row.ord) }
        }))
      );
      return res.status(200).json({ lastMutationID, patch, cookie });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  } finally {
    console.log("Processed pull in", import_perf_hooks.performance.now() - t0);
  }
}
var replicache_pull_default = replicachePull;

// src/controller/replicache-push.ts
var import_pusher = __toESM(require("pusher"));
async function replicachePush(req, res) {
  const push = req.body;
  console.log(`processing: ${JSON.stringify(push)}`);
  const t0 = performance.now();
  try {
    await db.tx(async (t) => {
      const { version } = await t.one(`select nextval('version') as version`);
      let lastMutationID = await getLastMutationID(t, push.clientID);
      console.log(`version: ${version}
lastMutationID: ${lastMutationID}`);
      for (const mutation of push.mutations) {
        const t1 = performance.now();
        const expectedMutationID = lastMutationID + 1;
        if (mutation.id < expectedMutationID) {
          console.log(`skipping mutation ${mutation.id} - already applied`);
          continue;
        }
        if (mutation.id > expectedMutationID) {
          console.log(`skipping mutation ${mutation.id} - from the future`);
          continue;
        }
        console.log(`applying mutation ${JSON.stringify(mutation)}`);
        switch (mutation.name) {
          case "addCount": {
            await setCount(
              t,
              {
                id: mutation.args.id,
                count: mutation.args.count,
                order: mutation.args.order
              },
              version
            );
            break;
          }
          default:
            console.log(`unknown mutation: ${mutation.name}`);
        }
        lastMutationID = expectedMutationID;
        console.log("Processed mutation in", performance.now() - t1);
      }
      console.log(
        `updating ${push.clientID} lastMutationID to ${lastMutationID}`
      );
      await t.none(
        "UPDATE replicache_client SET last_mutation_id = $2 WHERE id = $1",
        [push.clientID, lastMutationID]
      );
    });
    await sendPoke();
    return res.status(200).end();
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  } finally {
    console.log(`processing took ${performance.now() - t0}ms`);
  }
}
async function getLastMutationID(t, clientId) {
  const clientRow = await t.oneOrNone(
    `select last_mutation_id from replicache_client where id = $1`,
    clientId
  );
  if (clientRow) {
    return parseInt(clientRow.last_mutation_id);
  }
  console.log(`creating new client: ${clientId}`);
  await t.none(
    `insert into replicache_client (id, last_mutation_id) values ($1, 0)`,
    clientId
  );
  return 0;
}
async function setCount(t, data, version) {
  await t.none(
    `insert into counts (id, count, ord, version) values ($1, $2, $3, $4)`,
    [data.id, data.count, data.order, version]
  );
}
async function sendPoke() {
  const pusher = new import_pusher.default({
    appId: process.env.REPLICHAT_PUSHER_APP_ID,
    key: process.env.REPLICHAT_PUSHER_KEY,
    secret: process.env.REPLICHAT_PUSHER_SECRET,
    cluster: process.env.REPLICHAT_PUSHER_CLUSTER,
    useTLS: true
  });
  const t0 = performance.now();
  await pusher.trigger("default", "poke", {});
  console.log(`Sent poke in ${performance.now() - t0}ms`);
}
var replicache_push_default = replicachePush;

// src/index.ts
var import_compression = __toESM(require("compression"));
var import_cors = __toESM(require("cors"));
var import_express = __toESM(require("express"));
var import_morgan = __toESM(require("morgan"));
var app = (0, import_express.default)();
app.disable("x-powered-by");
app.use((0, import_compression.default)());
app.use((0, import_cors.default)());
app.use((0, import_morgan.default)("tiny"));
app.use(import_express.default.json({ limit: "64mb" }));
app.get("/", (_, res) => {
  return res.status(200).send("Hello World!");
});
app.post("/init", async (_, res) => {
  await db.task(async (t) => {
    await t.none("drop table if exists counts");
    await t.none("drop table if exists replicache_client");
    await t.none("drop sequence if exists version");
    await t.none(
      "create table counts (id text primary key not null, count int not null, ord bigint not null, version bigint not null)"
    );
    await t.none(
      "create table replicache_client (id text primary key not null, last_mutation_id bigint not null)"
    );
    await t.none("create sequence version");
  });
  return res.status(200).end();
});
app.post("/replicache-pull", replicache_pull_default);
app.post("/replicache-push", replicache_push_default);
app.listen(process.env.PORT, () => {
  console.error(`\u{1F680} Server listening on port ${process.env.PORT}`);
});
