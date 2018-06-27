'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Monitorias = require('./monitoriaSchema');

var ProfessorTSchema = new Schema({
    nome: {
      type: String,
      required: true
    },
    codigo: {
      type: String,
      required: true
    },
    telefone: {
      type: String,
      default: null
    },
    login: {
      type: String,
      required: true
    },
    senha: {
      type: String,
      required: true
    },
    eOrientador: {
        type: Boolean,
        default: false
    },
    monitorias: [{
      type: Schema.Types.ObjectId,
      ref: 'Monitorias'
    }]
  });

//  EXPORTA OS MODELOS PARA SEREM USADOS EM OUTROS ARQUIVOS
var ProfessorT = mongoose.model('ProfessoresT', ProfessorTSchema);
module.exports = mongoose.model('ProfessoresT', ProfessorTSchema);
