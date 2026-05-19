const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: String,
    company: String,
    projectType: {
        type: String,
        enum: ['structural', 'civil', 'mep', 'consulting', 'other']
    },
    budget: {
        type: String,
        enum: ['under-50k', '50k-100k', '100k-500k', '500k-1m', 'over-1m']
    },
    timeline: String,
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'responded', 'archived'],
        default: 'new'
    },
    notes: [{
        note: String,
        createdAt: Date,
        addedBy: String
    }],
    ipAddress: String,
    userAgent: String,
    source: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);