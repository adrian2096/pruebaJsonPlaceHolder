import Joi from "joi";
import fetch from "node-fetch";
import express from "express";
const app = express();
import fs from "fs";
import jwt from "jsonwebtoken";


    function validatePost (post){
        const schema = Joi.object ({
            userId: Joi.required(),
            title: Joi.string().required(),
            body: Joi.string().required()
        });

        return schema.validate(post);
    };
    function isEmptyObject (obj) {
        for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
        }
        return true;
    };
    async function contadorIdPost (){
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/');
        const body = await response.json();
        return JSON.parse(JSON.stringify(body)).length;
    };
    async function ListarPosts(){
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/');
        const body = await response.json();
        return body;
    }
    async function ListarPost(id){
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const body = await response.json();
        return body;
    }
    function validateToken(req, res, next){
        let privateKey = fs.readFileSync('./private.pem','utf8');
        const accessToken = req.headers['authorization'];
        
        jwt.verify(accessToken, privateKey, { algorithm: 'HS256' }, (err, decoded) => {
            if (err){
                res.status(500).json({ error: "expired token or Not authorized"})
            }else{
                next();
            }
        });
    
    }

    export { isEmptyObject, validatePost, contadorIdPost, ListarPosts, ListarPost, validateToken };
