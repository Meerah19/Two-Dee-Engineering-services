const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get direct database access (bypassing models)
        const db = mongoose.connection.db;
        
        // Clear existing collections
        await db.collection('users').deleteMany({});
        await db.collection('services').deleteMany({});
        await db.collection('projects').deleteMany({});
        console.log('✅ Cleared existing data');

        // Create Admin User (with hashed password)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('SecurePass123!', salt);
        
        await db.collection('users').insertOne({
            name: 'Admin User',
            email: 'admin@twodee.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Admin user created');

        // Create Services
        const services = [
            {
                name: 'Structural Engineering',
                slug: 'structural-engineering',
                shortDescription: 'Innovative structural design for complex buildings.',
                fullDescription: 'Our structural engineering team delivers innovative, cost-effective solutions that prioritize safety, durability, and architectural vision.',
                icon: '🏗️',
                featured: true,
                order: 1,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Civil Engineering',
                slug: 'civil-engineering',
                shortDescription: 'Site development and infrastructure solutions.',
                fullDescription: 'From site selection to final approval, our civil engineering services ensure your project meets regulatory requirements.',
                icon: '🏞️',
                featured: true,
                order: 2,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'MEP Engineering',
                slug: 'mep-engineering',
                shortDescription: 'Mechanical, electrical, and plumbing systems.',
                fullDescription: 'Our MEP engineering services deliver integrated systems that enhance building performance and energy efficiency.',
                icon: '⚡',
                featured: true,
                order: 3,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Construction Consulting',
                slug: 'construction-consulting',
                shortDescription: 'Expert guidance throughout construction.',
                fullDescription: 'Expert guidance throughout the construction lifecycle to optimize outcomes and manage risk.',
                icon: '🔧',
                featured: true,
                order: 4,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('services').insertMany(services);
        console.log('✅ Services created');

        // Create Projects
        const projects = [
            {
                title: 'Downtown Commercial Tower',
                slug: 'downtown-commercial-tower',
                category: 'structural',
                location: { city: 'Austin', state: 'TX', country: 'USA' },
                client: 'Urban Development Group',
                yearCompleted: 2023,
                challenge: 'Design a 35-story mixed-use tower on a constrained urban site with challenging soil conditions.',
                solution: 'Developed a hybrid steel and concrete structural system that maximized floor area while minimizing foundation loads.',
                results: [
                    { icon: '📊', text: 'Structural steel costs reduced', metric: '18%' },
                    { icon: '⏱️', text: 'Foundation work completed early', metric: '3 weeks' },
                    { icon: '🌿', text: 'Embodied carbon reduction', metric: '15%' }
                ],
                images: [{ url: '/images/project1.jpg', caption: 'Completed tower', isPrimary: true }],
                featured: true,
                order: 1,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Riverwalk Plaza Mixed-Use',
                slug: 'riverwalk-plaza',
                category: 'civil',
                location: { city: 'San Antonio', state: 'TX', country: 'USA' },
                client: 'Riverwalk Development LLC',
                yearCompleted: 2023,
                challenge: 'Site development for a 12-acre mixed-use project adjacent to the San Antonio River with complex drainage requirements.',
                solution: 'Designed comprehensive stormwater management system incorporating bioswales and retention ponds.',
                results: [
                    { icon: '📅', text: 'Project completed early', metric: '2 weeks' },
                    { icon: '🛡️', text: 'Safety record', metric: 'Zero incidents' },
                    { icon: '✅', text: 'Environmental compliance', metric: '100%' }
                ],
                images: [{ url: '/images/project2.jpg', caption: 'Aerial view', isPrimary: true }],
                featured: true,
                order: 2,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Coastal Medical Center',
                slug: 'coastal-medical-center',
                category: 'structural',
                location: { city: 'San Diego', state: 'CA', country: 'USA' },
                client: 'Pacific Health Systems',
                yearCompleted: 2024,
                challenge: 'Design a seismic-resilient medical facility with strict vibration isolation requirements.',
                solution: 'Implemented base isolation system to protect critical medical equipment.',
                results: [
                    { icon: '🏆', text: 'LEED Certification', metric: 'Gold' },
                    { icon: '🛡️', text: 'Seismic safety', metric: 'Exceeded requirements' },
                    { icon: '💰', text: 'Cost savings', metric: '12%' }
                ],
                images: [{ url: '/images/project3.jpg', caption: 'Medical center', isPrimary: true }],
                featured: true,
                order: 3,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('projects').insertMany(projects);
        console.log('✅ Projects created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: admin@twodee.com');
        console.log('   Password: SecurePass123!');
        console.log('\n🌐 Start your server:');
        console.log('   npm start');
        console.log('\n📍 Visit: http://localhost:3000\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
