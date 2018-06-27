"use strict";

var mongoose = require("mongoose");

var Monitoria = mongoose.model("Monitorias");

exports.pesquisarMonitorias = function(req, res) {
    Monitoria.find({ nomeDisciplina: req.query.nomeMonitoria }, function(err, monitorias) {
        if (err) {
        res.json(err);
        } else {
        res.render("pesquisa/pesquisaResultados", {"perfil": req.session.user.perfilUsuario,"ID": req.session.user.usuario._id, "monitorias": monitorias});
        }
  });
}