const test = require("node:test");
const assert = require("node:assert/strict");
const { GovIngestionService } = require("../dist/services/govIngestionService");

test("normaliza las principales banderas y combustibles del CSV oficial", () => {
  const service = new GovIngestionService();
  assert.deepEqual(service.normalizeBrand("SHELL C.A.P.S.A."), { id: "shell", name: "Shell" });
  assert.deepEqual(service.normalizeBrand("AXION ENERGY"), { id: "axion", name: "Axion Energy" });
  assert.deepEqual(service.normalizeProduct("Nafta (súper) entre 92 y 95 Ron"), { type: "SUPER", name: "Nafta Súper" });
  assert.deepEqual(service.normalizeProduct("Gas Oil Grado 3"), { type: "DIESEL_PREMIUM", name: "Diesel Premium" });
});
