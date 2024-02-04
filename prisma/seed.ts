import { db } from "../src/utils/db.server";

type User = {
  username: string;
  email: string;
  hashedPassword: string;
};

type Video = {
  title: string;
  description: string;
  credits?: string;
  isPrivate: boolean;
};