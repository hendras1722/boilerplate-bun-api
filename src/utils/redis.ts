import { RedisClient } from "bun";

export const redis = new RedisClient("redis://localhost:6379");
