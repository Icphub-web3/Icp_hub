module.exports = {
  apps: [
    {
      name: "supabase-demo-backend",
      script: "supabase-demo-backend.cjs",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
