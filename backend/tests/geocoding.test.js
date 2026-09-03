const test = require("node:test");
const assert = require("node:assert/strict");
const { GeocodingService } = require("../dist/services/geocodingService");

test("prioriza estaciones de servicio y convierte coordenadas válidas", () => {
  const service = new GeocodingService();
  const result = service.pickCandidate([
    { lat: "-34.50", lon: "-58.70", type: "house", address: { country_code: "ar" } },
    { lat: "-34.5087141", lon: "-58.7284325", category: "amenity", type: "fuel", address: { country_code: "ar" } },
  ]);
  assert.deepEqual(result, { lat: -34.5087141, lng: -58.7284325 });
});

test("rechaza resultados extranjeros, inválidos o fuera de Argentina", () => {
  const service = new GeocodingService();
  assert.equal(service.pickCandidate([
    { lat: "40.41", lon: "-3.70", category: "amenity", type: "fuel", address: { country_code: "es" } },
    { lat: "texto", lon: "-58.7", address: { country_code: "ar" } },
  ]), null);
});
