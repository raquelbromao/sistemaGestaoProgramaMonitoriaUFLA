"use strict";

const mongoose = require("mongoose");
const fs       = require('fs');
const path     = require('path');
const PDF      = require('html-pdf');
const ejs      = require('ejs');

var Atividade           = mongoose.model("Atividades");
var AtividadeRegistrada = mongoose.model("AtividadesRegistradas");
var Monitoria           = mongoose.model("Monitorias");
var Professor           = mongoose.model("Professores");
var horarioMonitor      = mongoose.model("HorariosMonitorias");

exports.exibirMonitoriaVigente = function(req, res) {
  if (req.session.user) {
    // Busca o ID da monitoria vinculada e suas informações correspondentes
    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        Professor.findById(monitoria.professor, function(err, professor) {
          res.render('monitores/indexMonitoriaVigente', {"monitoria": monitoria, "professor": professor, "perfil": req.session.user.perfilUsuario})
        });
      }
    });
  } else {
    res.redirect('/login');
  }  
};

exports.exibirPlanoDeTrabalho = function(req, res) {
  if (req.session.user) {
    //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
    var atividadesIds = [];
    // Flag para identificar se existe plano de trabalho
    var flagPlano = false;

    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        //  Verifica se a monitoria já possui plano de trabalho cadastrado ou não
        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlano = true;
          for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
              atividadesIds.push(monitoria.planoDeTrabalho[i]);
          }

          //  Encontra cada tarefa registrada no Plano de Trabalho
          Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
            if (err) {
                res.json(err);
            } else {
              res.render('monitores/planoDeTrabalho', {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano, "atividades": atividades});
            }
          });

        } else {
          res.render('monitores/planoDeTrabalho', {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano});
        }  
      }
    });
  } else {
    res.redirect('/login');
  } 
};

exports.exibirAtividades = function(req, res) {
  if (req.session.user) {
    //  Flags para identificar se exitem atividades registradas pelo monitor e plano de trabalho
    var flagAtividadesRegistradas = false;
    var flagPlano = false;

    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlano = true;

          //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
          if (monitoria.atividadesRegistradas.length > 0) {
            flagAtividadesRegistradas = true;

            res.render("monitores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano, "possuiAtividades": flagAtividadesRegistradas});
          } else {
            res.render("monitores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano, "possuiAtividades": flagAtividadesRegistradas});
          }
        } else {
          res.render("monitores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano});
        }
      }
    });  
  } else {
    res.redirect('/login');
  }  
};

exports.pesquisarAtividades = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Monitor') {
    //  Array para adicionar as Ids das atividades registradas vinculadas a monitoria
    var atividadesRegIds = [];

    if ((req.body.ano == "0000") && (req.body.mes == "12") && (req.body.tipo == "ATV00") && (req.body.periodo == "0000-00")) {
      Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
        if (err) {
          res.json(err);
        } else {
  
          for (var i = 0; i < monitoria.atividadesRegistradas.length; i++) {
            atividadesRegIds.push(monitoria.atividadesRegistradas[i]);
          }
          
            // Encontra cada tarefa registrada pelo monitor
            AtividadeRegistrada.find({_id:{ $in: atividadesRegIds }}, function(err, atividadesR) {
              if(err) {
                res.json(err);
              } else {
                res.render('monitores/resultadosPesquisaAtividades', {"perfil": req.session.user.perfilUsuario, "atividadesR": atividadesR});
              }
            });
        }
      });
    } else {
      Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
        if (err) {
          res.json(err);
        } else {
  
          for (var i = 0; i < monitoria.atividadesRegistradas.length; i++) {
            atividadesRegIds.push(monitoria.atividadesRegistradas[i]);
          }
          
            var filtroPesquisa = [];

            if (req.body.ano != '0000') {
              filtroPesquisa.push({'data.ano': req.body.ano});
            }

            if (req.body.mes != '12') {
              filtroPesquisa.push({'data.mes': req.body.mes});
            }

            if (req.body.periodo != '0000-00') {
              filtroPesquisa.push({'periodo': req.body.periodo});
            }

            if (req.body.tipo != 'ATV00') {
              filtroPesquisa.push({'tipo': req.body.tipo});
            }
            
            // Encontra cada tarefa registrada pelo monitor
            AtividadeRegistrada
            .find(
              {_id:{ $in: atividadesRegIds }, 
              $and: filtroPesquisa },
              function(err, atividadesR) {
              if(err) {
                res.json(err);
              } else {
                res.render('monitores/resultadosPesquisaAtividades', {"perfil": req.session.user.perfilUsuario, "atividadesR": atividadesR});
              }
            });
        }
      });
    }
  } else {
    res.redirect('/login');
  } 
};

