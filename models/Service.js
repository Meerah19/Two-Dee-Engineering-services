const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    icon: String,
    badge: String,
    shortDescription: String,
    fullDescription: String,
    capabilities: [{
        title: String,
        description: String,
        icon: String
    }],
    technologies: [String],
    process: [{
        step: Number,
        title: String,
        description: String
    }],
    caseStudies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    imageUrl: String,
    videoUrl: String,
    featured: Boolean,
    order: Number,
    published: Boolean,
    seo: {
        title: String,
        description: String
    }
}, {
    timestamps: true
});

serviceSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);