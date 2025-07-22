import { spawn } from 'child_process';

console.log('🚀 Starting Notion App...\n');

// Start backend server
console.log('🔧 Starting backend server on port 3001...');
const backend = spawn('node', ['backend/src/server.js'], { 
  stdio: 'inherit',
  shell: true 
});

// Wait 3 seconds for backend to start
setTimeout(() => {
  console.log('\n🌐 Starting frontend server on port 5173...');
  const frontend = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });

  console.log('\n✅ Both servers are starting!');
  console.log('📋 Access your app at: http://localhost:5173');
  console.log('🔧 Backend API at: http://localhost:3001');
  console.log('\nPress Ctrl+C to stop both servers');

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 3000); 