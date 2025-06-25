require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

// You'll need to get an actual token from login
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUwMTQ0ODg0LCJleHAiOjE3NTA3NDk2ODR9.RrDICqndj-nw3n1Cei9p0XG1-FfZTuywZrO98EeZ__I';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function testProjects() {
  try {
    console.log('🧪 Testing Project Management...\n');

    // 1. Create a project
    console.log('1. Creating a project...');
    const createResponse = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Project',
        description: 'This is a test project for our task manager'
      })
    });
    const newProject = await createResponse.json();
    console.log('✅ Project created:', newProject.data);
    
    const projectId = newProject.data.id;

    // 2. Get all projects
    console.log('\n2. Getting all projects...');
    const projectsResponse = await fetch(`${BASE_URL}/projects`, { headers });
    const projects = await projectsResponse.json();
    console.log('✅ Projects retrieved:', projects.data.length, 'projects');

    // 3. Get specific project
    console.log('\n3. Getting specific project...');
    const projectResponse = await fetch(`${BASE_URL}/projects/${projectId}`, { headers });
    const project = await projectResponse.json();
    console.log('✅ Project retrieved:', project.data.name);

    // 4. Update project
    console.log('\n4. Updating project...');
    const updateResponse = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Updated Test Project',
        description: 'This project has been updated'
      })
    });
    const updatedProject = await updateResponse.json();
    console.log('✅ Project updated:', updatedProject.data.name);

    // 5. Add member (you'll need another user ID)
    console.log('\n5. Adding member to project...');
    // Note: You'll need to create another user and use their ID
    // const memberResponse = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify({ userId: 2 })
    // });
    // const member = await memberResponse.json();
    // console.log('✅ Member added:', member.data);

    // 6. Get project members
    console.log('\n6. Getting project members...');
    const membersResponse = await fetch(`${BASE_URL}/projects/${projectId}/members`, { headers });
    const members = await membersResponse.json();
    console.log('✅ Members retrieved:', members.data.length, 'members');

    console.log('\n🎉 All project tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProjects();