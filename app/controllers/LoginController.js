"use strict";

var mongoose = require("mongoose");
var bcrypt   = require("bcrypt");

var Aluno     = mongoose.model("Alunos");
var Professor = mongoose.model("Professores");
var Monitor   = mongoose.model("Monitores");
var PRG       = mongoose.model("PRG");

exports.autenticarLogin = function(req, res) {
  //  Analisa tipo de usuário que requeriu entrada no sistema
  if (req.body.tipo === "aluno") {
    console.log("[Usuário] Aluno identificado. Analisando Permissão...");
    Aluno.findOne({ login: req.body.login }, function(err, aluno) {
      if (err) {
        res.redirect("/login");
      } else if (aluno === null) {
        console.log('null');
        res.redirect("/login");
      } else {
        if (bcrypt.compareSync(req.body.senha, aluno.senha)) {
          var obj = {
            perfilUsuario: 'Aluno',
            Autorizado: true,
            usuario: aluno
          }
          req.session.user = obj;
          res.redirect("/index");
        } else {
          console.log('falso');
          res.redirect("/login");
        }
      }
    });

  } else if (req.body.tipo === "professor") {
    console.log("[Usuário] Professor identificado. Analisando Permissão...");
    Professor.findOne({ login: req.body.login }, function(err, professor) {
      if (err) {
        res.redirect("/login");
      } else if (professor === null) {
        console.log('null');
        res.redirect("/login");
      } else {
        if (bcrypt.compareSync(req.body.senha, professor.senha)) {  
          var obj = {
            perfilUsuario: 'Professor',
            Autorizado: true,
            usuario: professor
          }
          req.session.user = obj;
          res.redirect("/index");

        } else {
          console.log('falso');
          res.redirect("/login");
        }
      }
    });

  } else if (req.body.tipo === "prg") {
    console.log("[Usuário] PRG identificado. Analisando Permissão...");
    PRG.findOne({ login: req.body.login }, function(err, membroPRG) {
      if (err) {
        res.redirect("/login");
      } else if (membroPRG === null) {
        res.status(404).redirect("/login");
      } else {
        if (bcrypt.compareSync(req.body.senha, membroPRG.senha)) {  
          var obj = {
            perfilUsuario: 'PRG',
            Autorizado: true,
            usuario: membroPRG
          }
          req.session.user = obj;
          res.redirect("/index");
        } else {
          console.log('falso');
          res.redirect("/login");
        }
      }
    });

  } else if (req.body.tipo === "monitor") {
    console.log("[Usuário] Monitor identificado. Analisando Permissão...");
    Monitor.findOne({ login: req.body.login }, function(err, monitor) {
      if (err) {
        res.redirect("/login");
      } else if (monitor === null) {
        console.log('null');
        res.redirect("/login");
      } else {
        if (bcrypt.compareSync(req.body.senha, monitor.senha)) {  
          var obj = {
            perfilUsuario: 'Monitor',
            Autorizado: true,
            usuario: monitor
          }
          req.session.user = obj;
          res.redirect("/index");
        } else {
          console.log('falso');
          res.redirect("/login");
        }
      }
    });
    
  } else {
    console.log("Tipo de usuário não identificado!");
    res.redirect("/login");
  }
};

exports.exibirPaginaPrincipal = function(req, res) {
  //  Login não feito
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    //  Login feito
    res.render('index/indexUsuario', {"perfil": req.session.user.perfilUsuario, "dados": req.session.user.usuario});
  }
};

exports.sairSistema = function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/');
    }
  });
};