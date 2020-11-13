const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require('../models/Categoria')
const Categoria = mongoose.model("categorias")
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const {isAdmin} = require("../helpers/isAdmin")



router.get('/', isAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias.map(categoria => categoria.toJSON())}        )
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', isAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', isAdmin, (req, res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.slug || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Slug invalido"})
    }
    
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome muito curto"})
    }
    
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao registrar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }

})

router.get("/categorias/edit/:id", isAdmin, (req, res) => {
    
    
        Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
            res.render("admin/editcategorias", {categoria: categoria})
        }).catch((err) => {
            req.flash('error_msg', "Esta categoria não existe")
            res.redirect("/admin/categorias")
        })
    
})

router.post("/categorias/edit", isAdmin, (req, res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno ao salvar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })

})

router.get("/categorias/delete/:id", isAdmin, (req, res) => {
    Categoria.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
}) 

router.get("/postagens", isAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", isAdmin, (req, res) => {
    
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", isAdmin, (req, res) => {

    var erros = []

    if(!req.body.titulo){
        erros.push({texto: "Insira um titulo valido"})
    }
    if(!req.body.slug){
        erros.push({texto: "Insira um slug valido"})
    }
    if(!req.body.descricao){
        erros.push({texto: "Insira uma descrição valida"})
    }
    if(!req.body.conteudo){
        erros.push({texto: "Insira um conteudo valido"})
    }
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/addpostagens",{erros:erros, categorias:categorias})
           })
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem!')
            res.redirect('/admin/postagens')
        })
    }

})

router.get("/postagens/edit/:id", isAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao carregar o formulario de edição")
        res.redirect("/admin/postagens")
    })
    
})

router.post("/postagens/edit", isAdmin, (req, res) => {
    
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            con
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/delete/:id", isAdmin, (req, res) => {
    Postagem.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao deletar a categoria")
        res.redirect("/admin/postagens")
    })
}) 

module.exports = router 