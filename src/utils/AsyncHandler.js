// const asyncHandler=(func)=> async (req, res, next)=>{
//     try {
//         await func(req, res, next);
//     } catch (error) {
//         res.status(res.code).json({
//             success: false,
//             message: error.message,
//         })
//     }
// }

const asyncHandler=(requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((error)=> error.next)
    }
}

export {asyncHandler}