import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionType: {
    type: String,
    enum: ['therapist', 'meditation', 'affirmation'],
    default: 'therapist'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
chatSessionSchema.index({ userId: 1, sessionId: 1 });
chatSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ChatSession', chatSessionSchema);