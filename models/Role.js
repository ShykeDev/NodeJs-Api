const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
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
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false // System roles không thể xóa
    }
}, {
    timestamps: true,    versionKey: false
});

// Virtual để populate permissions
roleSchema.virtual('permissionDetails', {
    ref: 'Permission',
    localField: 'permissions',
    foreignField: '_id',
    justOne: false
});

// Đảm bảo virtuals được include khi chuyển đổi thành JSON
roleSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.id;
        return ret;
    }
});

roleSchema.set('toObject', { virtuals: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
