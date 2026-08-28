const test = require("node:test");
const assert = require("node:assert/strict");
const { GovIngestionService } = require("../dist/services/govIngestionService");

test("normaliza banderas y combustibles del archivo RES 1104/2004", () => {
  const service = new GovIngestionService();
  assert.deepEqual(service.normalizeBrand("SHELL C.A.P.S.A."), { id: "shell", name: "Shell" });
  assert.deepEqual(service.normalizeBrand("AXION ENERGY"), { id: "axion", name: "Axion Energy" });
  assert.deepEqual(service.normalizeProduct("Nafta (súper) entre 92 y 95 Ron"), { type: "SUPER", name: "Nafta Súper" });
  assert.deepEqual(service.normalizeProduct("Gas Oil Grado 3"), { type: "DIESEL_PREMIUM", name: "Diesel Premium" });
});

test("conserva sólo precios minoristas mensuales y usa el precio con impuestos cuando el surtidor es inválido", () => {
  const service = new GovIngestionService();
  const stations = new Map();
  const prices = new Map();
  service.collectRow({
    "Canal de Comercialización": "Al público",
    "Nro Inscripción": "1376",
    CUIT: "33-64337382-9",
    Dirección: "Av. Mosconi 299",
    Operador: "10 DE SETIEMBRE S.A.",
    Localidad: "LOMAS DEL MIRADOR",
    Provincia: "BUENOS AIRES",
    Bandera: "PUMA",
    Producto: "Gas Oil Grado 2",
    Período: "2025/01",
    "Precio surtidor": "1.18",
    "Precio con impuestos": "1181.67",
  }, stations, prices);
  service.collectRow({ "Canal de Comercialización": "Mayorista" }, stations, prices);

  assert.equal(stations.size, 1);
  assert.equal(prices.size, 1);
  const station = [...stations.values()][0];
  const price = [...prices.values()][0];
  assert.equal(station.govId, 1376);
  assert.equal(station.brand, "puma");
  assert.equal(price.price, 1181.67);
  assert.equal(price.timeSlot, "Mensual");
  assert.equal(price.effectiveDate.toISOString(), "2025-01-01T00:00:00.000Z");
});
