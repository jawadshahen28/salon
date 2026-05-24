import jwt from 'jsonwebtoken';

const getAdminUser = () => ({
  id: 'env-admin',
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL,
  role: 'admin'
});

const generateToken = () => {
  return jwt.sign({ id: 'env-admin', role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        success: false,
        message: 'Admin login credentials are missing from .env'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password'
      });
    }

    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: generateToken(),
      user: getAdminUser()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

export const verifyDashboardPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        message: 'Admin password is missing from .env'
      });
    }

    if (!password || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'كلمة السر غير صحيحة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تأكيد كلمة السر'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
