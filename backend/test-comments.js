require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

class CommentTester {
  constructor() {
    this.token = null;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  async login() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        email: 'admin@taskmanager.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    this.token = data.token;
    this.headers['Authorization'] = `Bearer ${this.token}`;
    console.log('✅ Logged in successfully\n');
  }

  async testComments() {
    try {
      console.log('💬 Testing Comment System...\n');

      // 1. Get a task to comment on
      console.log('1. Getting tasks...');
      const tasksResponse = await fetch(`${BASE_URL}/tasks`, { headers: this.headers });
      const tasks = await tasksResponse.json();
      
      if (!tasks.data || tasks.data.length === 0) {
        console.log('❌ No tasks found. Create a task first.');
        return;
      }

      const taskId = tasks.data[0].id;
      console.log('✅ Using task:', tasks.data[0].title);

      // 2. Create a comment
      console.log('\n2. Creating a comment...');
      const commentResponse = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          content: 'This is a test comment on the task. Great progress so far!',
          taskId: taskId
        })
      });
      const newComment = await commentResponse.json();
      console.log('✅ Comment created:', newComment.data?.content?.substring(0, 50) + '...');
      
      const commentId = newComment.data?.id;

      if (!commentId) {
        console.log('❌ Failed to create comment:', newComment);
        return;
      }

      // 3. Create a reply
      console.log('\n3. Creating a reply...');
      const replyResponse = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          content: 'Thanks! I agree, we are making good progress on this task.',
          taskId: taskId,
          parentCommentId: commentId
        })
      });
      const reply = await replyResponse.json();
      console.log('✅ Reply created:', reply.data?.content?.substring(0, 50) + '...');

      // 4. Get all comments for the task
      console.log('\n4. Getting all comments for task...');
      const allCommentsResponse = await fetch(`${BASE_URL}/comments/task/${taskId}`, { 
        headers: this.headers 
      });
      const allComments = await allCommentsResponse.json();
      console.log('✅ Retrieved', allComments.data?.length, 'comments');
      
      if (allComments.data?.length > 0) {
        const comment = allComments.data[0];
        console.log('   Comment:', comment.content.substring(0, 50) + '...');
        console.log('   By:', comment.user.username);
        console.log('   Replies:', comment.replyCount);
        
        if (comment.replies && comment.replies.length > 0) {
          console.log('   First reply:', comment.replies[0].content.substring(0, 50) + '...');
        }
      }

      // 5. Get specific comment
      console.log('\n5. Getting specific comment...');
      const specificCommentResponse = await fetch(`${BASE_URL}/comments/${commentId}`, { 
        headers: this.headers 
      });
      const specificComment = await specificCommentResponse.json();
      console.log('✅ Comment retrieved:', specificComment.data?.content?.substring(0, 50) + '...');

      // 6. Update comment
      console.log('\n6. Updating comment...');
      const updateResponse = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          content: 'This is an updated test comment. The task is progressing well!'
        })
      });
      const updatedComment = await updateResponse.json();
      console.log('✅ Comment updated:', updatedComment.data?.content?.substring(0, 50) + '...');
      console.log('   Edited:', updatedComment.data?.isEdited);

      // 7. Get comment statistics
      console.log('\n7. Getting comment statistics...');
      const statsResponse = await fetch(`${BASE_URL}/comments/statistics?taskId=${taskId}`, { 
        headers: this.headers 
      });
      const stats = await statsResponse.json();
      console.log('✅ Statistics:');
      console.log('   Total comments:', stats.data?.total);
      console.log('   My comments:', stats.data?.myComments);
      console.log('   Recent comments:', stats.data?.recent);
      console.log('   Today\'s comments:', stats.data?.today);

      // 8. Get recent comments
      console.log('\n8. Getting recent comments...');
      const recentResponse = await fetch(`${BASE_URL}/comments/recent?limit=5`, { 
        headers: this.headers 
      });
      const recent = await recentResponse.json();
      console.log('✅ Recent comments:', recent.data?.length);
      
      if (recent.data?.length > 0) {
        recent.data.forEach((comment, index) => {
          console.log(`   ${index + 1}. ${comment.content.substring(0, 40)}...`);
          console.log(`      Task: ${comment.task.title}`);
          console.log(`      By: ${comment.user.username}`);
        });
      }

      console.log('\n🎉 All comment tests completed successfully!');

    } catch (error) {
      console.error('❌ Comment test failed:', error.message);
    }
  }

  async runTests() {
    await this.login();
    await this.testComments();
  }
}

// Run the tests
const tester = new CommentTester();
tester.runTests();