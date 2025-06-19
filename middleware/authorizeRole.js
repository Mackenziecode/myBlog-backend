const  authorizeRole = (allowedRoles = []) => {
    if (typeof allowedRoles === 'string') {
        allowedRoles = [allowedRoles];
    }

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({message: 'No se pudo determinar el rol del usuario. '});

        }
        const userRole = req.user.role;

        if (allowedRoles.length === 0) {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({message: `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}.` });
        }
        next();
    }
}

module.exports = { authorizeRole };