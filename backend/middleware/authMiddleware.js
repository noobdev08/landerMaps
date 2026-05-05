import jwt from 'jsonwebtoken';

export async function authMiddleware(req, res, next){
    const token = req.headers['authorization'];

    jwt.verify(token, process.env.JWT_AUTH, (err, decode) => {
        if(err) return res.status(400).json({message: "Unauthorized access"});
        
        req.username = decode.username;
        next();
    })
}
