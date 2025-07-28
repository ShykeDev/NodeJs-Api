// Middleware để kiểm tra quyền truy cập
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'Authentication required',
                    error: 'UNAUTHORIZED' 
                });
            }

            // Collect all permissions from user's roles
            const userPermissions = [];
            
            if (user.roles && user.roles.length > 0) {
                user.roles.forEach(role => {
                    if (role.permissions && role.permissions.length > 0) {
                        role.permissions.forEach(permission => {
                            if (permission.isActive) {
                                userPermissions.push({
                                    resource: permission.resource,
                                    action: permission.action,
                                    name: permission.name
                                });
                            }
                        });
                    }
                });
            }

            // Check if user has required permission
            const hasPermission = userPermissions.some(permission => {
                // MANAGE permission gives access to all actions on a resource
                if (permission.resource === resource.toUpperCase() && permission.action === 'MANAGE') {
                    return true;
                }
                
                // Exact match for resource and action
                return permission.resource === resource.toUpperCase() && 
                       permission.action === action.toUpperCase();
            });

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: `Access denied. Required permission: ${action.toUpperCase()} on ${resource.toUpperCase()}`,
                    error: 'FORBIDDEN',
                    requiredPermission: {
                        resource: resource.toUpperCase(),
                        action: action.toUpperCase()
                    },
                    userPermissions: userPermissions
                });
            }

            // Add permission info to request for logging
            req.permission = {
                resource: resource.toUpperCase(),
                action: action.toUpperCase(),
                granted: true
            };

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({ 
                message: 'Permission check failed',
                error: error.message 
            });
        }
    };
};

// Helper function để kiểm tra xem user có role cụ thể không
const hasRole = (roleName) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'Authentication required',
                    error: 'UNAUTHORIZED' 
                });
            }

            const hasRequiredRole = user.roles && user.roles.some(role => 
                role.name === roleName.toUpperCase() && role.isActive
            );

            if (!hasRequiredRole) {
                return res.status(403).json({ 
                    message: `Access denied. Required role: ${roleName.toUpperCase()}`,
                    error: 'FORBIDDEN',
                    requiredRole: roleName.toUpperCase()
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({ 
                message: 'Role check failed',
                error: error.message 
            });
        }
    };
};

module.exports = {
    checkPermission,
    hasRole
};
