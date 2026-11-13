import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Create reusable transporter object using ethereal or default SMTP
const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email if no credentials
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) return 'Password must be at least 8 characters long';
  if (!hasUpper) return 'Password must contain at least one uppercase letter';
  if (!hasDigit) return 'Password must contain at least one digit';
  if (!hasSpecial) return 'Password must contain at least one special character';
  return null;
};

const generateOTP = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
};

export const register = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please verify MongoDB connection in server/.env' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      } else {
        // Unverified user trying to register again - we will update their password and OTP
        await User.deleteOne({ email });
      }
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: false,
      otp,
      otpExpires
    });

    // Send email
    try {
      const transporter = await getTransporter();
      const fromEmail = process.env.SMTP_USER || 'noreply@nexusai.com';
      const info = await transporter.sendMail({
        from: `"NexusAI" <${fromEmail}>`,
        to: email,
        subject: 'Your NexusAI Verification Code',
        text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your verification code is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`,
      });

      console.log('Message sent: %s', info.messageId);
      // Ethereal URL will only be available if using ethereal
      const etherealUrl = nodemailer.getTestMessageUrl(info);
      if (etherealUrl) {
        console.log('Preview URL: %s', etherealUrl);
      }
      
      res.status(201).json({
        message: 'Registration initiated. Please check your email for the OTP.',
        requireOtp: true,
        previewUrl: etherealUrl || null
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      await User.deleteOne({ _id: user._id }); // Rollback user creation
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    await User.findOneAndUpdate(
      { email },
      { isVerified: true, $unset: { otp: 1, otpExpires: 1 } }
    );

    res.status(200).json({
      message: 'Email verified successfully. You can now log in.'
    });

  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No registration found for this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { otp, otpExpires }
    );

    try {
      const transporter = await getTransporter();
      const fromEmail = process.env.SMTP_USER || 'noreply@nexusai.com';
      await transporter.sendMail({
        from: `"NexusAI" <${fromEmail}>`,
        to: email,
        subject: 'Your NexusAI Verification Code',
        text: `Your new verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your new verification code is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`,
      });

      res.status(200).json({ message: 'A new OTP has been sent to your email' });
    } catch (emailError) {
      console.error('Error resending email:', emailError);
      return res.status(500).json({ message: 'Failed to resend verification email' });
    }

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please verify MongoDB connection in server/.env' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        totalUsage: user.totalUsage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      totalUsage: req.user.totalUsage,
      createdAt: req.user.createdAt,
      avatar: req.user.avatar
    }
  });
};

export const googleAuth = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please verify MongoDB connection in server/.env' });
    }

    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No Google token provided' });
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google credential' });
    }

    const payload = await response.json();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Could not retrieve email from Google' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        await User.findOneAndUpdate(
          { email },
          { googleId, isVerified: true, ...(picture && { avatar: picture }) }
        );
        user = await User.findOne({ email });
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
        avatar: picture
      });
    }

    const jwtToken = signToken(user._id);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        totalUsage: user.totalUsage,
        createdAt: user.createdAt,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // If user has a Google ID and no password, they shouldn't reset password
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This email is linked to a Google account. Please log in with Google.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findOneAndUpdate(
      { email },
      { otp, otpExpires }
    );

    try {
      const transporter = await getTransporter();
      const fromEmail = process.env.SMTP_USER || 'noreply@nexusai.com';
      await transporter.sendMail({
        from: `"NexusAI" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Verification Code',
        text: `Your password reset code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your password reset code is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`,
      });

      res.status(200).json({ message: 'A verification code has been sent to your email' });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save(); // using .save() triggers the pre-save hook to hash the password

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
