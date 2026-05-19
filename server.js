const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 14 * 24 * 60 * 60 }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('DB Error:', err));

// ============ FRONTEND ROUTES ============
app.get('/', (req, res) => res.render('pages/index', { title: 'Home' }));
app.get('/services', (req, res) => res.render('pages/services', { title: 'Services' }));
app.get('/projects', (req, res) => res.render('pages/projects', { title: 'Projects' }));
app.get('/about', (req, res) => res.render('pages/about', { title: 'About' }));
app.get('/contact', (req, res) => res.render('pages/contact', { title: 'Contact' }));

app.post('/contact/submit', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        await db.collection('inquiries').insertOne({
            ...req.body,
            createdAt: new Date(),
            status: 'new'
        });
        res.send(`<h2>✅ Message Sent!</h2><a href="/">Go Home</a>`);
    } catch (error) {
        res.send(`<h2>❌ Error</h2><a href="/contact">Try Again</a>`);
    }
});

// ============ ADMIN AUTH ============
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/admin/login');
    next();
};

// ============ ADMIN ROUTES ============

// Login
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

app.post('/admin/login', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email: req.body.email });
        
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        res.render('admin/login', { error: 'Login failed' });
    }
});

// Dashboard
app.get('/admin/dashboard', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    const inquiries = await db.collection('inquiries').find().sort({ createdAt: -1 }).limit(5).toArray();
    const projects = await db.collection('projects_tracker').find().toArray();
    const partners = await db.collection('partners').find().toArray();
    
    res.render('admin/dashboard', {
        stats: {
            totalInquiries: await db.collection('inquiries').countDocuments(),
            newInquiries: await db.collection('inquiries').countDocuments({ status: 'new' }),
            totalPartners: partners.length,
            ongoingProjects: projects.filter(p => p.status === 'ongoing').length,
            totalServices: await db.collection('services').countDocuments()
        },
        recentInquiries: inquiries,
        currentPage: 'dashboard'
    });
});

// Inquiries
app.get('/admin/inquiries', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    const inquiries = await db.collection('inquiries').find().sort({ createdAt: -1 }).toArray();
    res.render('admin/inquiries', { inquiries, currentPage: 'inquiries' });
});

app.post('/admin/inquiry/delete/:id', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('inquiries').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.redirect('/admin/inquiries');
});

// Partners
app.get('/admin/partners', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    const partners = await db.collection('partners').find().toArray();
    res.render('admin/partners', { partners, currentPage: 'partners' });
});

app.post('/admin/partner/add', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('partners').insertOne({
        name: req.body.name,
        icon: req.body.icon || '🤝',
        type: req.body.type,
        status: 'active',
        createdAt: new Date()
    });
    res.redirect('/admin/partners');
});

app.post('/admin/partner/delete/:id', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('partners').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.redirect('/admin/partners');
});

// Projects Tracker
app.get('/admin/projects', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    const projects = await db.collection('projects_tracker').find().sort({ createdAt: -1 }).toArray();
    res.render('admin/projects', { projects, currentPage: 'projects' });
});

app.post('/admin/project/add', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('projects_tracker').insertOne({
        name: req.body.name,
        client: req.body.client,
        status: req.body.status,
        progress: parseInt(req.body.progress),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        priority: req.body.priority,
        createdAt: new Date()
    });
    res.redirect('/admin/projects');
});

app.post('/admin/project/update/:id', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('projects_tracker').updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { $set: { 
            progress: parseInt(req.body.progress),
            status: req.body.progress >= 100 ? 'completed' : req.body.status
        }}
    );
    res.redirect('/admin/projects');
});

app.post('/admin/project/delete/:id', requireLogin, async (req, res) => {
    const db = mongoose.connection.db;
    await db.collection('projects_tracker').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.redirect('/admin/projects');
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// API
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', database: mongoose.connection.readyState === 1 });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Admin: /admin/login | Email: admin@twodee.com | Pass: SecurePass123!\n`);
});
