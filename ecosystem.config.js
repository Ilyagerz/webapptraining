module.exports = {
  apps: [
    {
      name: 'nubo-training-frontend',
      cwd: '/root/webapptraining',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/root/.pm2/logs/frontend-error.log',
      out_file: '/root/.pm2/logs/frontend-out.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'nubo-training-backend',
      cwd: '/root/webapptraining',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/root/.pm2/logs/backend-error.log',
      out_file: '/root/.pm2/logs/backend-out.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
