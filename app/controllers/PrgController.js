'use strict';

var mongoose = require('mongoose');
var PRG = mongoose.model('PRG');
var Professor = mongoose.model('Professores');
var Monitor = mongoose.model('Monitores');
var Monitoria = mongoose.model('Monitorias');

exports.exibirIndexRelatorios = function(req, res) {
  if (req.session.user) {
    res.render('prg/relatorios', {"perfil": req.session.user.perfilUsuario});
  } else {
    res.redirect('/login');
  }
};

exports.exibirTipoRelatorio = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'PRG') {
    if (req.params.relatorioId == 1) {
      this.exibirRelatorioMonitorias(req, res);
    } else if (req.params.relatorioId == 2) {
      this.exibirRelatorioOrientadores(req, res);
    } else if (req.params.relatorioId == 3) {
      this.exibirRelatorioMonitores(req, res);
    } else {
      res.json('erro');
    }
  } else {
    res.redirect('/login');
  }
};

//TODO:
exports.exibirRelatorioMonitores = function (req, res) {
  if (req.session.user) {
    res.render('', {"perfil": req.session.user.perfilUsuario});
  } else {
    res.redirect('/login');
  }
};

exports.exibirRelatorioOrientadores = function (req, res) {
  if (req.session.user) {
    res.render('prg/relatorioBuscaOrientadores', {"perfil": req.session.user.perfilUsuario});
  } else {
    res.redirect('/login');
  }
};

//TEST:
exports.exibirRelatorioOrientadoresResultados = function (req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'PRG') {
    if (req.body.departamento == "XXX") {
      this.pesquisarTudoOrientadores(req, res);
    } else {
      this.pesquisarComFiltroOrientadores(req, res);
    }
  } else {
    res.redirect('/login');
  }
};

//TODO:
exports.pesquisarTudoOrientadores = function(req, res) {
  console.log('\nDEFAULT');
  console.log('DEPARTAMENTO:'+req.body.departamento);

  // Encontra todas as monitorias
  Professor.find({}, function(err, professores) {
    if (err) {
      res.json(err);
    } else {
      res.render('prg/relatorioResultadoMonitorias', {"perfil": req.session.user.perfilUsuario, "professores": professores});
    }
  });
};

//TODO:
exports.pesquisarComFiltroOrientadores = function(req, res) {
  console.log('\nNÃO DEFAULT');
  console.log('DEPARTAMENTO:'+req.body.departamento);

  // Encontra cada monitoria
  Professor
  .find(
    {$and: {'departamento': req.body.departamento}},
    function(err, professores) {
    if(err) {
      res.json(err);
    } else {
      res.render('prg/relatorioResultadoMonitorias', {"perfil": req.session.user.perfilUsuario, "professores": professores});
    }
  });
};

exports.exibirRelatorioMonitorias = function (req, res) {
  if (req.session.user) {
    res.render('prg/relatorioBuscaMonitorias', {"perfil": req.session.user.perfilUsuario});
  } else {
    res.redirect('/login');
  }
};

exports.exibirRelatorioMonitoriasResultados = function (req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'PRG') {
    if ((req.body.oferta == "0000-00") && (req.body.departamento == "XXX")) {
      this.pesquisarTudo(req, res);
    } else {
      this.pesquisarComFiltro(req, res);
    }
  } else {
    res.redirect('/login');
  }
};

exports.pesquisarTudo = function(req, res) {
  //console.log('\nDEFAULT');
  //console.log('DEPARTAMENTO:'+req.body.departamento);
  //console.log('PERÍODO:'+req.body.oferta);

  // Encontra todas as monitorias
  Monitoria.find({}, function(err, monitorias) {
    if (err) {
      res.json(err);
    } else {
      res.render('prg/relatorioResultadoMonitorias', {"perfil": req.session.user.perfilUsuario, "monitorias": monitorias});
    }
  });
};

exports.pesquisarComFiltro = function(req, res) {
  //console.log('\nNÃO DEFAULT');
  //console.log('DEPARTAMENTO:'+req.body.departamento);
  //console.log('PERÍODO:'+req.body.oferta);

  var filtroPesquisa = [];

  if (req.body.oferta != '0000-00') {
    filtroPesquisa.push({'oferta': req.body.oferta});
  }

  if (req.body.departamento != 'XXX') {
    filtroPesquisa.push({'departamento': req.body.departamento});
  }

  // Encontra cada monitoria
  Monitoria
  .find(
    {$and: filtroPesquisa},
    function(err, monitorias) {
    if(err) {
      res.json(err);
    } else {
      res.render('prg/relatorioResultadoMonitorias', {"perfil": req.session.user.perfilUsuario, "monitorias": monitorias});
    }
  });
};

