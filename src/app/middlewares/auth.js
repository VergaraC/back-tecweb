const jwt = require('jsonwebtoken');
// const authConfig = require('../../config/auth.json');

// Intercepta a requisição e valida ela antes de encaminhar
module.exports = (req, res, next) => {
    // recebe uma "authorization" do Header da requisição
    const authHeader = req.headers.authorization;

    // se não existir, devolve uma mensagem de erro
    if (!authHeader) {
        return res
            .status(401) // 401: Unauthorized
            .send({ error: 'No token provided' }); // descrição
    }

    // exemplo de um token:
    // Bearer aab9c9df0g7e173499d7f891d918a912bd2f
    const parts = authHeader.split(' ');

    // se o token não tiver duas partes, há algo de errado nele
    if (!parts.length === 2) {
        return res
            .status(401) // 401: Unauthorized
            .send({ error: 'Token error' }); // descrição
    }

    // se chegar até aqui, podemos fazer uma "desestruturação"
    // e extrair as partes do tokens
    // desestruturação:
    // [a,b] = [1,2]
    // é o mesmo que
    // a = 1; b = 2;
    const [scheme, token] = parts;

    // usar RegEx para verificar se o "scheme" do nosso token
    // contém a palavra "Bearer", maiúscula ou minúscula
    // se não contiver, deve devolver um erro
    if (!/^Bearer$/i.test(scheme)) {
        return res
            .status(401) // 401: Unauthorized
            .send({ error: 'Token malformatted' }); // descrição
    }

    // por fim, verificamos se o token é válido
    jwt.verify(token, process.env.secret, (err, decoded) => {
        // houver algum erro na validação do jwt,
        // o token é inválido e devemos devolver negar
        // a autorização
        if (err) {
            return res
                .status(401) // 401: Unauthorized
                .send({ error: 'Token invalid' }); // descrição
        }
        // se não houver nenhum erro, extraímos o id e o username do token
        req.userId = decoded.id;
        req.userName = decoded.name;
        // e então liberamos a requisição para as próximas etapas
        return next();
    });
};
