import { db } from "../../../utils/db.server";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
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
