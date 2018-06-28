'use strict';

//  BANCO DE DADOS
exports.uriMongo      = "mongodb://pipoca:123456@ds141464.mlab.com:41464/api_monitoria";
exports.uriMongoLocal = "mongodb://localhost/MonitoriaUflaDB";

//  Bcrypt
exports.saltosCriptografia = 10;
exports.senhaPadrao = "123456";

//  PERÍODO ATUAL
exports.periodoAtual = '2018-01';

//  CÓDIGOS
exports.ultimosCodigosProf = {
    DCC: "003dcc",
    DEX: "001dex"
};