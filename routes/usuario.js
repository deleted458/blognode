const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const passport = require ("passport")
var localStrategy = require('passport-local').Strategy;
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Email invalido"})
    }
    
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha invalida"})
    }

    if(req.body.length < 4){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2) {
        erros.push({texto: "As senhas não concidem, tente novamente"})
    }

    if(erros.length > 0) {
        res.render("usuarios/registro", {erros: erros})
    }else {
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash('error_msg', "Ja existe uma conta registrada com esse email")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err){
                            req.flash('erro_msg', "Houve um erro durante o registro do usuario")
                            res.redirect("/")
                        }else{
                            novoUsuario.senha = hash

                            novoUsuario.save().then(() => {
                                req.flash('success_msg', "Usuario criado com sucesso")
                                res.redirect("/")
                            }).catch((err) => {
                                req.flash('error_msg', "Houve um erro ao criar o usuario, tente novamente")
                                res.redirect("/usuarios/registro")
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)


})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash('success_msg', "Deslogado com sucesso")
    res.redirect("/")
})

module.exports = router