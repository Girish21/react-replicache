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

// src/index.ts
var import_compression = __toESM(require("compression"));
var import_cors = __toESM(require("cors"));
var import_dotenv = __toESM(require("dotenv"));
var import_express = __toESM(require("express"));
var import_morgan = __toESM(require("morgan"));
import_dotenv.default.config();
var app = (0, import_express.default)();
app.disable("x-powered-by");
app.use((0, import_compression.default)());
app.use((0, import_cors.default)());
app.use((0, import_morgan.default)("tiny"));
app.get("/", (_, res) => {
  return res.status(200).send("Hello World!");
});
app.listen(process.env.PORT, () => {
  console.error(`\u{1F680} Server listening on port ${process.env.PORT}`);
});
