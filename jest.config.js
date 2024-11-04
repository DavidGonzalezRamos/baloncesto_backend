/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  verbose: true, // Asegúrate de que Jest muestre información detallada sobre cada prueba
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};