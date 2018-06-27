'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlunoSchema = new Schema({
  nome: {
    type: String,
    maxlength: 80,
    required: true
  },
  matricula: {
    type: String,
    maxlength: 9,
    required: true
  },
  login: {
    type: String,
    maxlength: 50,
    required: true
  },
  senha: {
    type: String,
    required: true
  },
  monitorias: [{
    type: Schema.Types.ObjectId,
    ref: 'Monitoria'
  }]
});

var ProfessorSchema = new Schema({
  nome: {
    type: String,
    maxlength: 80,
    required: true
  },
  codigo: {
    type: String,
    maxlength: 6,
    required: true
  },
  departamento: {
    type: String,
    enum: ["DCC", "DEX"],
    required: true
  },
  telefone: {
    type: String,
    maxlength: 12,
    default: null
  },
  login: {
    type: String,
    maxlength: 50,
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

var prgSchema = new Schema ({
  nome: {
    type: String,
    maxlength: 80,
    required: true
  },
  codigo: {
    type: String,
    maxlength: 6,
    required: true
  },
  telefone: {
    type: String,
    maxlength: 12,
    default: null
  },
  login: {
    type: String,
    maxlength: 50,
    required: true
  },
  senha: {
    type: String,
    required: true
  }
});

var MonitorSchema = new Schema ({
  nome: {
    type: String,
    maxlength: 80,
    required: true
  },
  matricula: {
    type: String,
    maxlength: 9,
    required: true
  },
  login: {
    type: String,
    maxlength: 50,
    required: true
  },
  senha: {
    type: String,
    required: true
  },
  //FIXME: Mudar nome
  materiaMonitorada: { 
    type: Schema.Types.ObjectId,
    ref: 'Monitoria'
  }
});

var MonitoriaSchema = new Schema({
  nomeDisciplina: {
    type: String,
    maxlength: 80,
    required: true
  },
  codigoDisciplina: {
    type: String,
    maxlength: 6,
    required: true
  },
  departamento: {
    type: String,
    enum: ["DCC", "DEX"],
    required: true
  },
  professor: {
    type: Schema.Types.ObjectId,
    ref: 'Professor'
  },
  monitorID: {
    type: Schema.Types.ObjectId,
    ref: 'Monitor'
  },
  monitorNome: {
    type: String
  },
  professorNome: { 
    type: String 
  },
  oferta: {
    type: String,
    default: "2018-01"
  },
  local: {
    type: String,
    required: true
  },
  googlemaps: {
    type: String
  },
  tiposAtividades: [{
    type: String
  }],
  alunosInscritos: [{
    type: Schema.Types.ObjectId,
    ref: 'Aluno'
  }],
  planoDeTrabalho: [{
    type: Schema.Types.ObjectId,
    ref: 'Atividade'
  }],
  atividadesRegistradas: [{
    type: Schema.Types.ObjectId,
    ref: 'AtividadeRegistrada'
  }],
  horarioAtendimento: {
    type: Schema.Types.ObjectId,
    ref: 'HorarioMonitoria'
  }
});

var AtividadeSchema = new Schema ({
  tipo: {
    type: String,
    required: true,
    enum: ["ATV01", "ATV02", "ATV03", "ATV04", "ATV05"]
  },
  titulo: {
    type: String,
    required: true,
    maxlength: 100
  },
  observacoes: {
    type: String,
    maxlength: 200
  },
  periodo: {
    type: String,
    default: '2018-01'
  },
  horasTotais: {
    type: Number,
    required: true
  },
  horasContabilizadas: {
    type: Number,
    default: 0
  },
  porcentagem: {
    type: Number,
    default: 0
  },
  atividadesRegistradas: [{
    type: Schema.Types.ObjectId,
    ref: 'AtividadeRegistrada'
  }]
});

var AtividadeRegistradaSchema = new Schema ({
  tipo: {
    type: String,
    required: true
  },
  titulo: {
    type: String,
    required: true,
    maxlength: 100
  },
  observacoes: {
    type: String,
    maxlength: 200
  },
  contagemAtendimento: {
    type: Number,
    default: null
  },
  periodo: {
    type: String,
    default: '2018-01'
  },
  data: {
    registroHora: String,
    registroData: String,
    mes: Number,
    ano: Number,
    dia: Number
  },
  horaInicio: {
    type: String,
    required: true
  },
  horaTermino: {
    type: String,
    required: true
  },
  //FIXME: Mudar para horas totais
  horasRegistradas: {
    type: Number,
    required: true
  }
});

var HorarioMonitoriaSchema = new Schema ({
  monitoria: {
    type: Schema.Types.ObjectId,
    ref: 'Monitoria'
  },
  monitor: {
    type: Schema.Types.ObjectId,
    ref: 'Monitor'
  },
  segunda: [{
    type: String
  }],
  terca: [{
    type: String
  }],
  quarta: [{
    type: String
  }],
  quinta: [{
    type: String
  }],
  sexta: [{
    type: String
  }]
});

//  CRIA VARIÁVEIS PARA SEREM REFERENCIADAS EM OUTROS MODELOS
var Aluno = mongoose.model('Alunos', AlunoSchema);
var Professor = mongoose.model('Professores', ProfessorSchema);
var PRG = mongoose.model('PRG', prgSchema);
var Monitor = mongoose.model('Monitores', MonitorSchema);
var Monitoria = mongoose.model('Monitorias', MonitoriaSchema);
var Atividade = mongoose.model('Atividades', AtividadeSchema);
var AtividadeRegistrada = mongoose.model('AtividadesRegistradas', AtividadeRegistradaSchema);
var HorarioMonitoria = mongoose.model('HorariosMonitorias', HorarioMonitoriaSchema);

//  EXPORTA OS MODELOS PARA SEREM USADOS EM OUTROS ARQUIVOS
module.exports = mongoose.model('Alunos', AlunoSchema);
module.exports = mongoose.model('Professores', ProfessorSchema);
module.exports = mongoose.model('PRG', prgSchema);
module.exports = mongoose.model('Monitores', MonitorSchema);
module.exports = mongoose.model('Monitorias', MonitoriaSchema);
module.exports = mongoose.model('Atividades', AtividadeSchema);
module.exports = mongoose.model('AtividadesRegistradas', AtividadeRegistradaSchema);
module.exports = mongoose.model('HorariosMonitorias', HorarioMonitoriaSchema);