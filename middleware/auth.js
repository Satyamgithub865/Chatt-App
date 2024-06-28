export const isLogin = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

export const isLogout = async (req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    res.redirect("/dashboard");
  }
};
