import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendEmailVerificationLink,
  sendPasswordResetLink,
  sendVerificationCode,
  sendPasswordResetVerificationCode,
} from "../utils/utils.js";
import SpotifyWebApi from "spotify-web-api-node";

// To check user agent info
const getDevice = (req, res) => {
  console.log(`User-Agent Source: ${req.useragent.source}`);
  console.log(`Is Mobile: ${!req.useragent.isMobile}`);
  console.log(`Is Desktop: ${req.useragent.isDesktop}`);
  console.log(`Is Bot: ${req.useragent.isBot}`);
  res.send(req.useragent.source);
};

// create a new user
// const createUser = async (req, res, next) => {
//   const { first_name, last_name, email, password } = req.body;
//   try {
//     if (!first_name || !last_name || !email || !password) {
//       const err = new Error(
//         "Firstname, Lastname, Email and Password is required"
//       );
//       err.statusCode = 400;
//       return next(err);
//     }

//     // check for valid email adress
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       res.status(400);
//       const err = new Error("Invalid email address");
//       return next(err);
//     }

//     // check for existing user''
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       res.status(400);
//       const err = new Error(
//         "User with this email already exists. Please use a differnt email address"
//       );
//       err.statusCode = 409;
//       return next(err);
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // generate token
//     const token = jwt.sign({ email }, process.env.JWT_SECRET, {
//       expiresIn: "2h",
//     });

//     if (req.useragent.isMobile) {
//       try {
//         const verificationEmailResponse = await sendEmailVerificationLink(
//           email,
//           token,
//           first_name
//         );

//         // send mail - handle err
//         if (verificationEmailResponse.error) {
//           const err = new Error(
//             "Failed to send verification email, please try again later"
//           );
//           err.statusCode = 500;
//           return next(err);
//         }

//         // save to DB
//         const user = await User.create({
//           first_name,
//           last_name,
//           email,
//           password: hashedPassword,
//           verify_token: token,
//           verify_token_expires: Date.now() + 7200000,
//         });
//         // send mail success
//         res.status(201).json({
//           message:
//             "Registered successfully. Please check your mail to verify the account",
//         });
//       } catch (error) {
//         return next(error);
//       }
//     } else {
//       const generatedCode = Math.floor(1000 + Math.random() * 9000);

//       const verificationEmailResponse = await sendVerificationCode(
//         first_name,
//         email,
//         generatedCode
//       );

//       // send mail - handle err
//       if (verificationEmailResponse.error) {
//         console.log(verificationEmailResponse.error);
//         const err = new Error(
//           "Failed to send verification code, please try again later"
//         );
//         err.statusCode = 500;
//         return next(err);
//       }

//       // save to DB
//       const user = await User.create({
//         first_name,
//         last_name,
//         email,
//         password: hashedPassword,
//         otp: generatedCode,
//         otp_expires_in: Date.now() + 7200000,
//       });
//       // send mail success
//       res.status(201).json({
//         message:
//           "Registered successfully. Please check your mail to verify the account",
//       });
//     }

//     // res.status(201).send("User registered successfully");
//   } catch (error) {
//     return next(error);
//   }
// };
const createUser = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    if (!first_name || !last_name || !email || !password) {
      const err = new Error(
        "Firstname, Lastname, Email and Password is required"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Check for valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error("Invalid email address");
      res.status(400);
      return next(err);
    }

    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      const err = new Error(
        "User with this email already exists. Please use a different email address"
      );
      err.statusCode = 409;
      return next(err);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Send verification email
    const verificationEmailResponse = await sendEmailVerificationLink(
      email,
      token,
      first_name
    );

    // Handle email sending error
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send verification email, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    // Save user to DB
    await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      verify_token: token,
      verify_token_expires: Date.now() + 7200000, // 2 hours
    });

    // Respond with success message
    res.status(201).json({
      message:
        "Registered successfully. Please check your email to verify the account",
    });
  } catch (error) {
    return next(error);
  }
};
// const verifyEmail = async (req, res, next) => {
//   try {
//     // Find user based on verification token
//     const user = await User.findOne({ verify_token: req.params.verifyToken });
//     if (!user) {
//       // If user not found
//       return res.status(409).send("Invalid token.");
//     } else if (user.verify_token_expires <= Date.now()) {
//       if (!user.verified) {
//         // Only delete the user if not already verified
//         await user.deleteOne(); // Remove the user
//         return res
//           .status(409)
//           .send("Verification link has expired. Register again.");
//       } else {
//         return res.status(400).send("Please login to continue.");
//       }
//     } else if (user.verified === true) {
//       // If user is already verified
//       return res
//         .status(200)
//         .json({ message: "Email is already verified. Please Login." });
//     } else {
//       // If token is still valid, mark user as verified
//       user.verified = true;
//       await user.save();
//       return res
//         .status(201)
//         .json({ message: "Email is verified. Please Login." });
//     }
//   } catch (error) {
//     return next(error);
//   }
// };

