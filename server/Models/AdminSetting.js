const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    theme: { type: String, enum: ['Light', 'Dark'], default: 'Light' },
    security: {
      requireBackupConfirmation: { type: Boolean, default: true },
      securityCodeHash: { type: String, default: '' },
      updatedAt: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.AdminSetting || mongoose.model('AdminSetting', adminSettingSchema);
