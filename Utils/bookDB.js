const mongoose = require("mongoose")
const fs = require("fs")
const {removeImage} = require("../Utils/upload")

function initBookDB(){
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
            removeImage("/uploads/images/" + imageName);
            response.redirect("/error-profile");
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
                uploader: uploader.username,
            })
        
            newBook.save(function(error, Book){
                if(!error){
                    pushNewBook(User, uploader, Book);
                    response.redirect("/");
                }
                else{
                    console.log(err);
                    response.redirect("/error-profile")
                }
            })
        }
        }
    )
}

async function findBookDetails(id, Book){
    let bookDetail = await Book.findById(id)
    return bookDetail;
}

async function imageFetch(bookId, Book) { 
    let data = await Book.findById(bookId);
    return data;
}

function updateBook(id, title, author, downloadLink, volume, summary, image, Book, res){
    Book.findByIdAndUpdate(id, {
        title: title, 
        author: author, 
        downloadLink: downloadLink, 
        volume: volume, 
        summary: summary, 
        image: image
    }, function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("updated")
                res.redirect("/");
            }
        })
}

async function deleteBook(id, Book, res){
    // const prevImage = await Book.findById(id)
    Book.findByIdAndDelete(id, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            fs.unlink("./Public/uploads/images/" + result.image, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("file removed. ")
                }
            });
            console.log(result)
            console.log("Book deleted");
            res.redirect("back")
        }
    })
}

function pushNewBook(User, username, Book){
    User.updateOne({_id: username._id}, {$push: {uploadedBooks: [Book._id]}} ,function(err, resultUser){
        if(err){
            console.log("ERRRR")
            console.log(err)
        }
        else{
            console.log("No err")
        }
    })
}

module.exports = {
    initBookDB,
    postBook,
    findBookDetails,
    imageFetch,
    updateBook,
    deleteBook,
    pushNewBook
}