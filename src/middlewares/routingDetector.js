export const routingDetector = (req, res, next) => {
    const method = req.method;
    const path = req.path;
    console.log(`Routing detected: ${method} ${path}`);
    next();
};