require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

// Get your token from login first
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUwODI0ODU3LCJleHAiOjE3NTE0Mjk2NTd9.27R_AFLLPoDvBBab3E41iWrW5Pp48aK7m1kN-K_31_I';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function testTasks() {
  try {
    console.log('🧪 Testing Task Management...\n');

    // 1. Create a task
    console.log('1. Creating a task...');
    const createResponse = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Implement user authentication',
        description: 'Set up JWT authentication with login and registration',
        projectId: 1, // Use your actual project ID
        priority: 3,
        dueDate: '2025-01-01T00:00:00.000Z'
      })
    });
    const newTask = await createResponse.json();
    console.log('✅ Task created:', newTask.data?.title || newTask);
    
    const taskId = newTask.data?.id;

    if (taskId) {
      // 2. Get all tasks
      console.log('\n2. Getting all tasks...');
      const tasksResponse = await fetch(`${BASE_URL}/tasks`, { headers });
      const tasks = await tasksResponse.json();
      console.log('✅ Tasks retrieved:', tasks.data?.length || 0, 'tasks');

      // 3. Get specific task
      console.log('\n3. Getting specific task...');
      const taskResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, { headers });
      const task = await taskResponse.json();
      console.log('✅ Task retrieved:', task.data?.title || task);

      // 4. Update task status
      console.log('\n4. Updating task status...');
      const statusResponse = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'in_progress' })
      });
      const updatedTask = await statusResponse.json();
      console.log('✅ Task status updated:', updatedTask.data?.status || updatedTask);

      // 5. Update full task
      console.log('\n5. Updating task details...');
      const updateResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: 'Implement user authentication (Updated)',
          priority: 5,
          status: 'done'
        })
      });
      const fullUpdate = await updateResponse.json();
      console.log('✅ Task updated:', fullUpdate.data?.title || fullUpdate);

      // 6. Get task statistics
      console.log('\n6. Getting task statistics...');
      const statsResponse = await fetch(`${BASE_URL}/tasks/statistics`, { headers });
      const stats = await statsResponse.json();
      console.log('✅ Statistics:', stats.data || stats);

      // 7. Filter tasks by status
      console.log('\n7. Filtering tasks by status...');
      const filteredResponse = await fetch(`${BASE_URL}/tasks?status=done`, { headers });
      const filtered = await filteredResponse.json();
      console.log('✅ Filtered tasks:', filtered.data?.length || 0, 'done tasks');
    }

    console.log('\n🎉 All task tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTasks();