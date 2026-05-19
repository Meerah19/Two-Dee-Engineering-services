const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        enum: ['structural', 'civil', 'mep', 'consulting'],
        required: true
    },
    location: {
        city: String,
        state: String,
        country: String
    },
    client: String,
    yearCompleted: Number,
    challenge: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    },
    results: [{
        icon: String,
        text: String,
        metric: String
    }],
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    testimonial: {
        text: String,
        author: String,
        position: String
    },
    technologies: [String],
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: true
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    }
}, {
    timestamps: true
});

// Auto-generate slug from title
projectSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);