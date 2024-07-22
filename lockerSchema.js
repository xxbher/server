const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doorSchema = new Schema(
  {
    board: { type: String, required: true },
    channel: { type: String, required: true },
    door_number: { type: String, required: true },
    door_size: { type: String, required: true },
    door_status: { type: String, required: true },
    door_state: { type: String },
    quick_pin: { type: String, default: "" },
    reference_number: { type: String, default: "" },
    service: [{ type: String }],
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    service_status: { type: String },

    service_name: { type: String },
    updateAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const columnSchema = new Schema(
  {
    doors: [doorSchema],
  },
  { _id: false }
);

const doorGroupSchema = new Schema(
  {
    columns: [columnSchema],
  },
  { _id: false }
);

const lockerSchema = new Schema({
  lockerID: { type: String, required: true },
  location_name: { type: String, required: true },
  location_code: { type: String, required: true },
  locker_status: Boolean,
  location_controller_status: { type: String, required: true },
  locker_status: Boolean,
  locker_controller_status: Boolean,
  service: [serviceSchema],
  doorGroup: { type: Map, of: doorGroupSchema },
  Created_At: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Locker", lockerSchema);
