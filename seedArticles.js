const mongoose = require('mongoose');
const Article = require('./models/Article');
const Issue = require('./models/Issue');
require('dotenv').config();

const sampleArticles = {
  issue1: [
    {
      title: "Advanced Neural Network Architectures for Real-Time Image Processing",
      abstract: "This paper presents a comprehensive study on advanced neural network architectures optimized for real-time image processing applications. We propose a novel hybrid CNN-transformer model that achieves state-of-the-art performance while maintaining computational efficiency. Our experiments demonstrate a 40% improvement in processing speed compared to existing methods.",
      authors: [
        { firstName: "Sarah", lastName: "Johnson", email: "s.johnson@university.edu", affiliation: "MIT Computer Science", isCorresponding: true },
        { firstName: "Michael", lastName: "Chen", email: "m.chen@tech.edu", affiliation: "Stanford AI Lab", isCorresponding: false }
      ],
      keywords: ["Neural Networks", "Image Processing", "Deep Learning", "Computer Vision"],
      manuscriptId: "AJSE-2024-001",
      status: "published",
      doi: "10.1234/ajse.2024.01.001"
    },
    {
      title: "Quantum Computing Applications in Cryptographic Systems",
      abstract: "We explore the integration of quantum computing principles in modern cryptographic systems. This research demonstrates how quantum algorithms can enhance encryption methods while addressing potential security vulnerabilities. Our findings suggest a roadmap for quantum-resistant cryptography implementation.",
      authors: [
        { firstName: "Robert", lastName: "Williams", email: "r.williams@quantum.org", affiliation: "Caltech Quantum Institute", isCorresponding: true },
        { firstName: "Emily", lastName: "Zhang", email: "e.zhang@crypto.edu", affiliation: "Berkeley Cryptography Lab", isCorresponding: false },
        { firstName: "David", lastName: "Kumar", email: "d.kumar@tech.ac", affiliation: "IIT Delhi", isCorresponding: false }
      ],
      keywords: ["Quantum Computing", "Cryptography", "Security", "Quantum Algorithms"],
      manuscriptId: "AJSE-2024-002",
      status: "published",
      doi: "10.1234/ajse.2024.01.002"
    },
    {
      title: "Sustainable Energy Management in Smart Grid Systems Using Machine Learning",
      abstract: "This study investigates the application of machine learning algorithms for optimizing energy distribution in smart grid networks. We develop predictive models that reduce energy waste by 35% and improve grid reliability. The proposed framework demonstrates scalability across different grid sizes and configurations.",
      authors: [
        { firstName: "Jennifer", lastName: "Martinez", email: "j.martinez@energy.edu", affiliation: "UC Berkeley Energy Institute", isCorresponding: true },
        { firstName: "Thomas", lastName: "Anderson", email: "t.anderson@grid.org", affiliation: "Carnegie Mellon Smart Grid Lab", isCorresponding: false }
      ],
      keywords: ["Smart Grid", "Machine Learning", "Energy Management", "Sustainability"],
      manuscriptId: "AJSE-2024-003",
      status: "published",
      doi: "10.1234/ajse.2024.01.003"
    },
    {
      title: "Blockchain-Based Healthcare Data Management: A Systematic Approach",
      abstract: "We present a novel blockchain-based framework for secure and efficient healthcare data management. The proposed system ensures patient privacy while enabling seamless data sharing among authorized healthcare providers. Performance evaluation shows 60% reduction in data access time compared to traditional systems.",
      authors: [
        { firstName: "Lisa", lastName: "Taylor", email: "l.taylor@medical.edu", affiliation: "Johns Hopkins Medical Informatics", isCorresponding: true },
        { firstName: "James", lastName: "White", email: "j.white@blockchain.org", affiliation: "MIT Blockchain Lab", isCorresponding: false },
        { firstName: "Maria", lastName: "Garcia", email: "m.garcia@healthcare.edu", affiliation: "Harvard Medical School", isCorresponding: false }
      ],
      keywords: ["Blockchain", "Healthcare", "Data Management", "Privacy"],
      manuscriptId: "AJSE-2024-004",
      status: "published",
      doi: "10.1234/ajse.2024.01.004"
    },
    {
      title: "Autonomous Vehicle Navigation Using Reinforcement Learning in Urban Environments",
      abstract: "This research addresses the challenges of autonomous vehicle navigation in complex urban settings. We propose a reinforcement learning-based approach that adapts to dynamic traffic conditions and achieves 95% success rate in navigation tasks. The system demonstrates robust performance across various weather and lighting conditions.",
      authors: [
        { firstName: "Kevin", lastName: "Brown", email: "k.brown@auto.edu", affiliation: "Stanford Autonomous Systems Lab", isCorresponding: true },
        { firstName: "Amanda", lastName: "Lee", email: "a.lee@robotics.org", affiliation: "CMU Robotics Institute", isCorresponding: false }
      ],
      keywords: ["Autonomous Vehicles", "Reinforcement Learning", "Urban Navigation", "AI"],
      manuscriptId: "AJSE-2024-005",
      status: "published",
      doi: "10.1234/ajse.2024.01.005"
    }
  ],
  issue2: [
    {
      title: "5G Network Optimization Through Edge Computing and AI",
      abstract: "We investigate the synergy between edge computing and artificial intelligence for optimizing 5G network performance. Our proposed architecture reduces latency by 50% and improves bandwidth utilization. Field trials demonstrate significant improvements in quality of service metrics across diverse deployment scenarios.",
      authors: [
        { firstName: "Daniel", lastName: "Park", email: "d.park@wireless.edu", affiliation: "Georgia Tech Wireless Lab", isCorresponding: true },
        { firstName: "Rachel", lastName: "Kim", email: "r.kim@network.org", affiliation: "KAIST Network Systems Lab", isCorresponding: false },
        { firstName: "Steven", lastName: "Liu", email: "s.liu@telecom.edu", affiliation: "Tsinghua University", isCorresponding: false }
      ],
      keywords: ["5G Networks", "Edge Computing", "AI Optimization", "Telecommunications"],
      manuscriptId: "AJSE-2024-006",
      status: "published",
      doi: "10.1234/ajse.2024.02.001"
    },
    {
      title: "Cybersecurity Threat Detection Using Deep Learning and Behavioral Analysis",
      abstract: "This paper presents an innovative approach to cybersecurity threat detection combining deep learning with behavioral analysis. The system identifies zero-day attacks with 92% accuracy and reduces false positives by 70%. Real-world deployment results validate the effectiveness of the proposed methodology.",
      authors: [
        { firstName: "Christopher", lastName: "Davis", email: "c.davis@security.edu", affiliation: "MIT Cybersecurity Lab", isCorresponding: true },
        { firstName: "Nicole", lastName: "Thompson", email: "n.thompson@cyber.org", affiliation: "UC Berkeley Security Research", isCorresponding: false }
      ],
      keywords: ["Cybersecurity", "Deep Learning", "Threat Detection", "Network Security"],
      manuscriptId: "AJSE-2024-007",
      status: "published",
      doi: "10.1234/ajse.2024.02.002"
    },
    {
      title: "Internet of Things Architecture for Smart Agriculture: A Case Study",
      abstract: "We develop a comprehensive IoT architecture for precision agriculture that integrates sensor networks, cloud computing, and data analytics. The system optimizes irrigation schedules, reduces water consumption by 45%, and improves crop yield. Deployment across multiple farms demonstrates scalability and cost-effectiveness.",
      authors: [
        { firstName: "Patricia", lastName: "Miller", email: "p.miller@agri.edu", affiliation: "UC Davis Agricultural Engineering", isCorresponding: true },
        { firstName: "Mark", lastName: "Wilson", email: "m.wilson@iot.org", affiliation: "Cornell IoT Lab", isCorresponding: false },
        { firstName: "Susan", lastName: "Moore", email: "s.moore@farming.edu", affiliation: "Purdue Agriculture Tech", isCorresponding: false }
      ],
      keywords: ["IoT", "Smart Agriculture", "Precision Farming", "Sensor Networks"],
      manuscriptId: "AJSE-2024-008",
      status: "published",
      doi: "10.1234/ajse.2024.02.003"
    },
    {
      title: "Natural Language Processing for Automated Code Review and Bug Detection",
      abstract: "This study explores the application of advanced NLP techniques for automated code review and bug detection in software development. Our transformer-based model identifies potential bugs with 88% precision and suggests code improvements. Integration with existing development workflows shows significant productivity gains.",
      authors: [
        { firstName: "Andrew", lastName: "Jackson", email: "a.jackson@software.edu", affiliation: "Stanford Software Engineering", isCorresponding: true },
        { firstName: "Michelle", lastName: "Rodriguez", email: "m.rodriguez@ai.org", affiliation: "CMU Language Technologies", isCorresponding: false }
      ],
      keywords: ["Natural Language Processing", "Code Review", "Software Engineering", "Bug Detection"],
      manuscriptId: "AJSE-2024-009",
      status: "published",
      doi: "10.1234/ajse.2024.02.004"
    },
    {
      title: "Augmented Reality in Medical Training: Performance Evaluation and User Experience",
      abstract: "We evaluate the effectiveness of augmented reality systems in medical training environments. Our study involves 200 medical students and demonstrates 40% improvement in surgical skill acquisition compared to traditional methods. User experience analysis reveals high satisfaction rates and identifies key design principles for AR medical applications.",
      authors: [
        { firstName: "Brian", lastName: "Harris", email: "b.harris@medical.edu", affiliation: "Mayo Clinic Research", isCorresponding: true },
        { firstName: "Laura", lastName: "Clark", email: "l.clark@ar.org", affiliation: "Stanford AR Lab", isCorresponding: false },
        { firstName: "Richard", lastName: "Lewis", email: "r.lewis@surgery.edu", affiliation: "Johns Hopkins Surgery", isCorresponding: false }
      ],
      keywords: ["Augmented Reality", "Medical Training", "Healthcare Education", "User Experience"],
      manuscriptId: "AJSE-2024-010",
      status: "published",
      doi: "10.1234/ajse.2024.02.005"
    }
  ]
};

