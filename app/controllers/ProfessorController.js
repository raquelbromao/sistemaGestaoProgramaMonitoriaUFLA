"use strict";

const mongoose = require("mongoose");
const fs       = require('fs');
const path     = require('path');
const PDF      = require('html-pdf');
const ejs      = require('ejs'); 

const Atividade           = mongoose.model("Atividades");
const AtividadeRegistrada = mongoose.model("AtividadesRegistradas");
const Monitoria           = mongoose.model("Monitorias");
const Monitor             = mongoose.model("Monitores");
const horarioMonitoria    = mongoose.model("HorariosMonitorias");

exports.exibirMonitoriasOrientadas = function(req, res) {
  if (req.session.user) {
    //  Array criado para adicionar as Ids das monitorias no qual o professor é responsável
    var arrayIds = [];

    //  Percorre o array das monitorias 
    for (var i = 0; i < req.session.user.usuario.monitorias.length; i++) {
      arrayIds.push(req.session.user.usuario.monitorias[i]);
    }

    //  Encontra cada monitoria e adiciona num array
    Monitoria.find({_id:{ $in: arrayIds }}, function(err, monitorias) {
      if (err) {
        res.json(err);
      } else {

        if (monitorias == null) {
          res.render('professores/listaMonitorias', {"perfil": req.session.user.perfilUsuario, "monitorias": null});
        }

        res.render('professores/listaMonitorias', {"perfil": req.session.user.perfilUsuario, "monitorias": monitorias});
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirMonitoria = function(req, res) {
  if (req.session.user) {
     //  Encontra monitoria requisitada
     Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        // Encontra monitor responsável
        Monitor.findById(monitoria.monitorID, function(err, monitor) {
          if (err) {
            res.json(err);
          } else {
            res.render('professores/indexMonitoriaOrientada', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "monitor": monitor});
          }
        });

      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirAtividadesRegistradas = function(req, res) {
  if (req.session.user) {
    //  Flags para identificar se exitem atividades registradas pelo monitor e plano de trabalho
    var flagAtividadesRegistradas = false;
    var flagPlano = false;

    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlano = true;

          //  Verifica se a monitoria já possui atividades registradas pelo monitor ou não
          if (monitoria.atividadesRegistradas.length > 0) {
            flagAtividadesRegistradas = true;

            res.render("professores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano, "possuiAtividades": flagAtividadesRegistradas, "monitoria": req.params.monitoriaId});
          } else {
            res.render("professores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano, "possuiAtividades": flagAtividadesRegistradas});
          }
        } else {
          res.render("professores/atividades", {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlano});
        }
      }
    }); 
  } else {
    res.redirect('/login');
  }
};

exports.pesquisarAtividadesRegistradas = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == "Professor") {
   //  Array para adicionar as Ids das atividades registradas vinculadas a monitoria
   var atividadesRegIds = [];

   if ((req.body.ano == "0000") && (req.body.mes == "12") && (req.body.tipo == "ATV00") && (req.body.periodo == "0000-00")) {
     Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
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
               res.render('professores/resultadosPesquisaAtividades', {"perfil": req.session.user.perfilUsuario, "monitoria": req.params.monitoriaId,"atividadesR": atividadesR});
             }
           });
       }
     });
   } else {
     Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
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
               res.render('professores/resultadosPesquisaAtividades', {"perfil": req.session.user.perfilUsuario, "monitoria": req.params.monitoriaId, "atividadesR": atividadesR});
             }
           });
       }
     });
   }
  } else {
    res.redirect('/login');
  }
};

//TODO:
exports.excluirAtividadeRegistrada = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Professor') {
    

  } else {
    res.redirect('/login');
  }
};

