// Content-Type check middleware - chỉ cho phép application/json cho POST/PUT
const contentTypeCheck = (req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({
                error: 'Content-Type must be application/json'
            });
        }
    }
    next();
};

module.exports = contentTypeCheck;
