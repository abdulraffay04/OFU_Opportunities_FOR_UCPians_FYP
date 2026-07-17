// fieldKeywords.js
// This file maps common UCP degree names to arrays of related keywords.
// It is used by the "Recommended for You" feature to match students
// with relevant opportunities based on their degree/field.

// Each key is a degree group name.
// Each value is an array of keywords related to that field.
const DEGREE_FIELD_KEYWORDS = {
  'Computer Science': [
    'computer science', 'cs', 'bscs',
    'software', 'programming', 'developer', 'it',
    'information technology', 'web', 'mobile app',
    'data science', 'ai', 'machine learning', 'tech',
    'technology', 'network', 'cyber security',
  ],

  'Software Engineering': [
    'software engineering', 'bsse',
    'software', 'developer', 'programming', 'web',
    'mobile app', 'it', 'technology',
  ],

  'Business Administration': [
    'bba', 'business administration', 'business',
    'marketing', 'finance', 'management', 'sales',
    'hr', 'human resource', 'accounting', 'commerce',
    'banking', 'entrepreneur',
  ],

  'Pharmacy': [
    'pharmacy', 'pharm-d', 'pharmaceutical',
    'medicine', 'drug', 'clinical', 'healthcare',
    'medical', 'hospital', 'health',
  ],

  'Electrical Engineering': [
    'electrical engineering', 'bsee',
    'electrical', 'electronics', 'power',
    'circuit', 'embedded', 'hardware',
  ],

  'Mechanical Engineering': [
    'mechanical engineering', 'bsme',
    'mechanical', 'manufacturing', 'automotive',
    'design engineer',
  ],

  'English': [
    'english', 'literature', 'content writer',
    'writing', 'editor', 'communication', 'linguistics',
  ],

  'Mass Communication': [
    'mass communication', 'media', 'journalism',
    'broadcasting', 'content', 'social media',
    'marketing', 'pr', 'public relations',
  ],
};

// Detect which field keywords match a student's department text.
// For example, if department is "BS Computer Science", this returns
// the Computer Science keywords array.
// Returns an empty array if no match or empty input.
function detectFieldKeywords(departmentText) {
  // If no department text provided, return empty array
  if (!departmentText) {
    return [];
  }

  // Convert to lowercase and trim whitespace
  var lowerDept = departmentText.toLowerCase().trim();

  // Loop through each degree group
  var groupNames = Object.keys(DEGREE_FIELD_KEYWORDS);

  for (var i = 0; i < groupNames.length; i++) {
    var groupName = groupNames[i];
    var keywords = DEGREE_FIELD_KEYWORDS[groupName];

    // Check if any keyword from this group appears inside the department text
    // OR if the department text appears inside the group name
    for (var j = 0; j < keywords.length; j++) {
      var keyword = keywords[j];

      // Check both directions for a match
      if (lowerDept.includes(keyword) || keyword.includes(lowerDept)) {
        // Found a match — return this group's keywords
        return keywords;
      }
    }

    // Also check if the group name itself matches the department text
    if (lowerDept.includes(groupName.toLowerCase()) || groupName.toLowerCase().includes(lowerDept)) {
      return keywords;
    }
  }

  // No match found after checking all groups
  return [];
}

module.exports = {
  DEGREE_FIELD_KEYWORDS,
  detectFieldKeywords,
};
