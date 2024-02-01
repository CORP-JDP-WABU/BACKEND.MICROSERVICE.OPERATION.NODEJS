export default () => ({
  http: {
    host: process.env.SERVICE_HTTP_HOST,
    port: process.env.SERVICE_HTTP_PORT,
    basePath: process.env.SERVICE_BASE_PATH,
    throttle: {
      ttl: process.env.SERVICE_HTTP_THROTTLE_TTL,
      limit: process.env.SERVICE_HTTP_THROTTLE_LIMIT,
    },
  },
  swagger: {
    basePath: process.env.SWAGGER_BASE_PATH,
  },
  mongodb: {
    uri: 'mongodb+srv://' + process.env.DATABASE_MONGO_HOSTNAME,
    user: process.env.DATABASE_MONGO_USER,
    pass: process.env.DATABASE_MONGO_PASSWORD,
    dbName: process.env.DATABASE_MONGO_NAME,
  },
});
