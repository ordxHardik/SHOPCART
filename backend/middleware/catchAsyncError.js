module.exports= (theFunc) => (req,res,next)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next) // if error then catch
}