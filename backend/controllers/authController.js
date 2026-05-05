import 'dotenv/config'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function loginController(req, res){
    const { username, password } = req.body;

    try {
        const getAdmin = username === process.env.ADMIN_USERNAME ? true : false;

        if(getAdmin === true){
            const comparePass = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);

            if(!comparePass) return res.status(400).json({message: "Incorrect Password"});

            const token = jwt.sign({ username: username}, process.env.JWT_AUTH, {expiresIn: "12h"});

            res.status(200).json({token: token})
        } else{
            res.status(400).json({message: "Unauthorized access, invalid username"})
        }
    } catch(err){
        res.status(500).json({message: "Server error"})
    }
}