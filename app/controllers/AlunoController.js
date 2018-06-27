'use strict';

var mongoose       = require('mongoose');
var Aluno          = mongoose.model('Alunos');
var Monitoria      = mongoose.model('Monitorias');
var horarioMonitor = mongoose.model("HorariosMonitorias");


exports.cadastrarMonitoria = function(req, res) {
  if (req.session.user.perfilUsuario == 'Aluno') {
    //  Encontra monitoria para cadastro e atualiza com ID do aluno
    Monitoria.findByIdAndUpdate(
      {_id: req.params.monitoriaId},
      {$push: {alunosInscritos: req.session.user.usuario._id}},
      {safe: true, upsert: true}, 
      function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        //  Encontra aluno que quer se cadastrar na monitoria e atualiza seu campo Monitorias
        //  com a ID da monitoria desejada
        Aluno.findByIdAndUpdate(
          {_id: req.session.user.usuario._id},
          {$push: {monitorias: monitoria._id}},
          {safe: true, upsert: true},
          function(err) {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/monitorias/informacoes/'+monitoria._id);
            }
        });
      }
    });
  }  else {
    res.send('Não autorizado!');
  }
};

exports.removerCadastroMonitoria = function(req, res) {
  if (req.session.user.perfilUsuario == 'Aluno') {
    //  Encontra monitoria para cadastro e atualiza com ID do aluno
    Monitoria.findByIdAndUpdate(
      {_id: req.params.monitoriaId},
      {$pop: {alunosInscritos: req.session.user.usuario._id}},
      {safe: true, upsert: true}, 
      function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        //  Encontra aluno que quer se cadastrar na monitoria e atualiza seu campo Monitorias
        //  com a ID da monitoria desejada
        Aluno.findByIdAndUpdate(
          {_id: req.session.user.usuario._id},
          {$pop: {monitorias: monitoria._id}},
          {safe: true, upsert: true},
          function(err) {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/monitoriasCadastradas');
            }
        });
      }
    });
  }  else {
    res.send('Não autorizado!');
  }
};

exports.listarMonitoriasCadastradas = function(req, res) {
  if (req.session.user.perfilUsuario == 'Aluno') {
    //  Array criado para adicionar as Ids das monitorias no qual o aluno se cadastrou
    var arrayIds = [];

    Aluno.findById({_id: req.session.user.usuario._id}, function(err, aluno) {
      if (err) {
        res.json(err);
      } else {
        //  Percorre o array das monitorias cadastradas pelo aluno
        for (var i = 0; i < aluno.monitorias.length; i++) {
          arrayIds.push(aluno.monitorias[i])
        }

        //  Encontra cada monitoria e adiciona num array
        Monitoria.find({_id:{ $in: arrayIds }}, function(err, monitorias) {
          if (err) {
            res.json(err);
          } else {
            res.render('alunos/monitoriasCadastradas', {"monitorias": monitorias});
          }
        });
      }

    });
  } else {
    res.send('Não autorizado!');
  }
};

exports.informacaoMonitoriaCadastrada = function(req, res) {
  if (req.session.user.perfilUsuario == 'Aluno') {
    var flagPossuiHorarioAtendimento = false;

    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        if (monitoria.horarioAtendimento == null ) {
          res.render("alunos/informacoesMonitoriaCadastrada", {"monitoria": monitoria, "flagPossuiHorarioAtendimento": flagPossuiHorarioAtendimento});
        } else {
          flagPossuiHorarioAtendimento = true;
          horarioMonitor.findById(monitoria.horarioAtendimento, function(err, horario) {
            res.render("alunos/informacoesMonitoriaCadastrada", {"monitoria": monitoria, "flagPossuiHorarioAtendimento": flagPossuiHorarioAtendimento, "horario": horario}); 
          });        
        }
      }
    });
  } else {
    res.send('Não autorizado!');
  }  
};


/*
exports.listarAlunos = function(req, res) {
  Aluno.find({}, function(err, alunos) {
    if (err) {
      res.json(err);
    } else {
      res.render('adm/alunos', {"alunos": alunos});
    }
  });
};

exports.criarAluno = function(req, res) {
  //  Cria novo objeto Aluno
  var aluno_cadastro = new Aluno();
  //  Salva todos as info da requisição em cada componente de Aluno
  aluno_cadastro.nome = req.body.nome;
  aluno_cadastro.matricula = req.body.matricula;
  aluno_cadastro.telefone = req.body.telefone;
  aluno_cadastro.login = req.body.login;
  aluno_cadastro.senha = req.body.senha;
  aluno_cadastro.nota = req.body.nota;

  // Salva aluno no BD
  aluno_cadastro.save(function(err, aluno) {
    if (err) {
      res.json(err);
    } else {
      console.log('Aluno cadastrado com sucesso');
      res.redirect('/adm/alunos');
    }
  });
};

exports.deletarAluno = function(req, res) {
  Aluno.remove({_id: req.params.alunoId}, function(err, aluno) {
    if (err) {
      res.json(err);
    } else {
      console.log('Aluno deletado com sucesso');
      res.redirect('/adm/alunos');
    }
  });
};

exports.mostrarAlunoEdicao = function(req, res) {
  Aluno.find({_id: req.params.alunoId}, function(err, aluno) {
    if (err) {
      res.json(err);
    } else {
      //  parametro aluno é um array de alunos, então para pegar um único se acessa a posição 0
      res.render('edicao/edicaoAluno', {"aluno": aluno[0]} );
    }
  });
};

exports.editarAluno = function(req, res) {
  var nome = req.body.nome;
  var matricula = req.body.matricula;
  var telefone = req.body.telefone;
  var login = req.body.login;
  var senha = req.body.senha;
  var nota = req.body.nota;
  var monitorias = req.body.monitorias;

  Aluno.findOneAndUpdate({_id: req.params.alunoId}, {nome, matricula, telefone, login, senha, nota, monitorias}, function(err, aluno)  {
      if (err) {
        return console.log(err);
      }
      res.redirect('/adm/alunos');
  });
};
*/