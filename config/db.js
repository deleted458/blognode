if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "seu connection do mongo"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}
