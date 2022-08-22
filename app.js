import { isEmptyObject, validatePost, contadorIdPost, ListarPosts, ListarPost, validateToken } from './funciones.js';
import express from "express";
const app = express();
import fetch from "node-fetch";
import fs from "fs";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

app.use(express.json());

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     posts:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         title:
 *           type: string
 *         body:
 *           type: string
*/
/**
 * @openapi
 * tags:
 *   name: Posts
 *   description: The posts managing API
 */

const options = {
    definition:{
        openapi: "3.0.0",
        info:{
            title: "Posts API",
            version: "1.0.0",
            description: "una simple app de posteos"
        },
        servers:[
            {
                url:"http://localhost:3000"
            }
        ]
    },
    apis:["app.js"]
};

const specs = swaggerJsDoc(options)

 /**
 * @openapi
 * /jwt:
 *   get:
 *     tags: [Posts]
 *     description: Used to generate access token.
 *     responses:
 *       200:
 *         description: A succesful response generates the access token.
 */

app.get('/jwt', (req, res)=> {
    let privateKey = fs.readFileSync('./private.pem','utf8');
    let token = jwt.sign({"body":"stuff"}, privateKey, { expiresIn: '5m', algorithm: 'HS256'});
    res.send({
        token
    });
});


app.get('/', validateToken ,(req, res)=> {
    res.send("Bienvenido a mi API");
});

 /**
 * @openapi
 * /api/posts:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     tags: [Posts]
 *     description: Used to request all posts.
 *     responses:
 *       200:
 *         description: A succesful response.
 *       500:
 *         description: Expired token or Not authorized
 */

app.get('/api/posts', validateToken,async (req, res)=> {
    res.send(await ListarPosts());
});

 /**
 * @openapi
 * /api/createPost:
 *   post:
 *     security:
 *       - ApiKeyAuth: []
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/posts'
 *     description: Used to create a post.
 *     responses:
 *       200:
 *         description: A succesful response.
 *         content:
 *             application/json:
 *               schema:
 *                $ref: '#components/schemas/posts'
 *       400:
 *         description: Bad Request.
 *       500:
 *         description: Expired token or Not authorized.
 */
app.post('/api/createPost', validateToken, async (req, res)=> {
    const {error} = validatePost(req.body);
    const contadorId = contadorIdPost();
    if (error){
        return res.status(400).send(error.details[0].message);
    }
    
    req.params.id=contadorId+1;

    const response = await fetch('https://jsonplaceholder.typicode.com/posts/', {
        method: 'post',
        body: JSON.stringify(req.body),
        headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json();

    res.send(data);
});

 /**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     description: Used to request one post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: the post id
 *         required: true
 *     responses:
 *       200:
 *         description: A succesful response.
 *       404:
 *          description: The post was not found
 *       500:
 *         description: Expired token or Not authorized
 */
app.get('/api/posts/:id', validateToken, async (req, res)=> {
    
    const body= await ListarPost(req.params.id);

    if (isEmptyObject(body)) return res.status(404).send('El post no fue encontrado con el id')
    
    res.send(body);
});

 /**
 * @openapi
 * /api/modifyPost/{id}:
 *   put:
 *     security:
 *       - ApiKeyAuth: []
 *     description: Used to modify a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: the post id
 *         required: true
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/posts'
 *     responses:
 *       200:
 *         description: A succesful response.
 *         content:
 *             application/json:
 *               schema:
 *                $ref: '#components/schemas/posts'
 *       400:
 *          description: Bad Request
 *       404:
 *          description: The post was not found
 *       500:
 *         description: Expired token or Not authorized
 */

app.put('/api/modifyPost/:id', validateToken, async (req, res)=> {
   
    const body= await ListarPost(req.params.id);

    if (isEmptyObject(body)) return res.status(404).send('El post no fue encontrado con el id')

    const {error} = validatePost(req.body);

    if (error){
        return res.status(400).send(error.details[0].message);
    }

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`, {
        method: 'put',
        body: JSON.stringify(req.body),
        headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json();

    res.send(data);

});

 /**
 * @openapi
 * /api/deletePost/{id}:
 *   delete:
 *     security:
 *       - ApiKeyAuth: []
 *     description: Used to modify a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: the post id
 *         required: true
 *     responses:
 *       200:
 *         description: A succesful response, the post was deleted
 *       404:
 *          description: The post was not found
 *       500:
 *         description: Expired token or Not authorized
 */

app.delete('/api/deletePost/:id', validateToken, async (req, res)=> {
    const body= await ListarPost(req.params.id);

    if (isEmptyObject(body)) return res.status(404).send('El post no fue encontrado con el id')
    
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`, {
        method: 'delete'
    });

    const data = await response.json();
    res.send("Succesfully deleted");

});


app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(specs));


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
