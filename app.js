// Dependecias
    const express = require("express")
    const app = express()

    const session = require("express-session")
    const handlebars = require("express-handlebars")
    const bodyParser = require("body-parser")
    const passport = require("passport")
    const path = require("path") //Ja vem no node
    const flash = require("connect-flash")

    const db = require("./config/db")
    const mongoose = require("mongoose")
    require('./models/Categoria')
    const Categoria = mongoose.model("categorias")
    require('./models/Postagem')
    const Postagem = mongoose.model("postagens")
    require('./config/auth')(passport)
    const admin = require('./routes/admin') //Para nossas rotas /admin/{rota}
    const usuarios = require('./routes/usuario') //Para nossas rotas /usuarios/{rota}
//Configuração
    //Sessão
        app.use(session({
            secret: "alakk",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg') //Cria uma variavel global onde vai ficar o alert de sucesso ao realizar uma ação
            res.locals.error_msg = req.flash('error_msg') //Cria uma variavel global onde vai ficar o alert de erro ao realizar uma ação
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');
    //Mongoose
        mongoose.Promise - global.Promise
        mongoose.connect("mongodb+srv://Matthew:fifo1234@meubot.bskkr.mongodb.net/MeuBot?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
            console.log("Conectado ao MongoDB")
        }).catch((err) => {
            console.log(`Deu erro: ${err}`)
        })
    //Public
        app.use(express.static(path.join(__dirname, 'public')))
//Rotas
    app.get("/", (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/404")
        })
    })
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem) {
                res.render("postagem/index", {postagem: postagem})
            }else {
                req.flash('error_msg', "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/")
        })
    })
    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/")
        })
    })
    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria) {
                
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash('error_msg', "Houve um erro ao listar as postagens")
                    res.redirect("/")
                })

            }else {
                req.flash('error_msg', "Essa categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/")
        })
    })
    app.get("/404", (req, res) => {
        res.send("Erro 404")
    })
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
//outros
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor aberto na porta ${PORT}`)
})