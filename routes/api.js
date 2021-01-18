/*
 *
 *
 *       Complete the API routing below
 *
 *
 */


var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
require("dotenv/config");
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

// Nothing from my website will be cached in my client as a security measure.??
// I will see that the site is powered by 'PHP 4.2.0' even though it isn't as a security measure.??
// I can post a title to /api/books to add a book and returned will be the object with the title and a unique _id.??
// I can get /api/books to retrieve an aray of all books containing title, _id, & commentcount.
// I can get /api/books/{_id} to retrieve a single object of a book containing title, _id, & an array of comments (empty array if no comments present).
// I can post a comment to /api/books/{_id} to add a comment to a book and returned will be the books object similar to get /api/books/{_id}.
// I can delete /api/books/{_id} to delete a book from the collection. Returned will be 'delete successful' if successful.
// If I try to request a book that doesn't exist I will get a 'no book exists' message.
// I can send a delete request to /api/books to delete all books in the database. Returned will be 'complete delete successful' if successful.
// All 6 functional tests required are complete and passing.

module.exports = function (app) {
  MongoClient.connect(
    "mongodb+srv://advancednodedb:a@cluster0.casky.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, client) {
      if (err) {
        console.log(err);
      } else {
        app
          .route("/api/books")
          .get(function (req, res) {
            client
              .db("test")
              .collection("library")
              .find()
              .toArray(function (err, result) {
                if (err) {
                  res.json("error");
                } else {
                  for (var i = 0; i < result.length; i++) {
                    if (result[i].comments) {
                      result[i].commentcount = result[i].comments.length;
                      delete result[i].comments;
                    }
                  }
                  res.json(result);
                }
              });
          })
          .post(function (req, res) {
            const { title } = req.body;
            const book = {
              title,
              comments: []
            };
            if (book.title === "") {
              res.json("missing title");
            } else {
              client
                .db("test")
                .collection("library")
                .insertOne(book, function (error, result) {
                  if (error) {
                    res.json("Db error");
                  } else {
                    res.json(result.ops[0]);
                  }
                });
            }
          })
            .delete(function (req, res) {
              client
                .db("test")
                .collection("library")
                .deleteMany({}, function (err, deleted) {
                  res.json("deleted books");
                });
            })
        app
          .route("/api/books/:id")
          .get(function (req, res) {
            const { id } = req.params;
            client
              .db("test")
              .collection("library")
              .findOne({ _id: new ObjectId(id) }, function (err, singleBook) {
                res.json(singleBook);
              });
          })
          .post(function (req, res) {
            const { id } = req.params;
            const comments = req.body.comment;
            client
              .db("test")
              .collection("library")
              .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $push: { comments: comments } },
                { returnOriginal: false },
                function (err, result) {
                  if (err) {
                    res.json("err");
                  } else {
                    res.json(result.value);
                  }
                }
              );
          })
          .delete(function (req, res) {
            const { id } = req.params;
            client
              .db("test")
              .collection("library")
              .deleteOne({ _id: new ObjectId(id) }, function (err, deleted) {
                if (err) {
                  res.json("Error" + err);
                } else {
                  res.json("delete successful");
                }
              });
          })
      }
    }
  );
};
