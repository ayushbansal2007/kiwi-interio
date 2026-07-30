// @params {...string} allowedRoles - The roles that are allowed to access the route



const roleMiddleware = (...allowedRoles) => {
    return (req,res,next)=>{
try{
    if(!req.user ||  !req.user.role){
        return res.status(401).json({ messages: "session expired " })
    }

    const userRole = String(req.user.role).trim().toLowerCase();
    const ISallowed = allowedRoles.map((role) => role.toLowerCase()).includes(userRole);

    if(!ISallowed){
        return res.status(403).json({"message": "Access forbidden"})
    }
    next();
}


    catch(error){
        res.status(500).json({"message": error.message})


    }

}
}

module.exports=roleMiddleware;
