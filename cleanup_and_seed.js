
const mongoose = require('mongoose');
const Article = require('./models/Article');
const dotenv = require('dotenv');

dotenv.config();

// IDs to KEEP (The 3 Real Articles)
const KEEP_IDS = [
    '6957b16982cac177d1fd6b4c',
    '6957b30582cac177d1fd6b5f',
    '6957b4c882cac177d1fd6b78'
];

// 5 New "Real-Looking" Articles to Seed
const NEW_ARTICLES = [
    {
        title: "Optimizing Neural Architecture Search for Edge Computing Devices",
        abstract: "As deep learning models grow in complexity, deploying them on resource-constrained edge devices becomes increasingly challenging. This paper proposes a novel multi-objective Neural Architecture Search (NAS) framework that simultaneously minimizes latency and energy consumption while maintaining high accuracy. Experimental results on benchmark datasets demonstrate a 40% reduction in inference time compared to state-of-the-art MobileNet variants.",
        authors: [{ firstName: "David", lastName: "Chen" }, { firstName: "Sarah", lastName: "Williams" }],
        keywords: ["Neural Architecture Search", "Edge AI", "Deep Learning", "MobileNet"],
        status: "published",
        issue: "Vol 1, Issue 1",
        articleNumber: 4,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        paperType: "regular",
        hasFunding: true,
        wasConferenceAccepted: false
    },
    {
        title: "Privacy-Preserving Federated Learning: A Review of Homomorphic Encryption Techniques",
        abstract: "Federated Learning (FL) enables collaborative model training without sharing raw data, yet it remains vulnerable to gradient leakage attacks. This comprehensive review examines the integration of Homomorphic Encryption (HE) within FL pipelines. We categorize existing approaches based on computational overhead and security guarantees, identifying key trade-offs and proposing future research directions for scalable, secure distributed learning.",
        authors: [{ firstName: "Michael", lastName: "Johnson" }, { firstName: "Emily", lastName: "Davis" }],
        keywords: ["Federated Learning", "Homomorphic Encryption", "Privacy", "Cybersecurity"],
        status: "published",
        issue: "Vol 1, Issue 1",
        articleNumber: 5,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        paperType: "review",
        hasFunding: false,
        wasConferenceAccepted: true
    },
    {
        title: "AI-Driven Fault Diagnosis in Industrial IoT Systems using Graph Neural Networks",
        abstract: "Industrial Internet of Things (IIoT) systems generate maximizing quantities of graph-structured data. Traditional fault diagnosis methods often fail to capture the complex dependencies between sensor nodes. We introduce a Graph Neural Network (GNN) based approach that models these spatial-temporal dependencies explicitly. Our model achieves 98.5% accuracy in detecting anomalies in a simulated smart factory environment.",
        authors: [{ firstName: "Robert", lastName: "Smith" }, { firstName: "Angela", lastName: "Chang" }],
        keywords: ["Industrial IoT", "Fault Diagnosis", "Graph Neural Networks", "Smart Factory"],
        status: "published",
        issue: "Vol 1, Issue 1",
        articleNumber: 6,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        paperType: "regular",
        hasFunding: true,
        wasConferenceAccepted: false
    },
    {
        title: "Ethical Implications of Large Language Models in Automated Content Generation",
        abstract: "The rapid proliferation of Large Language Models (LLMs) raises significant ethical concerns regarding bias, misinformation, and copyright infringement. This study analyzes the output of three major commercial LLMs across sensitive topics. We propose a new evaluation metric for 'hallucination rate' and discuss policy frameworks required to ensure responsible AI deployment in media and education.",
        authors: [{ firstName: "Jessica", lastName: "Brown" }, { firstName: "Thomas", lastName: "Wilson" }],
        keywords: ["Large Language Models", "AI Ethics", "Bias", "Content Generation"],
        status: "published",
        issue: "Vol 1, Issue 1",
        articleNumber: 7,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        paperType: "regular",
        hasFunding: false,
        wasConferenceAccepted: false
    },
    {
        title: "Reinforcement Learning for Autonomous Drone Navigation in GPS-Denied Environments",
        abstract: "Navigating autonomous drones in complex, GPS-denied environments like underground mines or dense forests remains a critical challenge. We present a Deep Reinforcement Learning (DRL) agent trained using Proximal Policy Optimization (PPO) with lidar inputs. The agent demonstrates robust obstacle avoidance and path planning capabilities in real-world field tests, outperforming traditional SLAM-based methods.",
        authors: [{ firstName: "Daniel", lastName: "Lee" }, { firstName: "Olivia", lastName: "Martinez" }],
        keywords: ["Reinforcement Learning", "Drone Navigation", "Robotics", "GPS-Denied"],
        status: "published",
        issue: "Vol 1, Issue 1",
        articleNumber: 8,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        paperType: "regular",
        hasFunding: true,
        wasConferenceAccepted: true
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        // 1. DELETE junk articles (Not in KEEP_IDS)
        const deleteResult = await Article.deleteMany({ _id: { $nin: KEEP_IDS } });
        console.log(`Deleted ${deleteResult.deletedCount} junk articles.`);

        // 2. INSERT New Articles
        // We need to attach a dummy user ID for submittedBy.
        // Let's find an admin user or just the first user to be the 'submitter'
        // Or just leave it blank if the schema allows (it might fail if required).
        // Let's check if we can snag a user ID.
        const User = require('./models/User');
        const adminUser = await User.findOne({ role: 'admin' });
        const submitterId = adminUser ? adminUser._id : null;

        if (!submitterId) {
             console.log("Warning: No admin user found to attribute articles to.");
        }

        const articlesToInsert = NEW_ARTICLES.map(a => ({
            ...a,
            submittedBy: submitterId, // Attribute to admin
            publishedDate: new Date()
        }));

        await Article.insertMany(articlesToInsert);
        console.log(`Successfully added 5 new scientific articles.`);

    } catch (error) {
        console.error('Error during cleanup/seed:', error);
    }

    console.log('Operation Complete.');
    process.exit();
};

run();
