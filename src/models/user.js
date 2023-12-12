const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 100, unique: true },
  email: { type: String, required: true, maxLength: 100, unique: true },
  password: { type: String, required: true },
  memberStatus: {
    type: String,
    required: true,
    enum: ['member', 'creator', 'admin'],
    default: 'member',
  },
  createdAt: { type: Date, default: Date.now },
  updatedUsernameAt: { type: Date, default: Date.now },
  updatedEmailAt: { type: Date, default: Date.now },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Spots' }],
  windUnits: {
    type: String,
    enum: ['kts', 'bft', 'mps', 'kph', 'mph'],
    default: 'kts',
  },
});

// eslint-disable-next-line func-names
UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// eslint-disable-next-line func-names
UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
};

module.exports = mongoose.model('User', UserSchema);
