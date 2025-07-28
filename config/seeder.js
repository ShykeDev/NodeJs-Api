const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const seedPermissions = async () => {
    try {
        const permissions = [
            // Books permissions
            { name: 'READ_BOOKS', description: 'Read books', resource: 'BOOKS', action: 'READ' },
            { name: 'CREATE_BOOKS', description: 'Create books', resource: 'BOOKS', action: 'CREATE' },
            { name: 'UPDATE_BOOKS', description: 'Update books', resource: 'BOOKS', action: 'UPDATE' },
            { name: 'DELETE_BOOKS', description: 'Delete books', resource: 'BOOKS', action: 'DELETE' },
            { name: 'MANAGE_BOOKS', description: 'Full access to books', resource: 'BOOKS', action: 'MANAGE' },
            
            // Users permissions
            { name: 'READ_USERS', description: 'Read users', resource: 'USERS', action: 'READ' },
            { name: 'CREATE_USERS', description: 'Create users', resource: 'USERS', action: 'CREATE' },
            { name: 'UPDATE_USERS', description: 'Update users', resource: 'USERS', action: 'UPDATE' },
            { name: 'DELETE_USERS', description: 'Delete users', resource: 'USERS', action: 'DELETE' },
            { name: 'MANAGE_USERS', description: 'Full access to users', resource: 'USERS', action: 'MANAGE' },
            
            // Roles permissions
            { name: 'READ_ROLES', description: 'Read roles', resource: 'ROLES', action: 'READ' },
            { name: 'CREATE_ROLES', description: 'Create roles', resource: 'ROLES', action: 'CREATE' },
            { name: 'UPDATE_ROLES', description: 'Update roles', resource: 'ROLES', action: 'UPDATE' },
            { name: 'DELETE_ROLES', description: 'Delete roles', resource: 'ROLES', action: 'DELETE' },
            { name: 'MANAGE_ROLES', description: 'Full access to roles', resource: 'ROLES', action: 'MANAGE' },
            
            // Permissions permissions
            { name: 'READ_PERMISSIONS', description: 'Read permissions', resource: 'PERMISSIONS', action: 'READ' },
            { name: 'CREATE_PERMISSIONS', description: 'Create permissions', resource: 'PERMISSIONS', action: 'CREATE' },
            { name: 'UPDATE_PERMISSIONS', description: 'Update permissions', resource: 'PERMISSIONS', action: 'UPDATE' },
            { name: 'DELETE_PERMISSIONS', description: 'Delete permissions', resource: 'PERMISSIONS', action: 'DELETE' },
            { name: 'MANAGE_PERMISSIONS', description: 'Full access to permissions', resource: 'PERMISSIONS', action: 'MANAGE' }
        ];

        for (const permData of permissions) {
            await Permission.findOneAndUpdate(
                { name: permData.name },
                permData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Permissions seeded successfully');
        return await Permission.find();
    } catch (error) {
        console.error('❌ Error seeding permissions:', error);
        throw error;
    }
};

const seedRoles = async () => {
    try {
        const permissions = await Permission.find();
        const permissionMap = {};
        permissions.forEach(perm => {
            permissionMap[perm.name] = perm._id;
        });

        const roles = [
            {
                name: 'SUPER_ADMIN',
                description: 'Super Administrator with full system access',
                isSystem: true,
                permissions: Object.values(permissionMap) // All permissions
            },
            {
                name: 'ADMIN',
                description: 'Administrator with management access',
                isSystem: true,
                permissions: [
                    permissionMap['MANAGE_BOOKS'],
                    permissionMap['READ_USERS'],
                    permissionMap['UPDATE_USERS'],
                    permissionMap['READ_ROLES'],
                    permissionMap['READ_PERMISSIONS']
                ]
            },
            {
                name: 'MANAGER',
                description: 'Manager with books and users management',
                isSystem: true,
                permissions: [
                    permissionMap['MANAGE_BOOKS'],
                    permissionMap['READ_USERS'],
                    permissionMap['UPDATE_USERS']
                ]
            },
            {
                name: 'LIBRARIAN',
                description: 'Librarian with books management access',
                isSystem: true,
                permissions: [
                    permissionMap['READ_BOOKS'],
                    permissionMap['CREATE_BOOKS'],
                    permissionMap['UPDATE_BOOKS']
                ]
            },
            {
                name: 'USER',
                description: 'Regular user with read-only access',
                isSystem: true,
                permissions: [
                    permissionMap['READ_BOOKS']
                ]
            }
        ];

        for (const roleData of roles) {
            await Role.findOneAndUpdate(
                { name: roleData.name },
                roleData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Roles seeded successfully');
        return await Role.find();
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        throw error;
    }
};

const seedDefaultAdmin = async () => {
    try {
        const adminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
        if (!adminRole) {
            throw new Error('SUPER_ADMIN role not found');
        }

        const adminUser = {
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // Will be hashed by pre-save middleware
            fullName: 'System Administrator',
            roles: [adminRole._id]
        };

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const newAdmin = new User(adminUser);
            await newAdmin.save();
            console.log('✅ Default admin user created');
            console.log('📧 Admin credentials: admin@example.com / admin123');
        } else {
            console.log('ℹ️ Default admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding default admin:', error);
        throw error;
    }
};

const seedAll = async () => {
    try {
        console.log('🌱 Starting seeding process...');
        
        await seedPermissions();
        await seedRoles();
        await seedDefaultAdmin();
        
        console.log('🎉 All seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

module.exports = {
    seedPermissions,
    seedRoles,
    seedDefaultAdmin,
    seedAll
};