exports.verificarCondicoesBasicas = function(req, res) {
  //  Flags para identificar se exitem atividades registradas pelo monitor e plano de trabalho
  var flagAtividadesRegistradas = false;
  var flagPlano = false;

  Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
    if (err) {
      res.json(err);
    } else {

      if (monitoria.planoDeTrabalho.length > 0) {
        flagPlano = true;

        //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
        if (monitoria.atividadesRegistradas.length > 0) {
          flagAtividadesRegistradas = true;
          return true;
        } else {
          return false;
        }

      } else {
        return false;
      }

    }
  }); 

};

exports.exibirHorarioDeAtendimento = function(req, res) {
  if (req.session.user) {
    // Flag para identificar se existe horário de atendimento
    var flagHorario = false;

    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        
        //  Verifica se a monitoria já possui horario de atendimento do monitor
        if (monitoria.horarioAtendimento != []) {
          flagHorario = true;
          horarioMonitor.findById(monitoria.horarioAtendimento, function(err, horario) {
            res.render('monitores/horarioDeAtendimento', {"perfil": req.session.user.perfilUsuario, "possuiHorario": flagHorario, "horario": horario});
          });
        } else {
          res.render('monitores/horarioDeAtendimento', {"perfil": req.session.user.perfilUsuario, "possuiHorario": flagHorario});
        }
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirCadastroAtividade = function(req, res) {
  if (req.session.user) {
    //Array criado para armazenar id dos tipos de atividades contidas no plano de curso
    var atividadesIds = [];

    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
        if (err) {
            res.json(err);
        } else {
            //  Verifica se o plano de trabalho foi registrado
            if (monitoria.planoDeTrabalho.length > 0) {

                //  Pesquisa todas as atividades do plano de trabalho
                for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
                    atividadesIds.push(monitoria.planoDeTrabalho[i]);
                }

                //  Encontra cada tarefa registrada no Plano de Trabalho
                Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.render('monitores/cadastroAtividade', {"perfil": req.session.user.perfilUsuario, "flag": true, "atividades": atividades, "monitoria": monitoria, "monitor": req.session.user.usuario._id });
                    }
                });
            
            //  Caso não haja plano de trabalho cadastrado ainda
            } else {
                res.render('monitores/cadastroAtividade', {"perfil": req.session.user.perfilUsuario, "flag": false, "monitoria": monitoria, "monitor": req.session.user.usuario._id});
            } 
        }
    });    
  } else {
    res.redirect('/login');
  }
}

exports.registrarAtividade = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Monitor') {
    var novaAtivRegistrada = new AtividadeRegistrada();

    var teste     = new Date();
    var aux_data  = teste.toLocaleDateString().split("-");
    var aux_tempo = teste.toLocaleTimeString().split(":");

    var aux  = "";
    var data = aux.concat(aux_data[2],"/",aux_data[1],"/",aux_data[0]);

    var aux1  = "";
    var tempo = aux1.concat(aux_tempo[0],":",aux_tempo[1]);

    Atividade.findById(req.body.atividadeEscolhida, function(err, atividade) {
        if (err) {
            res.json(err);
        } else {
            novaAtivRegistrada.tipo                = atividade.tipo;
            novaAtivRegistrada.titulo              = atividade.titulo;
            novaAtivRegistrada.observacoes         = req.body.observacoes;
            novaAtivRegistrada.contagemAtendimento = req.body.contagemAtendimento;
            novaAtivRegistrada.horaInicio          = req.body.horaInicio;
            novaAtivRegistrada.horaTermino         = req.body.horaTermino;
            novaAtivRegistrada.data.dia            = new Date().getDate();
            novaAtivRegistrada.data.mes            = new Date().getMonth();
            novaAtivRegistrada.data.ano            = new Date().getFullYear();
            novaAtivRegistrada.data.registroData   = data;
            novaAtivRegistrada.data.registroHora   = tempo;

            //  Tratamento de horas
            let aux_tempo1 = req.body.horaInicio.split(":");
            let aux_tempo2 = req.body.horaTermino.split(":");

            var horaInicial = new Date(0,0,0,aux_tempo1[0],aux_tempo1[1]).getTime();
            var horaFinal   = new Date(0,0,0,aux_tempo2[0],aux_tempo2[1]).getTime();

            novaAtivRegistrada.horasRegistradas = (horaFinal - horaInicial) / 3600000;

            //  Cálculo de porcentagem
            var porc = (novaAtivRegistrada.horasRegistradas * 100) / atividade.horasTotais;

            novaAtivRegistrada.save(function(err, atividadeR) {
                if (err) {
                    res.json(err);
                } else {

                    Monitoria.findByIdAndUpdate(req.session.user.usuario.materiaMonitorada, {$push: {atividadesRegistradas: atividadeR._id} } ,function(err) {
                        if (err) {
                            res.json(err);
                        } else {

                            Atividade.findByIdAndUpdate(req.body.atividadeEscolhida, {$push: {atividadesRegistradas: atividadeR._id}, $inc: {horasContabilizadas: atividadeR.horasRegistradas}, $inc: {porcentagem: porc} }, function(err) {
                                if (err) {
                                    res.json(err);
                                } else {
                                    res.redirect('/monitoriaVigente/atividades');
                                }
                            });    
                            
                        }
                    });

                }    
            });
        
        }
    });
  } else {
    res.redirect('/login');
  } 
};

