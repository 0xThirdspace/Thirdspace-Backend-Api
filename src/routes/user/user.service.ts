import { db } from "../../../utils/db.server";
import { User } from "../auth/auth.service";
import { Prisma } from "@prisma/client";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export const getAllUsers = async (): Promise<Omit<User, "password">[]> => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return users.map(({ id, name, email }) => ({ id, name, email }));
};

export const getUser = async (
  id: string
): Promise<Omit<User, "password"> | null> => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  return null;
};

export const updateProfile = async (
  userId: string,
  user: UserProfile,
  profileImage: any
): Promise<any> => {
  const exisitingUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!exisitingUser) {
    return null;
  }

  const { name, email } = user;

  const updatedUser = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      email,
      profileImage,
    },
    select: {
      name: true,
      email: true,
      profileImage: true,
    },
  });

  return updatedUser;
};

export const searchUser = async (name: any): Promise<any[] | null> => {
  const or: Prisma.UserWhereInput[] = name
    ? [
        { name: { contains: name, mode: "insensitive" } }, // Using 'contains' for case-insensitive search
        { profileImage: { contains: name, mode: "insensitive" } },
      ]
    : [];

  const users = await db.user.findMany({
    where: {
      OR: or,
    },
    select: {
      name: true,
      profileImage: true,
    },
  });

  console.log("users");

  if (users) {
    return users;
  }

  return null;
};
