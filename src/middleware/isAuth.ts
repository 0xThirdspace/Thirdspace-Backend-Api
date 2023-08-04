import { Request, Response, NextFunction } from "express";
import JwtToken from "../../utils/jwt";

interface CustomRequest extends Request {
  isAuth?: boolean;
  userId?: string;
  
}


const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void | Response<any, Record<string, any>> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Invalid Access Token" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "") {
    return res.status(401).json({ message: "Invalid Access Token" });
  }

  let decodedToken: any;

  try {
    const jwtToken = new JwtToken(process.env.JWT_SECRET);
    decodedToken = jwtToken.verifyToken(token);
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid Access Token" });
  }

  if (!decodedToken || !decodedToken.userId) {
    return res.status(401).json({ message: "Invalid Access Token" });
  }

  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};

export default authenticateToken;
