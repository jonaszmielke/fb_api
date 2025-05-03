import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({log: ["query"]}); //logging queries, disable later

export default prisma;