// resend otp

// ... existing code ...

const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verify_token: req.params.verifyToken });

    if (!user) {
      return res.render("email_verified", {
        success: false,
        message: "Invalid verification token.",
      });
    }

    if (user.verify_token_expires <= Date.now()) {
      if (!user.verified) {
        await user.deleteOne();
        return res.render("email_verified", {
          success: false,
          message: "Verification link has expired. Please register again.",
        });
      } else {
        return res.render("email_verified", {
          success: false,
          message: "Please login to continue.",
        });
      }
    }

    if (user.verified) {
      return res.render("email_verified", {
        success: true,
        message: "Email is already verified. Please login.",
      });
    }

    // Verify the user
    user.verified = true;
    await user.save();

    return res.render("email_verified", {
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return next(error);
  }
};

// ... existing code ...
const resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  const generatedCode = Math.floor(1000 + Math.random() * 9000);

  // check for user
  const user = await User.findOne({ email });
  if (user) {
    const verificationEmailResponse = await sendVerificationCode(
      user.first_name,
      user.email,
      generatedCode
    );

    // send mail - handle err
    if (verificationEmailResponse.error) {
      console.log(verificationEmailResponse.error);
      const err = new Error(
        "Failed to send verification code, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    (user.otp = generatedCode), (user.otp_expires_in = Date.now() + 7200000);
    await user.save();
    return res.status(200).json({
      message: "Verification code resent successfully. Please verify",
    });
  }
  res.status(404);
  const err = new Error("User not found. Please register");
  err.statusCode = 404;
  return next(err);
};

// resend otp
const sendPasswordVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  const generatedCode = Math.floor(1000 + Math.random() * 9000);

  // check for user
  const user = await User.findOne({ email });
  if (user) {
    const verificationEmailResponse = await sendPasswordResetVerificationCode(
      user.first_name,
      user.email,
      generatedCode
    );

    // send mail - handle err
    if (verificationEmailResponse.error) {
      console.log(verificationEmailResponse.error);
      const err = new Error(
        "Failed to send password reset verification code, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    (user.reset_password_otp = generatedCode),
      (user.reset_password_otp_expires_in = Date.now() + 7200000);
    await user.save();
    return res.status(200).json({
      message: "Password reset verification code sent successfully.",
    });
  }
  res.status(404);
  const err = new Error("User not found. Please register");
  err.statusCode = 404;
  return next(err);
};

// to verify the code for - new user registration from mobile
const verifyCode = async (req, res, next) => {
  const { email, verificationcode } = req.body;
  console.log(email, verificationcode);
  try {
    const user = await User.findOne({ email, otp: verificationcode });
    if (!user) {
      // If user not found
      return res.status(409).json({ message: "Invalid verification code." });
    }
    if (user.verified) {
      return res
        .status(200)
        .json({ message: "Email is already verified. Please Login." });
    } else {
      user.verified = true;
      await user.save();
      return res
        .status(201)
        .json({ message: "Email is verified. Please Login." });
    }
  } catch (error) {
    return next(error);
  }
};

// reset password from mobile
const resetPasswordFromMobile = async (req, res, next) => {
  const { verificationcode, password } = req.body;
  if (!verificationcode) {
    const err = new Error("Verification code is required");
    err.statusCode = 400;
    return next(err);
  }
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    // find the user by token
    const user = await User.findOne({
      reset_password_otp: verificationcode,
      reset_password_otp_expires_in: { $gt: Date.now() },
    });
    if (!user) {
      const err = new Error(
        "Verification code is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }
    // user found - hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    (user.password = hashedPassword), (user.reset_password_otp = undefined);
    user.reset_password_otp_expires_in = undefined;
    await user.save();
    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error("Email & Password are required");
    err.statusCode = 400;
    return next(err);
  }
  // check for valid email adress
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    const err = new Error("Invalid email address");
    return next(err);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 400;
      return next(err);
    }
    if (!user.verified) {
      const err = new Error(
        "Your account verification is pending. Please verify your email to continue"
      );
      err.statusCode = 409;
      return next(err);
    }

    // check for password match
    const passwordMatched = await bcrypt.compare(password, user.password);
    console.log(passwordMatched);
    if (!passwordMatched) {
      const err = new Error("Invalid email or password");
      err.statusCode = 400;
      return next(err);
    }

    // generate the token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: 2592000,
      }
    );
    user.token = token;
    await user.save();

    // generate spotify token
    const spotifyAPI = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const spotifyCredentials = await spotifyAPI.clientCredentialsGrant();
    const spotifyToken = spotifyCredentials.body;

    // our token exp time
    const expiresIn = 2592000;
    res.status(200).json({ token, spotifyToken, expiresIn });
  } catch (error) {
    return next(error);
  }
};

