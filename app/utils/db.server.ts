import { PrismaClient } from "@prisma/client";

let db : PrismaClient;

db = new PrismaClient()
db.$connect()

export {db}