// import dotenv from "dotenv";
// dotenv.config();
// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";
// import expressAsyncHandler from "express-async-handler";

// const checkToken = expressAsyncHandler(async (req, res, next) => {
//   let token;
//   const authorizationHeader = req.headers.authorization;

//   if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
//     token = authorizationHeader.split(" ")[1];
//     try {
//       const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//       console.log(decodedToken);
//       req.user = await User.findById(decodedToken.userId);

//       const user = await User.findById(decodedToken.userId).select("-password");
//       if (!user) {
//         throw new Error("User not found");
//       }
//       req.user = user; // Attach user to request
//       next();
//     } catch (error) {
//       res.status(401);
//       throw new Error("Not authorized, invalid token");
//     }
//   } else {
//     res.status(401);
//     throw new Error("Not authorized, token is required");
//   }
// });

// export { checkToken };
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";

const checkToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user exists in the database
      const user = await User.findById(decodedToken.userId).select("-password");

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Attach the user object to the request
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, token is required");
  }
});

export { checkToken };
