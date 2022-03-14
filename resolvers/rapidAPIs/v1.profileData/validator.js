// Using generic validation, otherwise we generally use NPM libraries like Joi

export default async (req,res,next) => {
    res.send();
    if(!req.query.userName)
    throw new Error('User Name is required',400);
}