exports.exibirInformacoesMonitoria = function(req, res) {
  if (req.session.user) {
    //  Flags criadas para identificar quais informações terão ou não na página
    var flagPlanoT = false;
    var flagAtivReg = false;

    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        //  verifica se a monitoria já possui plano de trabalho registrado
        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlanoT = true;

          //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
          if (monitoria.atividadesRegistradas.length > 0) {
            flagAtivReg = true;
            res.render('prg/informacoesMonitoria', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          } else {
            res.render('prg/informacoesMonitoria', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          }  

        } else {
          res.render('prg/informacoesMonitoria', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT});
        }  
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirRelatorioAtividades = function (req, res) {
  if (req.session.user) {
    res.render('', {"perfil": req.session.user.perfilUsuario});
  } else {
    res.redirect('/login');
  }
};

/*
exports.listarPRG = function(req, res) {
  PRG.find({}, function(err, membrosPRG) {
    if (err) {
      res.json(err);
    } else {
      res.render('adm/prg', {"membrosPRG": membrosPRG});
    }
  });
};


exports.criarPRG = function(req, res) {
  //    Cria novo objeto PRG
  var prg_cadastro = new PRG();
  
  //    Salva todos as info da requisição em cada componente de Aluno
  prg_cadastro.nome = req.body.nome;
  prg_cadastro.codigo = req.body.codigo;
  prg_cadastro.telefone = req.body.telefone;
  prg_cadastro.login = req.body.login;
  prg_cadastro.senha = req.body.senha;

  //    Salva membro da PRG no BD
  prg_cadastro.save(function(err, membroPRG) {
    if (err) {
      res.json(err);
    } else {
      console.log('Membro da PRG cadastrado com sucesso');
      res.redirect('/adm/prg');
    }
  });
};

exports.deletarPRG = function(req, res) {
  PRG.remove({_id: req.params.prgId}, function(err, membroPRG) {
    if (err) {
      res.json(err);
    } else {
      console.log('Membro da PRG deletado com sucesso');
      res.redirect('/adm/prg');
    }
  });
};


exports.mostrarPRGIndex = function(req, res) {
  PRG.findById({_id: req.params.prgId}, function(err, prg) {
    if (err) {
      res.json(err);
    }
    res.render('index/indexPRG', {"prg": prg});
  });
};


exports.mostrarPRGEdicao = function(req, res) {
  PRG.find({_id: req.params.prgId}, function(err, membroPRG) {
    if (err) {
      res.json(err);
    } else {
      res.render('edicao/edicaoPRG', {"membroPRG": membroPRG[0]} );
    }
  });
};


exports.editarPRG = function(req, res) {
  PRG.findOneAndUpdate({_id: req.params.alunoId}, 
    {nome: req.body.nome, codigo: req.body.codigo , telefone: req.body.codigo, login: req.body.login, senha: req.body.senha}, function(err, membroPRG)  {
      if (err) {
        return console.log(err);
      }
      res.redirect('/adm/prg');
  });
};

exports.gerarRelatorio = function(req, res) {
  //  OPÇÃO 1 DE RELATÓRIO: Listar Todas as Monitorias Vigentes
  if (req.params.opcaoId == 'op1') {
    Monitoria.find({}, function(err, monitorias) {
      if (err) {
        res.json(err);
      } else {
        res.render('relatorios/listagemDeMonitorias', {"monitorias": monitorias});
      }
    });
  
  //  OPÇÃO 2 DE RELATÓRIO: Listar Todas as Monitorias de Mesmas Disciplinas 
  //  -> TERMINAR TERMINAR TERMINAR TERMINAR TERMINAR TERMINAR TERMINAR TERMINAR 
  } else if (req.params.opcaoId == 'op2') {
    Monitoria.find({nomeDisciplina: req.body.nomeDisciplina}, function(err, monitorias) {
      if (err) {
        res.json(err);
      } else {
        res.render('relatorios/listagemDeMonitorias', {"monitorias": monitorias});
      }
    });

  //  OPÇÃO 3 DE RELATÓRIO: Listar Todos os Orientadores  
  } else if (req.params.opcaoId == 'op3') {
    Professor.find({eOrientador: true}, function(err, professores) {
      if (err) {
        res.json(err);
      }  else {
        res.render('relatorios/listagemdeMonitores', {"professores": professores});
      }
    });

  //  OPÇÃO 4 DE RELATÓRIO: Listar Todos os Monitores  
  } else if (req.params.opcaoId == 'op4') {
    Monitor.find({}, function(err, monitores) {
      if (err) {
        res.json(err);
      } else {
        res.render('relatorios/listagemdeMonitores', {"monitores": monitores});
      }
    });

  // OPÇÃO NÃO EXISTENTE 
  } else {
    console.log('OPÇÃO DE RELATÓRIO NÃO EXISTENTE');
    res.status(404).redirect('/IndexPrg/'+req.params.prgId);
  }
};

*/