module.exports = {
  apps: [
    {
      name: "board-server",
      script: "./src/server.js",

      instances: 4,
      exec_mode: "cluster",

      watch: true,
      ignore_watch: ["node_modules", "logs", ".git"],
      watch_delay: 1000,
      watch_options: {
        followSymlinks: false,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      merge_logs: true,
      pid_file: "./logs/pid.log",

      max_memory_restart: "500M",

      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,

        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,

        DB_MAX_CONNECTIONS: 10,
      },

      env_production: {
        NODE_ENV: process.env.NODE_ENV_PRODUCTION,
        PORT: process.env.PORT_PRODUCTION,

        DB_HOST: process.env.DB_HOST_PRODUCTION,
        DB_PORT: process.env.DB_PORT_PRODUCTION,
        DB_NAME: process.env.DB_NAME_PRODUCTION,
        DB_USER: process.env.DB_USER_PRODUCTION,
        DB_PASSWORD: process.env.DB_PASSWORD_PRODUCTION,

        DB_MAX_CONNECTIONS: 10,
      },
    },
  ],
};
