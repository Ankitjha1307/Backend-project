import multer from "multer";

const storage= multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname) // as the file would be for a very small amount of time on the server before upload so no issues of duplicate names
    }
})

const upload = multer({storage})