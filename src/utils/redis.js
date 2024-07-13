const redis = require("redis");
const logger = require("./logger")(module);

// Create a Redis client
const redis_url = process.env.REDIS_HOST ? `${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : `${process.env.REDIS_PORT || 6379}`;
const redisClient = redis.createClient(redis_url);

// Connect to the Redis server
redisClient
  .connect()
  .catch((err) => logger.error("Redis connection error", err));

redisClient.on("connect", () => {
  logger.info("Connected to Redis-Server.");
});

const cacheData = async (key, value, expiration = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", expiration);
    logger.info(`Data cached under key: ${key}`);
  } catch (err) {
    logger.error("Error caching data", err);
  }
};

const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      logger.info(`Data retrieved from cache for key: ${key}`);
      return JSON.parse(data);
    }
    logger.info(`No data found in cache for key: ${key}`);
    return null;
  } catch (err) {
    logger.error("Error getting cached data", err);
    return null;
  }
};

const invalidateCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.info(`Cache invalidated for key: ${key}`);
  } catch (err) {
    logger.error("Error invalidating cache", err);
  }
};

const invalidateCacheByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cache invalidated for keys matching pattern: ${pattern}`);
    } else {
      logger.info(`No keys found matching pattern: ${pattern}`);
    }
  } catch (err) {
    logger.error("Error invalidating cache by pattern", err);
  }
};

module.exports = {
  cacheData,
  getCachedData,
  invalidateCache,
  invalidateCacheByPattern,
};
