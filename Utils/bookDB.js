const mongoose = require("mongoose")

function initBookDB(){
    mongoose.connect(process.env.DATABASE)
    .then(() => {
        console.log("Connected to myLibrary Database")
    })

    let bookSchema = new mongoose.Schema(
        {
            title: String,
            author: String,
            downloadLink: String,
            volume: Number,
            summary: String,
            uploader: String,
            reviews: [String],
            image: {type: String, default: "jobless_reincarnation_cover.jpg"},  
            meta: {
                rating: {
                    type: Number,
                    min: 0,
                    max: 5,
                    default: 0
                },
                downloads: {type: Number, default: 0},
                bookmark: {type: Number, default: 0},
            },
     
        },
        {timestamps: true}
    )
        
    const Book = mongoose.model("Book", bookSchema);
    return [Book, bookSchema];
}

async function postBook(bookTitle, volumeNumber, authorName, downloadLink, summaryDescription, imageName, bookSchema, response, uploader, pushNewBook, User){
    await bookSchema.findOne({title: bookTitle.toLowerCase(), volume: volumeNumber}).then((data) => {
        if (data != null){
            console.log("already Exist");
            throw Error;
        }
        else{
            console.log("Creating Book Space")
            const newBook = new bookSchema({
                title: bookTitle.toLowerCase(),
                author: authorName,
                downloadLink: downloadLink,
                volume: volumeNumber,
                summary: summaryDescription,
                image: imageName,
                uploader: uploader,
            })
        
            newBook.save(function(error, Book){
                if(!error){
                    pushNewBook(User, uploader, Book);
                    response.redirect("/");
                }
                else{
                    console.log(err);
                }
            })
        }
        }
    )
}

module.exports = {
    initBookDB,
    postBook,
}