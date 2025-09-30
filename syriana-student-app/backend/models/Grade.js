const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide student ID']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID']
  },
  grade: {
    type: String,
    required: [true, 'Please provide grade'],
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W', 'I'],
    uppercase: true
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
  credits: {
    type: Number,
    required: [true, 'Please provide credits'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot be more than 6']
  },
  gradePoint: {
    type: Number,
    min: [0, 'Grade point cannot be negative'],
    max: [4, 'Grade point cannot be more than 4.0']
  },
  comments: {
    type: String,
    maxlength: [500, 'Comments cannot be more than 500 characters']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide who graded this']
  },
  gradedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique grade per student per course per semester/year
gradeSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

// Pre-save middleware to calculate grade point
gradeSchema.pre('save', function(next) {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0,
    'W': 0.0, 'I': 0.0
  };

  this.gradePoint = gradePoints[this.grade] || 0.0;
  next();
});

// Static method to calculate GPA for a student
gradeSchema.statics.calculateGPA = async function(studentId) {
  const grades = await this.find({ student: studentId });
  if (grades.length === 0) return 0;

  let totalCredits = 0;
  let totalPoints = 0;

  grades.forEach(grade => {
    totalCredits += grade.credits;
    totalPoints += grade.gradePoint * grade.credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

module.exports = mongoose.model('Grade', gradeSchema);