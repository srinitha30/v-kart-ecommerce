const User = require("../models/User");


// =========================================================
// GET PROFILE
// GET /api/user/profile
// =========================================================

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};


// =========================================================
// UPDATE PROFILE
// PUT /api/user/profile
// =========================================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      age,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // -------------------------
    // BASIC DETAILS
    // -------------------------

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (age !== undefined && age !== "") {
      user.age = Number(age);
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }


    // -------------------------
    // ADDRESS
    // -------------------------

    const hasAddress =
      addressLine ||
      city ||
      state ||
      pincode;

    if (hasAddress) {

      let defaultAddress =
        user.addresses.find(
          (address) => address.isDefault
        );

      if (!defaultAddress) {

        defaultAddress = {
          fullName: user.name,
          phone: user.phone || "",
          addressLine: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: true,
        };

        user.addresses.push(defaultAddress);

        defaultAddress =
          user.addresses[
            user.addresses.length - 1
          ];
      }

      defaultAddress.fullName =
        user.name;

      defaultAddress.phone =
        phone !== undefined
          ? phone.trim()
          : user.phone || "";

      defaultAddress.addressLine =
        addressLine !== undefined
          ? addressLine.trim()
          : defaultAddress.addressLine;

      defaultAddress.city =
        city !== undefined
          ? city.trim()
          : defaultAddress.city;

      defaultAddress.state =
        state !== undefined
          ? state.trim()
          : defaultAddress.state;

      defaultAddress.pincode =
        pincode !== undefined
          ? pincode.trim()
          : defaultAddress.pincode;
    }


    await user.save();

    const updatedUser =
      await User.findById(userId)
        .select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
};