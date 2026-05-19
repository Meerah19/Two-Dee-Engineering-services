const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Service = require('../models/Service');
const Inquiry = require('../models/Inquiry');

// Home page
router.get('/', async (req, res) => {
    try {
        const featuredProjects = await Project.find({ featured: true, published: true })
            .sort({ order: 1 })
            .limit(4);
        
        const services = await Service.find({ published: true })
            .sort({ order: 1 })
            .limit(4);
        
        res.render('pages/index', {
            title: 'Two Dee Engineering | Precision Engineering. Proven Results.',
            featuredProjects,
            services,
            currentPage: 'home'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Services page
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find({ published: true })
            .sort({ order: 1 });
        
        res.render('pages/services', {
            title: 'Our Services | Two Dee Engineering',
            services,
            currentPage: 'services'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Service detail
router.get('/services/:slug', async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug, published: true })
            .populate('caseStudies');
        
        if (!service) {
            return res.status(404).render('404');
        }
        
        const relatedServices = await Service.find({
            _id: { $ne: service._id },
            published: true
        }).limit(3);
        
        res.render('pages/service-detail', {
            title: `${service.name} | Two Dee Engineering`,
            service,
            relatedServices,
            currentPage: 'services'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Projects page with dynamic filtering
router.get('/projects', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = { published: true };
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { client: { $regex: search, $options: 'i' } }
            ];
        }
        
        const projects = await Project.find(filter)
            .sort({ yearCompleted: -1, order: 1 });
        
        const categories = await Project.distinct('category', { published: true });
        
        res.render('pages/projects', {
            title: 'Project Portfolio | Two Dee Engineering',
            projects,
            categories,
            activeCategory: category || 'all',
            search: search || '',
            currentPage: 'projects'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Project detail
router.get('/projects/:slug', async (req, res) => {
    try {
        const project = await Project.findOne({ slug: req.params.slug, published: true });
        
        if (!project) {
            return res.status(404).render('404');
        }
        
        const relatedProjects = await Project.find({
            _id: { $ne: project._id },
            category: project.category,
            published: true
        }).limit(3);
        
        res.render('pages/project-detail', {
            title: `${project.title} | Two Dee Engineering`,
            project,
            relatedProjects,
            currentPage: 'projects'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// About page
router.get('/about', async (req, res) => {
    try {
        const stats = await Project.aggregate([
            { $match: { published: true } },
            { $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                yearsOfExperience: { $max: 2024 },
                statesServed: { $addToSet: '$location.state' }
            }}
        ]);
        
        res.render('pages/about', {
            title: 'About Us | Two Dee Engineering',
            stats: stats[0] || { totalProjects: 0, statesServed: [] },
            currentPage: 'about'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us | Two Dee Engineering',
        currentPage: 'contact'
    });
});

// Contact form submission
router.post('/contact', async (req, res) => {
    try {
        const inquiry = new Inquiry({
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            source: 'website'
        });
        
        await inquiry.save();
        
        // Emit real-time notification to admin dashboard
        const io = req.app.get('io');
        io.emit('newInquiry', {
            id: inquiry._id,
            name: inquiry.name,
            createdAt: inquiry.createdAt
        });
        
        res.json({ success: true, message: 'Inquiry sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Insights/Blog page
router.get('/insights', (req, res) => {
    res.render('pages/insights', {
        title: 'Insights | Two Dee Engineering',
        currentPage: 'insights'
    });
});

// 404 handler
router.get('*', (req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found'
    });
});

module.exports = router;