exports.exibirPlanoDeTrabalho = function(req, res) {
  if (req.session.user) {
    //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
    var atividadesIds = [];
    //  Flag criada para identificar se já existe plano de trabalho registrado
    var flagPlanoT = false;

    //  Encontra monitoria requisitada
    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        if (monitoria.planoDeTrabalho.length > 0) {
          flagPlanoT = true;

          for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
            atividadesIds.push(monitoria.planoDeTrabalho[i]);
          }

          //  Encontra cada tarefa registrada no Plano de Trabalho
          Atividade.find({_id:{ $in: atividadesIds }}, function(err, atividades) {
            if (err) {
                res.json(err);
            } else {
              res.render('professores/planoDeTrabalho', {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlanoT, "atividades": atividades, "monitoria": monitoria});
            }
          });
        } else {
          res.render('professores/planoDeTrabalho', {"perfil": req.session.user.perfilUsuario, "possuiPlano": flagPlanoT, "monitoria": monitoria});
        } 

      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirCriacaoAtividadePlano = function(req, res) {
  if (req.session.user) {
      res.render('professores/cadastroAtividade', {"perfil": req.session.user.perfilUsuario, "monitoria": req.params.monitoriaId})
  } else {
   res.redirect('/login');
  }
};

exports.cadastrarAtividadePlano = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Professor') {
    //  Cria novo objeto Atividade
    var atividadeNova = new Atividade();

    //  Salva todos as info da requisição em cada componente de Atividade
    atividadeNova.tipo = req.body.tipo;
    atividadeNova.observacoes = req.body.observacoes;
    atividadeNova.horasTotais = req.body.horasTotais;

    if (req.body.tipo == 'ATV01') {
        atividadeNova.titulo = 'Atendimento aos alunos';
    } 
    
    if (req.body.tipo == 'ATV02') {
        atividadeNova.titulo = 'Elaboração de material didático';
    }
    
    if (req.body.tipo == 'ATV03') {
        atividadeNova.titulo = 'Correção de avaliações';
    }
    
    if (req.body.tipo == 'ATV04') {
        atividadeNova.titulo = 'Monitoria em aula';
    }
    
    if (req.body.tipo == 'ATV05') {
        atividadeNova.titulo = 'Outros';
    }

    //  Salva atividade no BD
    atividadeNova.save(function(err, atividade) {
      if (err) {
        res.json(err);
      } else {
        Monitoria.findByIdAndUpdate(req.params.monitoriaId, {$push: {planoDeTrabalho: atividade._id, tiposAtividades: atividade.tipo} }, function(err, monitoria) {
            if (err) {
                res.json(err);
            } else {
                res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/planoDeTrabalho');
            }
        });
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirEditarAtividadePlano = function(req, res) {
  if (req.session.user) {
    Atividade.findById(req.params.atividadeId, function(err, atividade) {
      if (err) {
        res.json(err);
      } else {
        res.render('professores/edicaoAtividade', {"perfil": req.session.user.perfilUsuario, "atividade": atividade, "monitoria": req.params.monitoriaId});
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.editarAtividadePlano = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Professor') {
    var observacoes = req.body.observacoes;
    var horasTotais = req.body.horasTotais;

    Atividade.findOneAndUpdate({_id: req.params.atividadeId}, {horasTotais, observacoes}, function(err) {
      if (err) {
        res.json(err);
      } else {
        res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/planoDeTrabalho');
      }
    });
  } else {
    res.redirect('/login');
  }
};

//REFACTOR:
exports.excluirAtividadePlano = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Professor') {
    //  Array criado para adicionar as Ids das atividades registradas vinculadas a atividade do plano
    var atividadesRegistradasIds = [];

     //  Remove atividade do Plano de Trabalho da monitoria
    Monitoria.findByIdAndUpdate(req.params.monitoriaId, { $pull: {planoDeTrabalho: req.params.atividadeId} }, function(err,monitoria) {
      if (err) {
          res.json(err);
      } else {

        //  Remove a atividade da sua coleção (documento)
        Atividade.findById(req.params.atividadeId, function(err, atividade) {
          if (err) {
            res.json(err);
          } else {

            if (atividade.atividadesRegistradas.length > 0) {

              for (var i = 0; i < atividade.atividadesRegistradas.length; i++) {
                AtividadeRegistrada.findByIdAndRemove(atividadesRegistradasIds[i], function(err) {
                  if (err) { res.json(err); }
                });
              }

              Atividade.findByIdAndRemove(req.params.atividadeId, function(err) {
                if (err) {
                  res.json(err);
                } else {
                  res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/planoDeTrabalho');
                }
              });

            } else {
              Atividade.findByIdAndRemove(req.params.atividadeId, function(err) {
                if (err) {
                  res.json(err);
                } else {
                  res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/planoDeTrabalho');
                }
              });
            }
          }
        });
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibirHorarioAtendimento = function(req, res) {
  if (req.session.user) {
    //Flag para identificar se monitoria possui horário ou não
    var flagHorario = false;
    //  Encontra monitoria requisitada
    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        if (monitoria.horarioAtendimento != null) {
          flagHorario = true; 

          horarioMonitoria.findById(monitoria.horarioAtendimento, function(err, horario) {
            res.render('professores/horarioDeAtendimento', {"perfil": req.session.user.perfilUsuario, "horario": horario, "monitoria": monitoria._id, "possuiHorario": flagHorario})
          });
        } else {
          res.render('professores/horarioDeAtendimento', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria._id, "possuiHorario": flagHorario})
        }
        
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.exibircadastroHorarioAtendimento = function(req, res) {
  if (req.session.user) {
    res.render('professores/cadastroHorarioDeAtendimento', {"perfil": req.session.user.perfilUsuario, "monitoria": req.params.monitoriaId});
  } else {
    res.redirect('/login');
  }  
};

exports.cadastrarHorarioAtendimento = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == "Professor") {
    var horario = new horarioMonitoria();
    horario.monitoria = req.params.monitoriaId;
  
    if (req.body.horaInicio1Seg != ''  && req.body.horaTermino1Seg != '') {
      console.log(req.body.horaInicio1Seg);
      console.log(req.body.horaTermino1Seg);
      var segunda1 = req.body.horaInicio1Seg+"-"+req.body.horaTermino1Seg;
      horario.segunda.push(segunda1);
    }
  
    if (req.body.horaInicio2Seg != ''  && req.body.horaTermino2Seg != '') {
      console.log(req.body.horaInicio2Seg);
      console.log(req.body.horaTermino2Seg);
      var segunda2 = req.body.horaInicio2Seg+"-"+req.body.horaTermino2Seg;
      horario.segunda.push(segunda2);
    }
  
    if (req.body.horaInicio1Ter != ''  && req.body.horaTermino1Ter != '') {
      console.log(req.body.horaInicio1Ter);
      console.log(req.body.horaTermino1Ter);
      var terca1 = req.body.horaInicio1Ter+"-"+req.body.horaTermino1Ter;
      horario.terca.push(terca1);
    }
  
    if (req.body.horaInicio2Ter != ''  && req.body.horaTermino2Ter != '') {
      console.log(req.body.horaInicio2Ter);
      console.log(req.body.horaTermino2Ter);
      var terca2 = req.body.horaInicio2Ter+"-"+req.body.horaTermino2Ter;
      horario.terca.push(terca2);
    }
  
    if (req.body.horaInicio1Qua != ''  && req.body.horaTermino1Qua != '') {
      console.log(req.body.horaInicio1Qua);
      console.log(req.body.horaTermino1Qua);
      var quarta1 = req.body.horaInicio1Qua+"-"+req.body.horaTermino1Qua;
      horario.quarta.push(quarta1);
    }
  
    if (req.body.horaInicio2Qua != ''  && req.body.horaTermino2Qua != '') {
      console.log(req.body.horaInicio2Qua);
      console.log(req.body.horaTermino2Qua);
      var quarta2 = req.body.horaInicio2Qua+"-"+req.body.horaTermino2Qua;
      horario.quarta.push(quarta2);
    }
  
    if (req.body.horaInicio1Qui != ''  && req.body.horaTermino1Qui != '') {
      console.log(req.body.horaInicio1Qui);
      console.log(req.body.horaTermino1Qui);
      var quinta1 = req.body.horaInicio1Qui+"-"+req.body.horaTermino1Qui;
      horario.quinta.push(quinta1);
    }
  
    if (req.body.horaInicio2Qui != ''  && req.body.horaTermino2Qui != '') {
      console.log(req.body.horaInicio2Qui);
      console.log(req.body.horaTermino2Qui);
      var quinta2 = req.body.horaInicio2Qui+"-"+req.body.horaTermino2Qui;
      horario.quinta.push(quinta2);
    }
  
    if (req.body.horaInicio1Sex != ''  && req.body.horaTermino1Sex != '') {
      console.log(req.body.horaInicio1Sex);
      console.log(req.body.horaTermino1Sex);
      var sexta1 = req.body.horaInicio1Sex+"-"+req.body.horaTermino1Sex;
      horario.sexta.push(sexta1);
    }
  
    if (req.body.horaInicio2Sex != ''  && req.body.horaTermino2Sex != '') {
      console.log(req.body.horaInicio2Sex);
      console.log(req.body.horaTermino2Sex);
      var sexta2 = req.body.horaInicio2Sex+"-"+req.body.horaTermino2Sex;
      horario.sexta.push(sexta2);
    }
  
    horario.save(function(err, horario) {
      if (err) {
        res.json(err);
      } else {
  
        Monitoria.findByIdAndUpdate(req.params.monitoriaId, {horarioAtendimento: horario._id}, function(err) {
          if (err) {
            res.json(err);
          } else {
            res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/horarioAtendimento');
          }  
        });
  
      }
    });

  } else {
    res.redirect('/login');
  }  
};

exports.excluirHorarioAtendimento = function(req, res) {
  if (req.session.user && req.session.user.perfilUsuario == 'Professor') {
    //  Encontra horário requisitado e deleta
    horarioMonitoria.findByIdAndRemove(req.params.horarioId, function(err) {
      if (err) {
        res.json(err);
      } else {

        //  edita monitoria retirando horário removido
        Monitoria.findByIdAndUpdate(req.params.monitoriaId, {horarioAtendimento: null}, function(err) {
          if (err) {
            res.json(err);
          } else {
            res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/horarioAtendimento');
          }
        });

      }
    });
 } else {
    res.redirect('/login');
 }
};

//TODO:
exports.exibirEdicaoHorarioAtendimento = function(req, res) {
  if (req.session.user) {
    //  Encontra horário requisitado 
    horarioMonitoria.findById(req.params.horarioId, function(err, horario) {
      
    });
 } else {
    res.redirect('/login');
 }
};

//TODO:
exports.editarHorarioAtendimento = function(req, res) {
  if (req.session.user) {
    //  Encontra horário requisitado PARA EDIÇÃO
    horarioMonitoria.findById(req.params.horarioId, function(err, horario) {
      
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
            res.render('professores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          } else {
            res.render('professores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT, "possuiAtividadesRegistradas": flagAtivReg});
          }  

        } else {
          res.render('professores/relatorios', {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "possuiPlano": flagPlanoT});
        }  
      }
    });
  } else {
    res.redirect('/login');
  }
};

exports.gerarRelatorios = function(req, res) {
  if (req.session.user && (req.session.user.perfilUsuario == 'Professor' || req.session.user.perfilUsuario == 'PRG')) {
    if (req.params.tipoRelatorio == 1) {
      this.gerarRelatorioMensal(req, res);
    } else if (req.params.tipoRelatorio == 2) {
      this.gerarRelatorioGeral(req, res);
    } else {
      if (req.session.user.perfilUsuario == 'Professor') {
        res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/gerarRelatorios');
      } else {
        res.redirect('/prg/relatorios/1/'+req.params.monitoriaId);
      }
    }
  } else {
    res.redirect('/login');
  }
};

exports.gerarRelatorioMensal = function(req, res) {
  //  Verifica campos vindos do formulário
  if (req.body.mes != null && req.body.periodo != null) {
    //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
    var atividadesIds = [];
    var atividadesRegIds = [];
    var mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Pega o template do relatório
    var templateString = fs.readFileSync(path.resolve(__dirname, '../templates/relatorioMensal.ejs'), 'utf-8');

    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
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
    res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/gerarRelatorios');
  }
};

exports.gerarRelatorioGeral = function(req, res) {
  //  Verifica campos vindos do formulário
  if (req.body.periodo != null) {
    //  Array criado para adicionar as Ids das atividades vinculadas a monitoria
    var atividadesIds = [];

    // Pega o template do relatório
    var templateString = fs.readFileSync(path.resolve(__dirname, '../templates/relatorioGeral.ejs'), 'utf-8');

    Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
      if (err) {
        res.json(err);
      } else {

        for (var i = 0; i < monitoria.planoDeTrabalho.length; i++) {
          atividadesIds.push(monitoria.planoDeTrabalho[i]);
        }

        //  Encontra cada tarefa registrada no Plano de Trabalho
        Atividade
        .find(
          {_id:{ $in: atividadesIds },
          'periodo': req.body.periodo}, 
          function(err, atividades) {
          if (err) {
              res.json(err);
          } else {
            var html = ejs.render(templateString, {"atividades": atividades, "monitoria": monitoria, "periodo": req.body.periodo});

            // Cria PDF
            PDF
            .create(html)
            .toFile('./pdfs/relatorioGeral'+req.body.periodo+'M'+monitoria.monitorID+'.pdf', function(err, arquivo) {
              if (err) {
                res.json(err);
              } else {
                var arquivoDownload = path.resolve(__dirname, '../../pdfs/relatorioGeral'+req.body.periodo+'M'+monitoria.monitorID+'.pdf');
                //  Realiza download para o usuário
                res.download(arquivoDownload);
              }
            });
          }
        });

      }
    });

  } else {
    res.redirect('/monitoriaOrientada/'+req.params.monitoriaId+'/gerarRelatorios');
  }
};

/*
exports.listarProfessores = function(req, res) {
  Professor.find({}, function(err, professores) {
    if (err) {
      res.json(err);
    } else {
      res.render("adm/professores", { professores: professores });
    }
  });
};

exports.criarProfessor = function(req, res) {
  var professor_cadastro = new Professor();

  professor_cadastro.nome = req.body.nome;
  professor_cadastro.codigo = req.body.codigo;
  professor_cadastro.telefone = req.body.telefone;
  professor_cadastro.login = req.body.login;
  professor_cadastro.senha = req.body.senha;

  professor_cadastro.save(function(err, professor) {
    if (err) {
      res.json(err);
    } else {
      console.log("Professor cadastrado com sucesso");
      res.redirect("/adm/professores");
    }
  });
};

exports.deletarProfessor = function(req, res) {
  Professor.remove({ _id: req.params.professorId }, function(err, professor) {
    if (err) {
      res.json(err);
    } else {
      console.log("Professor deletado com sucesso");
      res.redirect("/adm/professores");
    }
  });
};

exports.mostrarProfessorEdicao = function(req, res) {
  Professor.find({ _id: req.params.professorId }, function(err, professor) {
    if (err) {
      res.json(err);
    } else {
      //  parametro aluno é um array de alunos, então para pegar um único se acessa a posição 0
      res.render("edicao/edicaoProfessor", { professor: professor[0] });
    }
  });
};

exports.editarProfessor = function(req, res) {
  var nome = req.body.nome;
  var codigo = req.body.codigo;
  var telefone = req.body.telefone;
  var login = req.body.login;
  var senha = req.body.senha;

  Professor.findOneAndUpdate(
    { _id: req.params.professorId },
    { nome, codigo, telefone, login, senha },
    function(err, professor) {
      if (err) {
        return console.log(err);
      }
      res.redirect("/adm/professores");
    }
  );
};

exports.mostrarProfIndex = function(req, res) {
  //  Array criado para adicionar as Ids das monitorias no qual o professor é responsável
  var arrayIds = [];

  Professor.findById({ _id: req.params.professorId }, function(err, professor) {
    if (err) {
      res.json(err);
    } else {
      //  Percorre o array das monitorias 
      for (var i = 0; i < professor.monitorias.length; i++) {
        arrayIds.push(professor.monitorias[i]);
      }

      //  Encontra cada monitoria e adiciona num array
      Monitoria.find({_id:{ $in: arrayIds }}, function(err, monitorias) {
        if (err) {
          res.json(err);
        } else {

          if (monitorias == null) {
            res.render('index/indexProfessores', {"professor": professor, "monitorias": null});
          }

          //console.log(monitorias);
          res.render('index/indexProfessores', {"professor": professor, "monitorias": monitorias});
        }
      });

    }

  });
  
};
*/
