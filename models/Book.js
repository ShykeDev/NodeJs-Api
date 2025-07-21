const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 0,
        max: new Date().getFullYear() + 1
    },
    category: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    versionKey: false // Loại bỏ __v field
});

// Index cho tìm kiếm nhanh
bookSchema.index({ isbn: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ year: 1 });

// Virtual để format timestamp
bookSchema.virtual('createdAtFormatted').get(function() {
    return this.createdAt.toISOString();
});

bookSchema.virtual('updatedAtFormatted').get(function() {
    return this.updatedAt.toISOString();
});

// Đảm bảo virtuals được include khi chuyển đổi thành JSON
bookSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.id;
        return ret;
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
