require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "rag-board-server",
      script: "./src/server.js",

      instances: 4,
      exec_mode: "cluster",

      watch: true,
      ignore_watch: ["node_modules", "logs", ".git"],
      watch_delay: 1000,
      watch_options: {
        followSymlinks: false,
      },
      autorestart: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      combine_logs: true,
      merge_logs: true,
      pid_file: "./logs/pid.log",

      max_memory_restart: "500M",
      time: true,

      env: {
        NODE_ENV: process.env.NODE_ENV || "development",

        PORT: process.env.PORT || 3000,

        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT || 5432,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS || 5,

        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

        COOKIE_SECURE: process.env.COOKIE_SECURE || "false",
        COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "strict",

        CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5500",
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

        JWT_SECRET: process.env.JWT_SECRET,
      },
    },
  ],
};
