import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['work', 'shortBreak', 'longBreak'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
    },
    completed: {
      type: Boolean,
      default: false,
    },
    focusScore: {
      type: Number, // 0-100
      min: 0,
      max: 100,
    },
    stressLevel: {
      type: Number, // 0-100
      min: 0,
      max: 100,
    },
    distractionCount: {
      type: Number,
      default: 0,
    },
    tasks: [
      {
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;