async function seedArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create Issue 1 and Issue 2
    let issue1 = await Issue.findOne({ volume: 1, issue: 1 });
    if (!issue1) {
      issue1 = await Issue.create({
        volume: 1,
        issue: 1,
        publicationDate: new Date('2024-01-15'),
        theme: 'Artificial Intelligence and Machine Learning',
        description: 'Special issue on advances in AI and ML applications'
      });
      console.log('Created Issue 1');
    }

    let issue2 = await Issue.findOne({ volume: 1, issue: 2 });
    if (!issue2) {
      issue2 = await Issue.create({
        volume: 1,
        issue: 2,
        publicationDate: new Date('2024-06-15'),
        theme: 'Emerging Technologies and Systems',
        description: 'Exploring cutting-edge technologies and their applications'
      });
      console.log('Created Issue 2');
    }

    // Clear existing articles if any
    await Article.deleteMany({ 
      manuscriptId: { 
        $in: [...sampleArticles.issue1, ...sampleArticles.issue2].map(a => a.manuscriptId) 
      } 
    });

    // Add articles for Issue 1
    console.log('\nAdding articles to Issue 1...');
    for (let i = 0; i < sampleArticles.issue1.length; i++) {
      const articleData = {
        ...sampleArticles.issue1[i],
        issue: `Vol ${issue1.volume}, Issue ${issue1.issue}`,
        articleNumber: i + 1,
        publicationDate: new Date('2024-01-15'),
        pdfUrl: `/uploads/sample-article-${i+1}.pdf`, // Placeholder
        submittedBy: new mongoose.Types.ObjectId(), // Placeholder user ID
        reviews: []
      };
      
      const article = await Article.create(articleData);
      console.log(`  ✓ Added: ${article.title} (Article #${article.articleNumber})`);
    }

    // Add articles for Issue 2
    console.log('\nAdding articles to Issue 2...');
    for (let i = 0; i < sampleArticles.issue2.length; i++) {
      const articleData = {
        ...sampleArticles.issue2[i],
        issue: `Vol ${issue2.volume}, Issue ${issue2.issue}`,
        articleNumber: i + 1,
        publicationDate: new Date('2024-06-15'),
        pdfUrl: `/uploads/sample-article-${i+6}.pdf`, // Placeholder
        submittedBy: new mongoose.Types.ObjectId(), // Placeholder user ID
        reviews: []
      };
      
      const article = await Article.create(articleData);
      console.log(`  ✓ Added: ${article.title} (Article #${article.articleNumber})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   Issue 1: ${sampleArticles.issue1.length} articles`);
    console.log(`   Issue 2: ${sampleArticles.issue2.length} articles`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedArticles();
