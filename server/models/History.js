import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  toolType: {
    type: String,
    required: true,
    enum: ['code-review', 'resume-optimize', 'content-generate', 'content-studio', 'summarize', 'sql-generate']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ userId: 1, toolType: 1 });

export default mongoose.model('History', historySchema);