//TEST:
exports.excluirAtividade = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Monitor') {
      //  Remove atividade  de Atividades Registradas da monitoria
    Monitoria.findByIdAndUpdate(req.session.user.usuario.materiaMonitorada, { $pull: {atividadesRegistradas: req.params.atividadeRegistradaId} }, function(err,monitoria) {
      if (err) {
          res.json(err);
      } else {        
          //  Remove a atividade registrada da sua coleção (documento)
          AtividadeRegistrada.findByIdAndRemove(req.params.atividadeRegistradaId, function(err, atividadeR) {
              if (err) {
                  res.json(err);
              } else {

                  //  Cálculo de porcentagem
                  var porc = (atividadeR.horasRegistradas * 100) / atividade.horasTotais;

                  //  Remove a atividade registrada da sua atividade do plano de trabalho ao qual pertence
                  Atividade.findOneAndUpdate({atividadesRegistradas: req.params.atividadeRegistradaId},{ $pull: {atividadesRegistradas: req.params.atividadeRegistradaId}, $inc: {horasContabilizadas: -(atividadeR.horasRegistradas) }, $inc: {porcentagem: -((atividadeR.horasRegistradas * 100) / atividade.horasTotais)} },function(err,atividade){
                      if (err) {
                          res.json(err);
                      } else {
                          res.redirect('/monitoriaVigente/atividades');
                      }
                  });
              }
          });
      }
    });
  } else {
    res.redirect('/login');
  } 
};

exports.exibirRelatorios = function(req, res) {
  if (req.session.user) {
    //  Flags criadas para identificar quais informações terão ou não na página
    var flagPlanoT = false;
    var flagAtivReg = false;

    Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {
        //  verifica se a monitoria já possui plano de trabalho registrado
        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlanoT = true;

          //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
          if (monitoria.atividadesRegistradas.length > 0) {
            flagAtivReg = true;
            res.render('monitores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          } else {
            res.render('monitores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          }  

        } else {
          res.render('monitores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT});
        }  
      }
    });  

  } else {
    res.redirect('/login');
  }
};

exports.gerarRelatorio = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Monitor') {
    //  Verifica campos vindos do formulário
    if (req.body.mes != null && req.body.periodo != null) {
      //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
      var atividadesIds = [];
      var atividadesRegIds = [];
      var mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      // Pega o template do relatório
      var templateString = fs.readFileSync(path.resolve(__dirname, '../templates/relatorioMensal.ejs'), 'utf-8');

      Monitoria.findById(req.session.user.usuario.materiaMonitorada, function(err, monitoria) {
        if (err) {
          res.json(err);
        } else {

          for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
            atividadesIds.push(monitoria.planoDeTrabalho[i]);
          }

          for (var i = 0; i < monitoria.atividadesRegistradas.length; i++) {
            atividadesRegIds.push(monitoria.atividadesRegistradas[i]);
          }

          //  Encontra cada tarefa registrada no Plano de Trabalho
          Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
            if (err) {
                res.json(err);
            } else {
                // Encontra cada tarefa registrada pelo monitor em determinado período e mês
                AtividadeRegistrada
                .find(
                  {_id:{ $in: atividadesRegIds }, 
                  $and: [{'data.mes': req.body.mes}, {'periodo': req.body.periodo}]},
                  function(err, atividadesR) {
                    if (err) {
                        res.json(err);
                    } else {
                        // Renderiza dados no template
                        var html = ejs.render(templateString, {"atividades": atividades, "atividadesR": atividadesR ,"monitoria": monitoria, "mes": mes[req.body.mes]});

                        // Cria PDF
                        PDF
                        .create(html)
                        .toFile('./pdfs/relatorio'+mes[req.body.mes]+'M'+monitoria.monitorID+'.pdf', function(err, arquivo) {
                            if (err) {
                              res.json(err);
                            } else {
                              var arquivoDownload = path.resolve(__dirname, '../../pdfs/relatorio'+mes[req.body.mes]+'M'+monitoria.monitorID+'.pdf');
                              //  Realiza download para o usuário
                              res.download(arquivoDownload);
                            }
                        });
                    }
                });

            }
          });
        }

      });  

    } else {
      res.redirect('/monitoriaVigente/gerarRelatorio');
    }
  } else {
    res.redirect('/login');
  }
};

