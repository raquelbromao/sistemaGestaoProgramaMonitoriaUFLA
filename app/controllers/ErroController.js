"use strict";
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const saltRounds = require('../config/config').saltosCriptografia;

/**
 * Função identifica o erro por seu ID e reporta o usuário a sua página de erro
 * @param {*} req 
 * @param {*} res 
 */
exports.reportarErro = function(req,res) {
    console.log('\nSALTOS: '+saltRounds);
    var senha;

    console.log('\nPARAMS: '+req.params.erroId);
    console.log('SENHA ANTES: '+req.body.senha);

    senha = bcrypt.hashSync(req.body.senha, saltRounds);

    console.log('\nSENHA DEPOIS: '+senha);

    //if (bcrypt.compare(req.body.senha, senha)) {
    console.log('\nCOMPARAÇÃO: '+bcrypt.compareSync(req.body.senha, senha));

    res.status(200).send('FIM');
}