const generateSpotifyRefreshToken = async (req, res, next) => {
  try {
    // generate spotify token
    const spotifyAPI = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const spotifyCredentials = await spotifyAPI.clientCredentialsGrant();
    const spotifyToken = spotifyCredentials.body;
    res.status(200).json({ spotifyToken });
  } catch (error) {
    const err = new Error("Something went wrong, please try again later");
    err.statusCode = 500;
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    const profileData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      languages: user.languages,
    };

    res.status(200).json({ profileData });
  } catch (error) {
    return next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    if (first_name || last_name) {
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
    }

    if (email && email !== user.email) {
      const userExists = await User.findOne({ email });

      if (userExists) {
        const err = new Error(
          `${email} is already in use, please choose a different one`
        );
        err.statusCode = 409;
        return next(err);
      }
      user.email = email;
    }
    await user.save();
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const updatePreferredLanguage = async (req, res, next) => {
  const { languageIds } = req.body;
  console.log(languageIds);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    user.languages = languageIds;
    await user.save();
    res
      .status(200)
      .json({ message: "Preferred language updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Email not found");
      err.statusCode = 400;
      return next(err);
    }
    // generate token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save token in DB
    user.reset_password_token = token;
    user.reset_password_expires = Date.now() + 7200000;
    await user.save();
    // send mail
    const verificationEmailResponse = await sendPasswordResetLink(
      email,
      token,
      user.first_name
    );
    // handle err
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send password reset link, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }
    res.status(200).json({
      message: "Password reset link sent successfully, please check your email",
    });
  } catch (error) {
    return next(error);
  }
};

// const resetPassword = async (req, res, next) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   if (!token) {
//     const err = new Error("Token is required");
//     err.statusCode = 400;
//     return next(err);
//   }
//   if (!password) {
//     const err = new Error("Password is required");
//     err.statusCode = 400;
//     return next(err);
//   }
//   try {
//     // find the user by token
//     const user = await User.findOne({
//       reset_password_token: token,
//       reset_password_expires: { $gt: Date.now() },
//     });
//     if (!user) {
//       const err = new Error(
//         "Password reset link is invalid or expired, please try again"
//       );
//       err.statusCode = 400;
//       return next(err);
//     }
//     // user found - hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     (user.password = hashedPassword), (user.reset_password_token = undefined);
//     user.reset_password_epxpires = undefined;
//     await user.save();
//     res.status(200).json({
//       message: "Password updated successfully, please login to continue",
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
const resetPassword = async (req, res, next) => {
  const { token } = req.params; // token is passed via URL parameter
  const { password } = req.body;

  if (!token) {
    const err = new Error("Token is required");
    err.statusCode = 400;
    return next(err);
  }
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Find the user by token and check if the reset token has expired
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }, // Check if token is still valid
    });

    // Log the token, current time, and token expiry for debugging
    console.log("Reset Token:", token); // Log the reset token
    console.log("Current Time:", Date.now()); // Log the current time
    console.log("Token Expiry:", user?.reset_password_expires); // Log the token expiry date

    if (!user) {
      console.log("User not found or token expired");

      const err = new Error(
        "Password reset link is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token and expiry
    user.password = hashedPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    // Save the updated user object
    await user.save();

    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error); // Pass any errors to the error-handling middleware
  }
};

const saveSpotifyStory = async (req, res, next) => {
  const { storyId } = req.body;
  if (!storyId) {
    const err = new Error("StoryId is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    if (user.saved_stories.includes(storyId)) {
      return res.status(409).json({ message: "Story already saved" });
    }
    // save story
    user.saved_stories.push(storyId);
    await user.save();
    res.status(200).json({ message: "Story saved successfully" });
  } catch (error) {
    return next(error);
  }
};

const removeSpotifyStory = async (req, res, next) => {
  const { storyId } = req.body;
  if (!storyId) {
    const err = new Error("StoryId is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    const index = user.saved_stories.indexOf(storyId);
    if (index === -1) {
      const err = new Error("Invalid storyId");
      err.statusCode = 404;
      return next(err);
    }
    user.saved_stories.splice(index, 1);
    await user.save();
    res.status(200).json({ message: "Story removed successfully" });
  } catch (error) {
    return next(error);
  }
};

const getSpotifyStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    const stories = user.saved_stories;
    res.status(200).json({ stories });
  } catch (error) {
    return next(error);
  }
};

export {
  createUser,
  verifyEmail,
  loginUser,
  generateSpotifyRefreshToken,
  getUserProfile,
  updateUserProfile,
  updatePreferredLanguage,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveSpotifyStory,
  removeSpotifyStory,
  getSpotifyStories,
  getDevice,
  resendVerificationCode,
  verifyCode,
  sendPasswordVerificationCode,
  resetPasswordFromMobile,
};
