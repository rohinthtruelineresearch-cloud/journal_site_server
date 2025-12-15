const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let AUTH_HEADER = {}; // Cookie or Authorization
let USER_ID = '';
let ARTICLE_ID = '';
let TOKEN = '';

const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Handle all status codes manually
});

async function runTests() {
    console.log('--- STARTING API TESTS (AXIOS) ---\n');

    // 1. REGISTER
    console.log('1. TEST: Register User');
    const email = `test_crud_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    let res = await client.post('/users/register', { 
        name: 'CRUD Tester', email, password, role: 'author' 
    });
    
    console.log(`   Status: ${res.status}`);
    if (res.status === 201 || res.status === 200) {
        console.log('✅ Register Success');
        USER_ID = res.data._id;
        TOKEN = res.data.token;
    } else {
        console.log('❌ Register Failed', res.data);
    }

    // 2. LOGIN
    console.log('\n2. TEST: Login User');
    res = await client.post('/users/login', { email, password });
    console.log(`   Status: ${res.status}`);
    
    if (res.status === 200) {
        console.log('✅ Login Success');
        console.log('   Response Data:', JSON.stringify(res.data)); // Debug log
        
        // Check Cookie
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
            console.log('✅ Cookie Received:', setCookie[0].split(';')[0]);
            AUTH_HEADER = { Cookie: setCookie.join('; ') };
        } else {
            console.log('⚠️  Cookie NOT Received. Using Bearer Token fallback.');
            if (res.data.token) {
                TOKEN = res.data.token;
                AUTH_HEADER = { Authorization: `Bearer ${TOKEN}` };
            } else {
                console.log('❌ No Token provided either. Auth failed.');
                return;
            }
        }
    } else {
        console.log('❌ Login Failed', res.data);
        return;
    }

    // 3. GET PROFILE (Authorized)
    console.log('\n3. TEST: Get Profile (Authorized)');
    res = await client.get('/users/profile', { headers: AUTH_HEADER });
    console.log(`   Status: ${res.status}`);
    if (res.status === 200) console.log('✅ Access Granted');
    else console.log('❌ Access Denied', res.data);

    // 4. GET PROFILE (Unauthorized)
    console.log('\n4. TEST: Get Profile (Unauthorized)');
    res = await client.get('/users/profile'); // No headers
    console.log(`   Status: ${res.status}`);
    if (res.status === 401) console.log('✅ Properly Rejected');
    else console.log('❌ Failed', res.status);

    // 5. CREATE ARTICLE
    console.log('\n5. TEST: Create Article (Valid)');
    const dummyPdf = path.join(__dirname, 'test_crud.pdf');
    fs.writeFileSync(dummyPdf, '%PDF-1.4 dummy content');
    
    const form = new FormData();
    form.append('title', 'CRUD Test Article');
    form.append('abstract', 'Testing CRUD operations');
    form.append('authors', JSON.stringify(['Tester']));
    form.append('content', 'Content body');
    form.append('wantsReviewerRole', 'false');
    form.append('manuscript', fs.createReadStream(dummyPdf));
    form.append('coverLetter', fs.createReadStream(dummyPdf));

    // Headers for form data + Auth
    const formHeaders = form.getHeaders();
    const headers = { ...AUTH_HEADER, ...formHeaders };

    res = await client.post('/articles', form, { headers });
    console.log(`   Status: ${res.status}`);

    if (res.status === 201) {
        console.log('✅ Article Created');
        ARTICLE_ID = res.data._id;
    } else {
        console.log('❌ Create Failed', res.data);
    }
    
    if (fs.existsSync(dummyPdf)) fs.unlinkSync(dummyPdf);

    // 6. GET ARTICLE BY ID
    if (ARTICLE_ID) {
        console.log('\n6. TEST: Get Article');
        res = await client.get(`/articles/${ARTICLE_ID}`);
        if (res.status === 200) console.log('✅ Article Fetched');
        else console.log('❌ Fetch Failed', res.status);

        // 7. UPDATE ARTICLE (Mock: Assign Reviewer - Admin only, so expect 401 if author)
        // Or generic update? user can't update arbitrary fields usually?
        console.log('\n7. TEST: Author Update (Should fail/limited?)');
        // Let's try to fetch my-articles
        res = await client.get('/articles/my-articles', { headers: AUTH_HEADER });
        if (res.status === 200 && Array.isArray(res.data)) console.log(`✅ My Articles Fetched: ${res.data.length}`);
        else console.log('❌ My Articles Failed');
    }

    // 8. EDGE CASE: INVALID ID
    console.log('\n8. TEST: Get Invalid ID');
    res = await client.get('/articles/5f8d0d55b549286c907b134d');
    if (res.status === 404) console.log('✅ Properly 404');
    else console.log('❌ Unexpected', res.status);

    // 9. ADMIN: Login
    console.log('\n9. TEST: Admin Login');
    // Using default credentials from create_admin.js
    res = await client.post('/users/login', { email: 'admin@journal.com', password: 'admin123' });
    let ADMIN_HEADER = {};
    if (res.status === 200) {
        console.log('✅ Admin Login Success');
        if (res.headers['set-cookie']) {
            ADMIN_HEADER = { Cookie: res.headers['set-cookie'].join('; ') };
        } else {
             ADMIN_HEADER = { Authorization: `Bearer ${res.data.token}` };
        }
    } else {
        console.log('❌ Admin Login Failed (Make sure to run node create_admin.js first)');
    }

    // 10. ADMIN: Access Admin Route
    console.log('\n10. TEST: Admin Access (Get All Users)');
    if (Object.keys(ADMIN_HEADER).length > 0) {
        res = await client.get('/users', { headers: ADMIN_HEADER }); // /api/users is Admin protected
        if (res.status === 200) console.log(`✅ Admin Access Granted (Users found: ${res.data.length})`);
        else console.log('❌ Admin Access Denied', res.status, res.data);
    } else {
        console.log('⚠️ Skipping Admin Access test due to login failure');
    }

    // 11. USER: Try Admin Route
    console.log('\n11. TEST: Regular User Access to Admin Route');
    // Re-use AUTH_HEADER from Test 2 (Regular user)
    res = await client.get('/users', { headers: AUTH_HEADER });
    if (res.status === 401 || res.status === 403) console.log('✅ User Access Properly Denied');
    else console.log('❌ Unexpected Access', res.status);

    // 12. TOKEN: Invalid/Expired
    console.log('\n12. TEST: Invalid Token');
    res = await client.get('/users/profile', { headers: { Authorization: 'Bearer invalid_token_123' }});
    if (res.status === 401) console.log('✅ Invalid Token Rejected');
    else console.log('❌ Unexpected', res.status);

    console.log('\n--- TESTS COMPLETED ---');
}

runTests();
