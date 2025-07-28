const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    resource: {
        type: String,
        required: true,
        trim: true,
        uppercase: true // BOOKS, USERS, ROLES, PERMISSIONS
    },
    action: {
        type: String,
        required: true,
        trim: true,
        uppercase: true, // CREATE, READ, UPDATE, DELETE, MANAGE
        enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,    versionKey: false
});

// Đảm bảo virtuals được include khi chuyển đổi thành JSON
permissionSchema.set('toJSON', { 
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.id;
        return ret;
    }
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
