import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";

const checkToken = expressAsyncHandler(async (req, res, next) => {
  let token;

  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];
    console.log(token);

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedToken);
      req.user = await User.findById(decodedToken.userId);
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Invalid Token");
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized");
  }
});

export { checkToken };