exports.mostrarDetalhesMonitoria = function(req,res) {
   //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
   var atividadesIds = [];
   var atividadesRegIds = [];
   //  Flags criadas para identificar quais informações terão ou não na página
   var flagHorarioM = false;
   var flagPlanoT = false;
   var flagAtivReg = false;

   // Busca o ID da monitoria vinculada e suas informações correspondentes
   Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
    if (err) {
      res.json(err);
    } 

    //  Verifica se a monitoria já possui horario de atendimento do monitor
    if (monitoria.horarioAtendimento != []) {
      flagHorarioM = true;
    }

    //  Verifica se a monitoria já possui plano de trabalho cadastrado ou não
    if (monitoria.planoDeTrabalho.length > 0) {
        flagPlanoT = true;
        for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
            atividadesIds.push(monitoria.planoDeTrabalho[i]);
        }

        //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
        if (monitoria.atividadesRegistradas.length > 0) {
          flagAtivReg = true;
          for (var i = 0; i < monitoria.atividadesRegistradas.length; i++) {
              atividadesRegIds.push(monitoria.atividadesRegistradas[i]);
          }

          //  Encontra cada tarefa registrada no Plano de Trabalho
          Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
            if (err) {
                res.json(err);
            } else {
                // Encontra cada tarefa registrada pelo monitor
                AtividadeRegistrada.find({_id:{ $in: atividadesRegIds }},function(err,atividadesR) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.render('infoMonitoria', {"possuiPlanoTra": flagPlanoT, "possuiHorarioM": flagHorarioM, "possuiAtivReg": flagAtivReg, "atividades": atividades, "atividadesR": atividadesR ,"monitoria": monitoria, "professor": req.params.professorId });
                    }
                });

            }
          });

        } else {
          //  Encontra cada tarefa registrada no Plano de Trabalho
          Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
            if (err) {
                res.json(err);
            } else {
                res.render('infoMonitoria', {"possuiPlanoTra": flagPlanoT, "possuiHorarioM": flagHorarioM, "possuiAtivReg": flagAtivReg, "atividades": atividades, "monitoria": monitoria, "professor": req.params.professorId });
            }
          });
        }  

    } else {
      res.render('infoMonitoria', {"possuiPlanoTra": flagPlanoT, "possuiHorarioM": flagHorarioM, "possuiAtivReg": flagAtivReg, "atividades": atividades, "monitoria": monitoria, "professor": req.params.professorId });
    }    

  });
};

/*

exports.listarMonitores = function(req, res) {
  Monitor.find({}, function(err, monitores) {
    if (err) {
      res.json(err);
    } else {
      res.render("adm/monitores", { monitores: monitores });
    }
  });
};


exports.criarMonitor = function(req, res) {
  //  Cria novo objeto Monitor
  var monitor_cadastro = new Monitor();

  //  Salva todos as info da requisição em cada componente de Monitor
  monitor_cadastro.nome = req.body.nome;
  monitor_cadastro.matricula = req.body.matricula;
  monitor_cadastro.login = req.body.login;
  monitor_cadastro.senha = req.body.senha;

  monitor_cadastro.save(function(err, monitor) {
    if (err) {
      res.json(err);
    } else {
      console.log("Monitor cadastrado com sucesso");
      res.redirect("/adm/monitores");
    }
  });
};

exports.deletarMonitor = function(req, res) {
  Monitor.remove({ _id: req.params.monitorId }, function(err, monitor) {
    if (err) {
      res.json(err);
    } else {
      console.log("Monitor deletado com sucesso");
      res.redirect("/adm/monitores");
    }
  });
};

exports.mostrarMonitorEdicao = function(req, res) {
  Monitor.find({ _id: req.params.monitorId }, function(err, monitor) {
    if (err) {
      res.json(err);
    } else {
      //  parametro monitor é um array de monitores, então para pegar um único se acessa a posição 0
      res.render("edicao/edicaoMonitor", { monitor: monitor[0] });
    }
  });
};

exports.editarMonitor = function(req, res) {
  var nome = req.body.nome;
  var matricula = req.body.matricula;
  var login = req.body.login;
  var senha = req.body.senha;

  Monitor.findOneAndUpdate(
    { _id: req.params.monitorId },
    { nome, matricula, login, senha },
    function(err, monitor) {
      if (err) {
        return console.log(err);
      }
      res.redirect("/adm/monitores");
    }
  );
};*/
