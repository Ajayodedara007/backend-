import { app } from "./app.js"
import connectDB from "./db/index.js"



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running at port ${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log("error",error)
    })
})
.catch((error)=>{
    console.log("Mongodb connection failed",error)
})









// const app = express()


// ;( async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error",error)
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`app listning on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("Error",error)
//     }

// })()