import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'NEX-' + Math.floor(100000 + Math.random() * 900000)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reporterName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    reporterEmail: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true
    },
    toolName: {
      type: String,
      required: [true, 'Please specify the affected tool'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select an issue category'],
      enum: [
        'Model / Generation Error',
        'Rate Limit / Cooldown',
        'Incorrect / Poor Quality Output',
        'UI / Formatting Glitch',
        'File Upload / Processing Failure',
        'Performance / High Latency',
        'Crash / Unresponsive',
        'Feature Request / Suggestion',
        'Other'
      ],
      default: 'Model / Generation Error'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical / Blocker'],
      default: 'Medium'
    },
    title: {
      type: String,
      required: [true, 'Please provide a brief summary of the issue'],
      trim: true,
      maxlength: 150
    },
    errorMessage: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Please describe what happened and how to reproduce it'],
      trim: true
    },
    promptOrInput: {
      type: String,
      trim: true,
      default: ''
    },
    screenshot: {
      url: { type: String, default: '' },
      mimetype: { type: String, default: '' },
      size: { type: Number, default: 0 },
      filename: { type: String, default: '' }
    },
    browserInfo: {
      type: String,
      default: ''
    },
    osInfo: {
      type: String,
      default: ''
    },
    currentUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'Resolved', 'Closed'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
