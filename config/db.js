if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://Matthew:fifo1234@meubot.bskkr.mongodb.net/MeuBot?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}