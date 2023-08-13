import { db } from "../../../utils/db.server";
import bcrypt from "bcrypt";
import JwtToken from "../../../utils/jwt";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type LoginCredentials = {
  id: string;
  email: string;
  password: string;
};

export const signUp = async (user: Omit<User, "id">): Promise<any> => {
  const { name, email, password } = user;

  const userExists = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    throw new Error("You have already created an account, please login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  return newUser;
};

export const Login = async (
  login: Omit<LoginCredentials, "id">
): Promise<any> => {
  const { email, password } = login;
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await bcrypt.compare(password, user?.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  const jwtToken = new JwtToken(process.env.JWT_SECRET);
  const token = jwtToken.generateToken(user.id);

  const { password: _, ...secureUser } = user;

  return { secureUser, token };
};
