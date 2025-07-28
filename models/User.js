const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true,    versionKey: false
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method để kiểm tra password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        throw new Error('Password field not selected. Use .select("+password") when querying.');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual để lấy permissions từ roles
userSchema.virtual('permissions', {
    ref: 'Role',
    localField: 'roles',
    foreignField: '_id',
    justOne: false
});

// Đảm bảo virtuals được include khi chuyển đổi thành JSON
userSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.id;
        delete ret.password; // Không trả về password
        return ret;
    }
});

userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
