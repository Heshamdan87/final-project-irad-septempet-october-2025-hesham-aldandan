const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Please provide course code'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide course description'],
    maxlength: [500, 'Course description cannot be more than 500 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Please provide course credits'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot be more than 6']
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    enum: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'History',
      'Psychology',
      'Business',
      'Engineering'
    ]
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    room: {
      type: String,
      required: [true, 'Please provide room number']
    }
  },
  semester: {
    type: String,
    required: [true, 'Please provide semester'],
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: [true, 'Please provide academic year'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year cannot be more than 2030']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide course capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot be more than 100']
  },
  enrollmentStart: {
    type: Date,
    required: [true, 'Please provide enrollment start date']
  },
  enrollmentEnd: {
    type: Date,
    required: [true, 'Please provide enrollment end date']
  },
  courseStart: {
    type: Date,
    required: [true, 'Please provide course start date']
  },
  courseEnd: {
    type: Date,
    required: [true, 'Please provide course end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  syllabus: {
    type: String, // URL to syllabus file
  },
  materials: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


courseSchema.virtual('enrolledCount').get(function() {
  return this.students ? this.students.length : 0;
});


courseSchema.virtual('availableSpots').get(function() {
  return this.capacity - (this.students ? this.students.length : 0);
});


courseSchema.virtual('durationWeeks').get(function() {
  if (this.courseStart && this.courseEnd) {
    const diffTime = Math.abs(this.courseEnd - this.courseStart);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }
  return 0;
});


courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ semester: 1, year: 1 });
courseSchema.index({ isActive: 1 });


courseSchema.pre('save', function(next) {
  if (this.enrollmentEnd <= this.enrollmentStart) {
    return next(new Error('Enrollment end date must be after enrollment start date'));
  }
  if (this.courseEnd <= this.courseStart) {
    return next(new Error('Course end date must be after course start date'));
  }
  if (this.courseStart < this.enrollmentEnd) {
    return next(new Error('Course start date should be after enrollment end date'));
  }
  next();
});


courseSchema.statics.getAvailableCourses = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    enrollmentStart: { $lte: now },
    enrollmentEnd: { $gte: now }
  });
};

module.exports = mongoose.model('Course', courseSchema);


