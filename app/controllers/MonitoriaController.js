"use strict";

var mongoose = require("mongoose");
var Monitoria = mongoose.model("Monitorias");
var Professor = mongoose.model("Professores");
var Monitor = mongoose.model("Monitores");
var horarioMonitor = mongoose.model("HorariosMonitorias");

/*
  Lista todos as monitorias presentes no BD
*/
exports.listarMonitorias = function(req, res) {
  Monitoria.find({}, function(err, monitorias) {
    if (err) {
      res.json(err);
    } else {
      res.render("adm/monitorias", { monitorias: monitorias });
    }
  });
};

/*
  Cadastra monitoria no BD
*/
exports.criarMonitoria = function(req, res) {
  var novaMonitoria = new Monitoria();
  novaMonitoria.nomeDisciplina = req.body.nomeDisciplina;
  novaMonitoria.codigoDisciplina = req.body.codigoDisciplina;
  novaMonitoria.oferta = req.body.oferta;
  novaMonitoria.local = req.body.local;
  novaMonitoria.googlemaps = req.body.googlemaps;

  Monitor.findOne({matricula: req.body.monitor}, function (err, monitor) {
    if(err) {
      res.json(err);
    } else {

      Professor.findOne({codigo: req.body.professor}, function(err, professor) {
        if (err) {
          res.json(err);
        } else {
          novaMonitoria.professor = professor._id;
          novaMonitoria.monitorID = monitor._id;
          novaMonitoria.monitorNome = monitor.nome;
          novaMonitoria.professorNome = professor.nome;

          //  Salva Monitoria no BD
          novaMonitoria.save(function(err, monitoria) {
            if (err) {
              res.json(err);
            } else {

              Monitoria.findById(monitoria._id, function(err, monitoria2) {
                if(err) {
                  res.json(err);
                } else {
                  
                  //  Cadastra monitoria no professor
                  Professor.findByIdAndUpdate(monitoria2.professor, {eOrientador: true, $push: {monitorias: monitoria2._id}}, function(err, professor2) {
                    if (err) {
                      res.json(err);
                    }
                  });

                  //  Cadastra monitoria no monitor
                  Monitor.findByIdAndUpdate(monitoria2.monitorID, {materiaMonitorada: monitoria2._id}, function(err, monitor2) {
                    if (err) {
                      res.json(err);
                    } else {
                      console.log(monitor2);
                    }
                  });

                  res.redirect("/adm/monitorias");
                }
              });

            }
          });

        }
      });
    }
  }); 
};

/*
  Deleta MONITORIA do BD
*/
exports.deletarMonitoria = function(req, res) {
  Monitoria.remove({ _id: req.params.monitoriaId }, function(err, monitoria) {
    if (err) {
      res.json(err);
    } else {

      //  DELETAR MONITORIA DE PROFESSOR E MONITOR

      
      console.log("Monitoria deletado com sucesso");
      res.redirect("/adm/monitorias");
    }
  });
};

/*
  Mostra Monitoria da edição
*/
exports.mostrarMonitoriaEdicao = function(req, res) {
  Monitoria.find({ _id: req.params.monitoriaId }, function(err, monitoria) {
    if (err) {
      res.json(err);
    } else {
      //  parametro MONITORIA é um array de alunos, então para pegar um único se acessa a posição 0
      res.render("edicao/edicaoMonitoria", { monitoria: monitoria[0] });
    }
  });
};

/*
  Edita monitoria e salva mudanças no BD
*/
exports.editarMonitoria = function(req, res) {
  //  Salva todos as info da requisição em cada componente da Monitoria
  var nomeDisciplina = req.body.nomeDisciplina;
  var codigoDisciplina = req.body.codigoDisciplina;
  var local = req.body.local;
  var oferta = req.body.oferta;
  var professorCodigo = req.body.professorCodigo;
  var monitorMatricula = req.body.alunoMatricula;
  var googlemaps = req.body.googlemaps;


  Monitoria.findOneAndUpdate(
    { _id: req.params.monitoriaId },
    { nomeDisciplina, codigoDisciplina, local, oferta, googlemaps },
    function(err, monitoria) {
      if (err) {
        console.log(err);
      }
      //res.redirect('/adm/monitorias');
    }
  );

  if (professorCodigo != "") {
    console.log("Campo professor utilizado");
    //  Pesquisar professor
    Professor.findOne({ codigo: professorCodigo }, function(err, professor) {
      if (err) {
        console.log(err);
      } else if (professor != null) {
        //professorCodigo = professor._id;
        console.log("Professor _id: " + professor._id);

        Monitoria.findByIdAndUpdate(
          { _id: req.params.monitoriaId },
          { professor: professor._id },
          function(err, monitoria) {
            if (err) {
              console.log(err);
            } else {
              console.log("Professor cadastrado");
            }
          }
        );
      } else {
        console.log("Não existe professor com esse código cadastrado no BD!");
      }
    });
  } else {
    console.log("Campo professor vazio");
  }

  if (monitorMatricula != "") {
    console.log("Campo monitor utilizado");
    //  Pesquisar monitor
    Monitor.findOne({ matricula: monitorMatricula }, function(err, monitor) {
      if (err) {
        console.log(err);
      } else if (monitor != null) {
        console.log("Monitor _id: " + monitor._id);

        Monitoria.findByIdAndUpdate(
          { _id: req.params.monitoriaId },
          { monitor: monitor._id },
          function(err, monitoria) {
            if (err) {
              console.log(err);
            } else {
              console.log("Monitor cadastrado");
            }
          }
        );
      } else {
        console.log("Não existe monitor com essa matrícula cadastrado no BD");
      }
    });
  } else {
    console.log("Campo monitor vazio");
  }

  res.redirect("/adm/monitorias");
};

exports.informacoesMonitoria = function(req, res) {
  var flagPossuiHorarioAtendimento = false;

  Monitoria.findById(req.params.monitoriaId, function(err, monitoria) {
    if (err) {
      res.json(err);
    } else {
      if (monitoria.horarioAtendimento == null ) {
        res.render("informacoesMonitoria", {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "ID": req.session.user.usuario._id, "flagPossuiHorarioAtendimento": flagPossuiHorarioAtendimento});
      } else {
        flagPossuiHorarioAtendimento = true;
        horarioMonitor.findById(monitoria.horarioAtendimento, function(err, horario) {
          res.render("informacoesMonitoria", {"perfil": req.session.user.perfilUsuario, "monitoria": monitoria, "ID": req.session.user.usuario._id, "flagPossuiHorarioAtendimento": flagPossuiHorarioAtendimento, "horario": horario}); 
        });        
      }
    }
  });
}

/**
 * Mostra a página de cadastro de horário de atendimento do monitor
 * @param {*} req 
 * @param {*} res 
 */
exports.mostrarCadastroHorario = function(req,res) {
  res.render("cadastroHorarioMonitor",  { monitoria: req.params.monitoriaId, professor: req.params.professorId } )
};

exports.mostrarHorarioDeAtendimento = function (req,res) {
  console.log(req.params);
  horarioMonitor.findById(req.params.horarioId, function(err, horario) {
    res.render("horarioMonitor", {"horarioMonitor": horario, "voltarTipo": req.params.tipoVoltar, "professor": req.params.professorId, "monitoria": req.params.monitoriaId});
  });
}
